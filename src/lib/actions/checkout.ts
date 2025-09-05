'use server';

import { stripe } from '@/lib/stripe/client';
import { getCart } from './cart';
import { getCurrentUser } from '../auth/actions';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export async function createStripeCheckoutSession() {
  const user = await getCurrentUser();
  const cart = await getCart();

  if (!cart || cart.items.length === 0) {
    throw new Error('Cart is empty');
  }

  const line_items = cart.items.map((item) => {
    return {
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.productVariant.product.name,
          images: item.productVariant.product.images.map((img) => img.url),
        },
        unit_amount: Math.round(parseFloat(item.productVariant.price) * 100),
      },
      quantity: item.quantity,
    };
  });

  const origin = headers().get('origin')!;
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items,
    mode: 'payment',
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/cart`,
    ...(user ? { customer_email: user.email } : {}),
    metadata: {
      cartId: cart.id,
      userId: user?.id ?? null,
    },
  });

  if (!session.url) {
    throw new Error('Failed to create Stripe checkout session');
  }

  redirect(session.url);
}
