// scripts/syncProductsToStripe.ts
import Stripe from "stripe";
import {db} from "../src/db/index.js";
import { products } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

async function syncProducts() {
  // 1️⃣ Get all products from DB
  const allProducts = await db.select().from(products);

  for (const p of allProducts) {
    // Skip if already synced
    if (p.stripeProductId && p.stripePriceId) {
      continue;
    }

    // 2️⃣ Create product in Stripe
    const stripeProduct = await stripe.products.create({
      name: p.name,
      description: p.description || "",
      images: p.image ? [p.image] : [],
    });

    // 3️⃣ Create price in Stripe
    const stripePrice = await stripe.prices.create({
      unit_amount: Math.round(Number(p.price) * 100), // dollars → cents
      currency: "usd",
      product: stripeProduct.id,
    });

    // 4️⃣ Save Stripe IDs back to DB
    await db
      .update(products)
      .set({
        stripeProductId: stripeProduct.id,
        stripePriceId: stripePrice.id,
      })
    .where(eq(products.id, p.id));
  }
}

syncProducts().catch((error) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error(error);
  }
});
