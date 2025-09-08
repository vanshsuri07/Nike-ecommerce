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

  const userIdToUse = userId || sessionUserId;
  if (!userIdToUse) {
    throw new Error('User ID not found in Stripe session metadata');
  }

  const user = await db.query.user.findFirst({
    where: eq(schema.user.id, userIdToUse),
    with: {
      addresses: true,
    },
  });

  if (!user) {
    throw new Error(`User with id ${userIdToUse} not found`);
  }

  // Find default shipping address, or fallback to the first shipping address.
  let shippingAddress = user.addresses.find(
    (a) => a.type === 'shipping' && a.isDefault,
  );
  if (!shippingAddress) {
    shippingAddress = user.addresses.find((a) => a.type === 'shipping');
  }

  // Find default billing address, or fallback to the first billing address.
  let billingAddress = user.addresses.find(
    (a) => a.type === 'billing' && a.isDefault,
  );
  if (!billingAddress) {
    billingAddress = user.addresses.find((a) => a.type === 'billing');
  }

  // As a last resort, if no typed addresses are found, use the first available address for both.
  if (!shippingAddress) {
    shippingAddress = user.addresses[0];
  }
  if (!billingAddress) {
    billingAddress = user.addresses[0];
  }

  if (!shippingAddress || !billingAddress) {
    throw new Error(`Shipping or billing address not found for user ${userIdToUse}`);
  }

  const orderValues: any = {
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
    priceAtPurchase: item.productVariant.price

  }));

  await db.insert(schema.orderItems).values(orderItems);

  await clearCart(cartId);

  return newOrder;
}

export async function getOrderByStripeSessionId(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  console.log('Session payment_intent:', session.payment_intent);
  console.log('Session status:', session.status);
  console.log('Session payment_status:', session.payment_status);
  
  const paymentIntentId = session.payment_intent as string;

  if (!paymentIntentId) {
    console.log('No payment intent found in session');
    return null;
  }

  const allOrders = await db.select({ 
  id: schema.orders.id, 
  stripePaymentIntentId: schema.orders.stripePaymentIntentId 
}).from(schema.orders).limit(5);
console.log('All orders in DB:', allOrders);

  const order = await db.query.orders.findFirst({
   where: eq(schema.orders.stripeSessionId, sessionId),
    // ... rest of your query
  });

  console.log('Found order:', !!order);
  return order;
}

export async function fulfillOrder(sessionId: string) {
  const order = await getOrderByStripeSessionId(sessionId);

  if (order) {
    return order;
  }

  return createOrder(sessionId);
}
