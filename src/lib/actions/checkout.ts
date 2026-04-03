'use server';

import { stripe } from '@/lib/stripe/client';
import { getCart } from './cart';
import { getCurrentUser } from '../auth/actions';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export async function createStripeCheckoutSession() {
  console.log('💳 [CHECKOUT] Starting checkout process...');
  
  console.log('👤 [CHECKOUT] Getting current user...');
  const user = await getCurrentUser();
  console.log('🔍 [CHECKOUT] Current user result:', {
    hasUser: !!user,
    userId: user?.id,
    email: user?.email
  });
  
  if (!user) {
    console.log('❌ [CHECKOUT] No user found, redirecting to sign-in...');
    redirect('/sign-in?redirect_url=/cart');
  }

  console.log('🛒 [CHECKOUT] Getting user cart...');
  const cart = await getCart();
  console.log('🔍 [CHECKOUT] Cart result:', {
    hasCart: !!cart,
    cartId: cart?.id,
    itemCount: cart?.items?.length || 0,
    items: cart?.items?.map(item => ({
      id: item.id,
      productVariantId: item.productVariantId,
      quantity: item.quantity,
      productName: item.productVariant?.product?.name
    })) || []
  });

  if (!cart || cart.items.length === 0) {
    console.error('❌ [CHECKOUT] Cart is empty or not found');
    throw new Error('Cart is empty');
  }

  console.log('🌐 [CHECKOUT] Getting request headers...');
  const headersList = await headers();
  const origin = headersList.get('origin');
  console.log('🔗 [CHECKOUT] Origin:', origin);

  const line_items = cart.items.map((item) => {
    const imageUrls = item.productVariant.product.images.map((img) =>
      img.url.startsWith('http') ? img.url : `${origin}${img.url}`
    );

    console.log(`📦 [CHECKOUT] Processing item: ${item.productVariant.product.name}`, {
      price: item.productVariant.price,
      quantity: item.quantity,
      imageCount: imageUrls.length
    });

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

  console.log('💰 [CHECKOUT] Line items prepared:', line_items.length);

  console.log('🔐 [CHECKOUT] Creating Stripe checkout session...');
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

  console.log('✅ [CHECKOUT] Stripe session created:', {
    sessionId: session.id,
    hasUrl: !!session.url,
    url: session.url
  });

  if (!session.url) {
    console.error('❌ [CHECKOUT] No redirect URL from Stripe');
    throw new Error('Failed to create Stripe checkout session');
  }

  console.log('🚀 [CHECKOUT] Redirecting to Stripe checkout...');
  redirect(session.url);
}