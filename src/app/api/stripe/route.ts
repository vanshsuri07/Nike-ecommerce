import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/client';
import { createOrder } from '@/lib/actions/orders';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const session = event.data.object as any;

  switch (event.type) {
    case 'checkout.session.completed':
      try {
        const userId = session.metadata?.userId;
        await createOrder(session.id, userId);
      } catch (error: any) {
        console.error(`Error creating order: ${error.message}`);
        return new NextResponse(`Webhook Error: ${error.message}`, {
          status: 500,
        });
      }
      break;
    case 'payment_intent.payment_failed':
      console.log(
        `Payment failed for payment_intent: ${session.id}`,
      );
      break;
    default:
      console.warn(`Unhandled event type: ${event.type}`);
  }

  return new NextResponse(null, { status: 200 });
}
