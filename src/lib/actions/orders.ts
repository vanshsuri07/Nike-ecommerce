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
    expand: ['line_items.data.price.product', 'customer', 'shipping_details'],
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
  const finalUserId = userId || sessionUserId;

  if (!cartId) {
    throw new Error('Cart ID not found in Stripe session metadata');
  }

  if (!finalUserId) {
    throw new Error('User ID not found in Stripe session metadata');
  }

  const cart = await getCart(cartId);

  if (!cart) {
    throw new Error(`Cart with id ${cartId} not found`);
  }

  const shippingDetails = session.shipping_details;
  if (!shippingDetails?.address) {
    throw new Error('Shipping address not found in Stripe session');
  }

  const [newAddress] = await db.insert(schema.addresses).values({
    userId: finalUserId,
    type: 'shipping',
    line1: shippingDetails.address.line1!,
    line2: shippingDetails.address.line2,
    city: shippingDetails.address.city!,
    state: shippingDetails.address.state!,
    country: shippingDetails.address.country!,
    postalCode: shippingDetails.address.postal_code!,
  }).returning();

const orderValues: any = {
  totalAmount: ((session.amount_total ?? 0) / 100).toString(),
  status: 'paid',
  stripePaymentIntentId: paymentIntentId,
  stripeSessionId: stripeSessionId,
  shippingAddressId: newAddress.id,
  billingAddressId: newAddress.id,
  userId: finalUserId,
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
