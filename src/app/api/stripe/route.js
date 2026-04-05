import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { createOrder } from "@/lib/actions/orders";
import { headers } from "next/headers";
import { logger } from "@/lib/logger";

export async function POST(request) {


  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    logger.error(`❌ Webhook signature verification failed: ${err.message}`);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    try {
      const userId = session.metadata?.userId;
      await createOrder(session.id, userId);
    } catch (error) {
      logger.error(`❌ Error creating order: ${error.message}`);
      logger.error("Full error:", error);
      return NextResponse.json(
        { error: `Webhook Error: ${error.message}` },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}
