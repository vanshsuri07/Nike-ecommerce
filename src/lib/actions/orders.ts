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

const [newOrder] = await db
  .insert(schema.orders)
  .values({
    userId: userId || sessionUserId || '', // Use provided userId or session userId
    totalAmount: ((session.amount_total ?? 0) / 100).toString(), // ✅ convert cents to dollars
    status: 'paid',
    stripePaymentIntentId: paymentIntentId,
    shippingAddressId: '', // Add required field - update with actual address ID
    billingAddressId: '', // Add required field - update with actual address ID
  })
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
  const paymentIntentId = session.payment_intent as string;

  const order = db.query.orders.findFirst({
    where: eq(schema.orders.stripePaymentIntentId, paymentIntentId),
    with: {
      items: {
        with: {
          productVariant: {
            with: {
              product: {
                with: {
                  images: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return order;
}
