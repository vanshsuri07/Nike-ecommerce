import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { createOrder } from "@/lib/actions/orders";
import { headers } from "next/headers";

export async function POST(request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error(`❌ Webhook signature verification failed: ${err.message}`);
    }
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 },
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    try {
      const userId = session.metadata?.userId;
      await createOrder(session.id, userId);
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error(`❌ Error creating order: ${error.message}`);
        console.error("Full error:", error);
      }
      return NextResponse.json(
        { error: `Webhook Error: ${error.message}` },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ received: true });
}
