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
  const session = await stripe.checkout.sessions.retrieve(stripeSessionId, {
    expand: ['line_items.data.price.product', 'customer'],
    
  });

  if (!session) {
    throw new Error('Stripe session not found');
  }

  const paymentIntentId = session.payment_intent as string;

  const existingOrder = await db.query.orders.findFirst({
    where: eq(schema.orders.stripePaymentIntentId, paymentIntentId),
  });

  if (existingOrder) {
    console.log(`Order already exists for payment intent: ${paymentIntentId}`);
    return existingOrder;
  }

  const cartId = session.metadata?.cartId;
  const sessionUserId = session.metadata?.userId;

  if (!cartId) {
    throw new Error('Cart ID not found in Stripe session metadata');
  }

  const cart = await getCart(cartId);

  if (!cart) {
    throw new Error(`Cart with id ${cartId} not found`);
  }

  // Extract customer data from Stripe session
  const customer = session.customer;
  const customerEmail = session.customer_details?.email || 'unknown@example.com';
  const customerName = session.customer_details?.name || 'Unknown Customer';
  
  // Get shipping details
  const shippingDetails = (session as any).shipping_details;
  const billingDetails = session.customer_details;

  // Create or find user with real email
  let realUser = await db.query.user.findFirst({
    where: eq(schema.user.email, customerEmail),
  });

  if (!realUser) {
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
  stripeSessionId: stripeSessionId,
  shippingAddressId: shippingAddress.id,
  billingAddressId: billingAddress.id,
  userId: realUser.id, // ✅ Change from finalUserId to realUser.id
};

  const [newOrder] = await db
    .insert(schema.orders)
    .values(orderValues)
    .returning();

  const orderItems = cart.items.map((item) => ({
    orderId: newOrder.id,
    productVariantId: item.productVariantId,
    quantity: item.quantity,
    priceAtPurchase: item.productVariant.price
  }));

  await db.insert(schema.orderItems).values(orderItems);

  await clearCart(cartId);

  return newOrder;
}