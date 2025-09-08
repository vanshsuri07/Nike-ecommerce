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
  if (!cartId) {
    throw new Error('Cart ID not found in Stripe session metadata');
  }

  const cart = await getCart(cartId);
  if (!cart) {
    throw new Error(`Cart with id ${cartId} not found`);
  }

  let userIdToUse = userId || session.metadata?.userId;
  let user;

  if (userIdToUse) {
    user = await db.query.user.findFirst({
      where: eq(schema.user.id, userIdToUse),
      with: {
        addresses: true,
      },
    });
    if (!user) {
      throw new Error(`User with id ${userIdToUse} not found`);
    }
  } else {
    // Handle guest checkout
    const customerEmail = session.customer_details?.email;
    if (!customerEmail) {
      throw new Error('Customer email not found in Stripe session for guest checkout.');
    }

    const existingGuestUser = await db.query.user.findFirst({
      where: eq(schema.user.email, customerEmail),
      with: {
        addresses: true,
      }
    });

    if (existingGuestUser) {
      user = existingGuestUser;
    } else {
      const [newUser] = await db.insert(schema.user).values({
        email: customerEmail,
        name: session.customer_details?.name || 'Guest User',
      }).returning();
      user = { ...newUser, addresses: [] };
    }
    userIdToUse = user.id;
  }

  let shippingAddress;
  let billingAddress;

  const stripeShippingAddress = session.shipping_details?.address;

  if (user.addresses.length > 0) {
    // Existing user with addresses
    shippingAddress = user.addresses.find(a => a.type === 'shipping' && a.isDefault) || user.addresses.find(a => a.type === 'shipping');
    billingAddress = user.addresses.find(a => a.type === 'billing' && a.isDefault) || user.addresses.find(a => a.type === 'billing');

    if (!shippingAddress) shippingAddress = user.addresses[0];
    if (!billingAddress) billingAddress = user.addresses[0];

  } else if (stripeShippingAddress) {
    // Guest user or existing user with no addresses - create new address from Stripe info
    const [newAddress] = await db.insert(schema.addresses).values({
      userId: userIdToUse,
      type: 'shipping', // Assume shipping, as it comes from shipping_details
      line1: stripeShippingAddress.line1!,
      line2: stripeShippingAddress.line2,
      city: stripeShippingAddress.city!,
      state: stripeShippingAddress.state!,
      country: stripeShippingAddress.country!,
      postalCode: stripeShippingAddress.postal_code!,
      isDefault: true,
    }).returning();
    shippingAddress = newAddress;
    billingAddress = newAddress; // Use the same for billing
  }

  if (!shippingAddress || !billingAddress) {
    throw new Error(`Could not determine shipping or billing address for user ${userIdToUse}`);
  }

  const orderValues = {
    totalAmount: ((session.amount_total ?? 0) / 100).toString(),
    status: 'paid',
    stripePaymentIntentId: paymentIntentId,
    stripeSessionId: stripeSessionId,
    userId: userIdToUse,
    shippingAddressId: shippingAddress.id,
    billingAddressId: billingAddress.id,
  };

  const [newOrder] = await db
    .insert(schema.orders)
    .values(orderValues)
    .returning();

  const orderItems = cart.items.map((item) => ({
    orderId: newOrder.id,
    productVariantId: item.productVariantId,
    quantity: item.quantity,
    priceAtPurchase: item.productVariant.price,
  }));

  await db.insert(schema.orderItems).values(orderItems);
  await clearCart(cartId);

  // Return the full order with items
  const fullOrder = await db.query.orders.findFirst({
    where: eq(schema.orders.id, newOrder.id),
    with: {
      items: true,
    },
  });

  return fullOrder;
}

export async function getOrderByStripeSessionId(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  
  const paymentIntentId = session.payment_intent as string;

  if (!paymentIntentId) {
    return null;
  }

  const order = await db.query.orders.findFirst({
   where: eq(schema.orders.stripeSessionId, sessionId),
    with: {
      items: true,
    }
  });

  return order;
}

export async function fulfillOrder(sessionId: string) {
  const order = await getOrderByStripeSessionId(sessionId);

  if (order) {
    return order;
  }

  return createOrder(sessionId);
}
