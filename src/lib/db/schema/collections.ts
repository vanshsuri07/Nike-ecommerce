import { pgTable, text, uuid, timestamp } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { productCollections } from './product-collections';

export const collections = pgTable('collections', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const collectionsRelations = relations(collections, ({ many }) => ({
  productCollections: many(productCollections),
}));

export const CollectionInsertSchema = createInsertSchema(collections);
export const CollectionSelectSchema = createSelectSchema(collections);
export type TCollection = z.infer<typeof CollectionSelectSchema>;
export type TNewCollection = z.infer<typeof CollectionInsertSchema>;
