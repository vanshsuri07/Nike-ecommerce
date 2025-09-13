'use server';

import { db } from '@/db';
import * as schema from '@/lib/db/schema';
import { stripe } from '@/lib/stripe/client';
import { eq } from 'drizzle-orm';
import { clearCart, getCart } from './cart';

export async function createOrder(
  stripeSessionId: string,
  userId?: string,
) {
  console.log('Creating order for session:', stripeSessionId);
  
  const session = await stripe.checkout.sessions.retrieve(stripeSessionId, {
    expand: ['line_items.data.price.product', 'customer'],
  });

  if (!session) {
    throw new Error('Stripe session not found');
  }

  console.log('Session retrieved:', session.id, session.payment_status);

  const paymentIntentId = session.payment_intent as string;

  // First check if order already exists by session ID (primary check)
  const existingOrderBySession = await db.query.orders.findFirst({
    where: eq(schema.orders.stripeSessionId, stripeSessionId),
  });

  if (existingOrderBySession) {
    console.log(`Order already exists for session: ${stripeSessionId}`);
    return existingOrderBySession;
  }

  // Secondary check by payment intent ID
  if (paymentIntentId) {
    const existingOrderByPayment = await db.query.orders.findFirst({
      where: eq(schema.orders.stripePaymentIntentId, paymentIntentId),
    });

    if (existingOrderByPayment) {
      console.log(`Order already exists for payment intent: ${paymentIntentId}`);
      return existingOrderByPayment;
    }
  }

  const cartId = session.metadata?.cartId;
  const sessionUserId = session.metadata?.userId;

  if (!cartId) {
    throw new Error('Cart ID not found in Stripe session metadata');
  }

  console.log('Getting cart:', cartId);
  const cart = await getCart(cartId);

  if (!cart) {
    throw new Error(`Cart with id ${cartId} not found`);
  }

  // Extract customer data from Stripe session
  const customerEmail = session.customer_details?.email || 'unknown@example.com';
  const customerName = session.customer_details?.name || 'Unknown Customer';
  
  console.log('Customer details:', { customerEmail, customerName });
  
  // Get shipping details
  const shippingDetails = (session as any).shipping_details;
  const billingDetails = session.customer_details;

  // Create or find user with real email
  let realUser = await db.query.user.findFirst({
    where: eq(schema.user.email, customerEmail),
  });

  if (!realUser) {
    console.log('Creating new user:', customerEmail);
    [realUser] = await db.insert(schema.user).values({
      email: customerEmail,
      name: customerName,
      emailVerified: null,
    }).returning();
  }

  // Create shipping address from Stripe data
  let shippingAddress;
  if (shippingDetails?.address) {
    const shippingAddr = shippingDetails.address;
    [shippingAddress] = await db.insert(schema.addresses).values({
      userId: realUser.id,
      type: 'shipping',
      line1: shippingAddr.line1 || 'Address not provided',
      line2: shippingAddr.line2,
      city: shippingAddr.city || 'Unknown',
      state: shippingAddr.state || 'Unknown',
      country: shippingAddr.country || 'US',
      postalCode: shippingAddr.postal_code || '00000',
    }).returning();
  } else {
    // Fallback to a default address if no shipping info
    [shippingAddress] = await db.insert(schema.addresses).values({
      userId: realUser.id,
      type: 'shipping',
      line1: 'Address not provided',
      city: 'Unknown',
      state: 'Unknown',
      country: 'US',
      postalCode: '00000',
    }).returning();
  }

  // Create billing address from Stripe data
  let billingAddress;
  if (billingDetails?.address) {
    const billingAddr = billingDetails.address;
    [billingAddress] = await db.insert(schema.addresses).values({
      userId: realUser.id,
      type: 'billing',
      line1: billingAddr.line1 || 'Address not provided',
      line2: billingAddr.line2,
      city: billingAddr.city || 'Unknown',
      state: billingAddr.state || 'Unknown',
      country: billingAddr.country || 'US',
      postalCode: billingAddr.postal_code || '00000',
    }).returning();
  } else {
    // Use shipping address as billing address if no separate billing info
    billingAddress = shippingAddress;
  }

  const finalUserId = userId || sessionUserId || realUser.id;
  if (!finalUserId) {
    throw new Error('User ID not found');
  }

  const orderValues = {
    totalAmount: ((session.amount_total ?? 0) / 100).toString(),
    status: 'paid' as const,
    stripePaymentIntentId: paymentIntentId,
    stripeSessionId: stripeSessionId, // Make sure this is set
    shippingAddressId: shippingAddress.id,
    billingAddressId: billingAddress.id,
    userId: realUser.id,
  };

  console.log('Creating order with values:', orderValues);

  const [newOrder] = await db
    .insert(schema.orders)
    .values(orderValues)
    .returning();

  console.log('Order created:', newOrder.id);

  const orderItems = cart.items.map((item) => ({
    orderId: newOrder.id,
    productVariantId: item.productVariantId,
    quantity: item.quantity,
    priceAtPurchase: item.productVariant.price
  }));

  await db.insert(schema.orderItems).values(orderItems);
  console.log('Order items created:', orderItems.length);

  await clearCart(cartId);
  console.log('Cart cleared:', cartId);

  return newOrder;
}

export async function getOrderByStripeSessionId(sessionId: string) {
  console.log('Looking for order with session ID:', sessionId);
  
  try {
    // First try to get the order directly by session ID
    const order = await db.query.orders.findFirst({
      where: eq(schema.orders.stripeSessionId, sessionId),
      with: {
        user: true,
        shippingAddress: true,
        billingAddress: true,
        items: {
          with: {
            productVariant: {
              with: {
                product: true,
              }
            }
          }
        }
      }
    });

    if (order) {
      console.log('Found order by session ID:', order.id);
      return order;
    }

    console.log('No order found by session ID, trying payment intent...');
    
    // If not found, try to retrieve the session and check by payment intent
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log('Session payment_intent:', session.payment_intent);
    console.log('Session status:', session.status);
    console.log('Session payment_status:', session.payment_status);
    
    const paymentIntentId = session.payment_intent as string;

    if (!paymentIntentId) {
      console.log('No payment intent found in session');
      return null;
    }

    const orderByPaymentIntent = await db.query.orders.findFirst({
      where: eq(schema.orders.stripePaymentIntentId, paymentIntentId),
      with: {
        user: true,
        shippingAddress: true,
        billingAddress: true,
        items: {
          with: {
            productVariant: {
              with: {
                product: true,
              }
            }
          }
        }
      }
    });

    console.log('Found order by payment intent:', !!orderByPaymentIntent);
    return orderByPaymentIntent;
    
  } catch (error) {
    console.error('Error in getOrderByStripeSessionId:', error);
    return null;
  }
}

export async function getOrder(sessionId: string) {
  console.log('Getting order for session:', sessionId);
  
  // First try to get existing order
  const existingOrder = await getOrderByStripeSessionId(sessionId);

  if (existingOrder) {
    console.log('Found existing order:', existingOrder.id);
    return existingOrder;
  }

  console.log('No existing order found, creating new one...');
  
  // If no existing order, create one
  try {
    const newOrder = await createOrder(sessionId);
    console.log('Created new order:', newOrder.id);
    
    // Return the order with full relations
    const fullOrder = await db.query.orders.findFirst({
      where: eq(schema.orders.id, newOrder.id),
      with: {
        user: true,
        shippingAddress: true,
        billingAddress: true,
       items: {
          with: {
            productVariant: {
              with: {
                product: true,
              }
            }
          }
        }
      }
    });
    
    return fullOrder;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}