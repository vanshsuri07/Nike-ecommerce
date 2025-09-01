import { pgTable, text, uuid, boolean, timestamp } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { categories } from './categories';
import { genders } from './filters/genders';
import { brands } from './brands';
// import { productVariants } from './variants';
// import { reviews } from './reviews';
// import { productImages } from './product-images';
// import { productCollections } from './product-collections';
// import { wishlists } from './wishlists';


export const products = pgTable('products', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  description: text('description'),
  categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
  genderId: uuid('gender_id').references(() => genders.id, { onDelete: 'set null' }),
  brandId: uuid('brand_id').references(() => brands.id, { onDelete: 'set null' }),
  isPublished: boolean('is_published').default(false).notNull(),
  defaultVariantId: uuid('default_variant_id'), // can't add fk to product_variants yet
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  gender: one(genders, {
    fields: [products.genderId],
    references: [genders.id],
  }),
  brand: one(brands, {
    fields: [products.brandId],
    references: [brands.id],
  }),
  // defaultVariant: one(productVariants, {
  //   fields: [products.defaultVariantId],
  //   references: [productVariants.id],
  // }),
  // variants: many(productVariants),
  // reviews: many(reviews),
  // images: many(productImages),
  // productCollections: many(productCollections),
  // wishlists: many(wishlists),
}));

export const ProductInsertSchema = createInsertSchema(products);
export const ProductSelectSchema = createSelectSchema(products);
export type TProduct = z.infer<typeof ProductSelectSchema>;
export type TNewProduct = z.infer<typeof ProductInsertSchema>;
