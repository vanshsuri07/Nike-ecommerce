import { pgTable, uuid } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { products } from './products';
import { collections } from './collections';

export const productCollections = pgTable('product_collections', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  collectionId: uuid('collection_id').notNull().references(() => collections.id, { onDelete: 'cascade' }),
});

export const productCollectionsRelations = relations(productCollections, ({ one }) => ({
  product: one(products, {
    fields: [productCollections.productId],
    references: [products.id],
  }),
  collection: one(collections, {
    fields: [productCollections.collectionId],
    references: [collections.id],
  }),
}));

export const ProductCollectionInsertSchema = createInsertSchema(productCollections);
export const ProductCollectionSelectSchema = createSelectSchema(productCollections);
export type TProductCollection = z.infer<typeof ProductCollectionSelectSchema>;
export type TNewProductCollection = z.infer<typeof ProductCollectionInsertSchema>;
