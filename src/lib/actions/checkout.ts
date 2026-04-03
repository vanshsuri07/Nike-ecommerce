'use server';

import { stripe } from '@/lib/stripe/client';
import { getCart } from './cart';
import { getCurrentUser } from '../auth/actions';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export async function createStripeCheckoutSession() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/sign-in?redirect_url=/cart');
  }

  const cart = await getCart();

  if (!cart || cart.items.length === 0) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('❌ [CHECKOUT] Cart is empty or not found');
    }
    throw new Error('Cart is empty');
  }

  const headersList = await headers();
  const origin = headersList.get('origin');

  const line_items = cart.items.map((item) => {
    const imageUrls = item.productVariant.product.images.map((img) =>
      img.url.startsWith('http') ? img.url : `${origin}${img.url}`
    );

    return {
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.productVariant.product.name,
          images: imageUrls,
        },
        unit_amount: Math.round(parseFloat(item.productVariant.price) * 100),
      },
      quantity: item.quantity,
    };
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items,
    mode: 'payment',
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/cart`,
    billing_address_collection: 'required',
    shipping_address_collection: {
      allowed_countries: ['US', 'CA', 'GB', 'AU', 'IN'],
    },
    ...(user ? { customer_email: user.email } : {}),
    metadata: {
      cartId: cart.id,
      userId: user?.id ?? null,
    },
  });

  if (!session.url) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('❌ [CHECKOUT] No redirect URL from Stripe');
    }
    throw new Error('Failed to create Stripe checkout session');
  }

  redirect(session.url);
}