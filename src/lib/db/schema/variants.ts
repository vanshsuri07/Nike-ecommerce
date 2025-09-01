import { pgTable, text, uuid, numeric, integer, real, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { products } from './products';
import { colors } from './filters/colors';
import { sizes } from './filters/sizes';
// import { orderItems } from './orders';
// import { cartItems } from './carts';
// import { productImages } from './product-images';

export const productVariants = pgTable('product_variants', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  sku: text('sku').notNull().unique(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  salePrice: numeric('sale_price', { precision: 10, scale: 2 }),
  colorId: uuid('color_id').notNull().references(() => colors.id, { onDelete: 'cascade' }),
  sizeId: uuid('size_id').notNull().references(() => sizes.id, { onDelete: 'cascade' }),
  inStock: integer('in_stock').notNull().default(0),
  weight: real('weight'),
  dimensions: jsonb('dimensions'), // { length, width, height }
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const productVariantsRelations = relations(productVariants, ({ one, many }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id],
  }),
  color: one(colors, {
    fields: [productVariants.colorId],
    references: [colors.id],
  }),
  size: one(sizes, {
    fields: [productVariants.sizeId],
    references: [sizes.id],
  }),
  // orderItems: many(orderItems),
  // cartItems: many(cartItems),
  // images: many(productImages),
}));

export const ProductVariantInsertSchema = createInsertSchema(productVariants);
export const ProductVariantSelectSchema = createSelectSchema(productVariants);
export type TProductVariant = z.infer<typeof ProductVariantSelectSchema>;
export type TNewProductVariant = z.infer<typeof ProductVariantInsertSchema>;
