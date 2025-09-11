import 'dotenv/config';
import { db } from '../src/db';
import * as schema from '../src/lib/db/schema';
import { eq, inArray, not } from 'drizzle-orm';

const log = (...args: unknown[]) => console.log('[update-sizes]', ...args);
const err = (...args: unknown[]) => console.error('[update-sizes:error]', ...args);

// Helper functions
function pick<T>(arr: T[], n: number) {
  const a = [...arr];
  const out: T[] = [];
  for (let i = 0; i < n && a.length; i++) {
    const idx = Math.floor(Math.random() * a.length);
    out.push(a.splice(idx, 1)[0]);
  }
  return out;
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
};

async function updateSizes() {
  try {
    log('Starting product size update...');

    // 1. Define the comprehensive list of sizes
    const sizeRows = [
      { name: '5', slug: '5', sortOrder: 0 },
      { name: '6', slug: '6', sortOrder: 1 },
      { name: '7', slug: '7', sortOrder: 2 },
      { name: '8', slug: '8', sortOrder: 3 },
      { name: '9', slug: '9', sortOrder: 4 },
      { name: '10', slug: '10', sortOrder: 5 },
      { name: '11', slug: '11', sortOrder: 6 },
      { name: '12', slug: '12', sortOrder: 7 },
      { name: '13', slug: '13', sortOrder: 8 },
      { name: '14', slug: '14', sortOrder: 9 },
      { name: '15', slug: '15', sortOrder: 10 },
    ].map((s) => schema.SizeInsertSchema.parse(s));

    // 2. Ensure all sizes exist in the database
    log('Ensuring all necessary sizes exist in the database...');
    for (const row of sizeRows) {
      const exists = await db.select().from(schema.sizes).where(eq(schema.sizes.slug, row.slug)).limit(1);
      if (!exists.length) {
        await db.insert(schema.sizes).values(row);
        log(`Created size: ${row.name}`);
      }
    }

    // 3. Find the "One Size" ID
    const [oneSize] = await db
      .select()
      .from(schema.sizes)
      .where(eq(schema.sizes.name, 'One Size'))
      .limit(1);

    if (!oneSize) {
      log('"One Size" not found in the database. No updates needed.');
      return;
    }
    log(`Found "One Size" with ID: ${oneSize.id}`);

    // 4. Find all product variants with "One Size"
    const oneSizeVariants = await db
      .select()
      .from(schema.productVariants)
      .where(eq(schema.productVariants.sizeId, oneSize.id));

    if (oneSizeVariants.length === 0) {
      log('No products with "One Size" found. No updates needed.');
      return;
    }

    // 5. Group variants by product ID
    const productsToUpdate = oneSizeVariants.reduce((acc, variant) => {
      if (!acc[variant.productId]) {
        acc[variant.productId] = [];
      }
      acc[variant.productId].push(variant);
      return acc;
    }, {} as Record<string, typeof oneSizeVariants>);

    log(`Found ${Object.keys(productsToUpdate).length} products to update.`);

    // 6. Get all other available sizes
    const allSizes = await db
      .select()
      .from(schema.sizes)
      .where(not(eq(schema.sizes.id, oneSize.id)));

    if (allSizes.length === 0) {
      err('No other sizes found in the database even after attempting to create them. Cannot update products.');
      return;
    }
    log(`Found ${allSizes.length} other sizes to use for updates.`);

    // 7. Loop through each product and update it
    for (const productId in productsToUpdate) {
      log(`Updating product with ID: ${productId}`);

      const [product] = await db
        .select()
        .from(schema.products)
        .where(eq(schema.products.id, productId));

      if (!product) {
        err(`Product with ID ${productId} not found. Skipping.`);
        continue; // Use continue to proceed with the next iteration
      }

      // a. Find any image associated with the old variants
      const oldVariantIds = productsToUpdate[productId].map(v => v.id);
      const [oldImage] = await db
        .select()
        .from(schema.productImages)
        .where(inArray(schema.productImages.variantId, oldVariantIds))
        .limit(1);

      // b. Delete the old "One Size" variants
      log(`Deleting ${oldVariantIds.length} old variants for product ${productId}`);
      await db
        .delete(schema.productVariants)
        .where(inArray(schema.productVariants.id, oldVariantIds));

        // c. Create new variants with a variety of sizes
        const sizeChoices = pick(allSizes, randInt(3, Math.min(5, allSizes.length)));
        const newVariantIds: string[] = [];
        let newDefaultVariantId: string | null = null;

        for (const size of sizeChoices) {
          // Assuming color is consistent for the product, which is a limitation here.
          // We'll use the color from the first old variant.
          const oldVariant = productsToUpdate[productId][0];
          const color = await db.query.colors.findFirst({ where: eq(schema.colors.id, oldVariant.colorId) });
          const colorSlug = color ? color.slug : 'color';

          const sku = `${slugify(product.name!)}-${colorSlug}-${size.slug}`.substring(0, 50);
          const [newVariant] = await db
            .insert(schema.productVariants)
            .values({
              productId: product.id,
              colorId: oldVariant.colorId,
              sizeId: size.id,
              price: product.price!,
              sku: sku,
            })
            .returning();
          newVariantIds.push(newVariant.id);
          if (!newDefaultVariantId) {
            newDefaultVariantId = newVariant.id;
          }
        }
        log(`Created ${newVariantIds.length} new variants for product ${productId}`);

        // d. Update the product with the new default variant ID
        if (newDefaultVariantId) {
          await db
            .update(schema.products)
            .set({ defaultVariantId: newDefaultVariantId })
            .where(eq(schema.products.id, productId));
          log(`Updated product ${productId} with new default variant ID: ${newDefaultVariantId}`);

          // e. Re-associate the image with the new default variant
          if (oldImage) {
            await db
              .update(schema.productImages)
              .set({ variantId: newDefaultVariantId })
              .where(eq(schema.productImages.id, oldImage.id));
            log(`Re-associated image ${oldImage.id} with new default variant ${newDefaultVariantId}`);
          }
        }
    }

    log('Product size update complete.');
  } catch (e) {
    err(e);
    process.exitCode = 1;
  }
}

updateSizes();
