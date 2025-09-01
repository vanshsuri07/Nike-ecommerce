import { pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
// import { products } from './products';

export const brands = pgTable('brands', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  logoUrl: text('logo_url'),
});

export const brandsRelations = relations(brands, ({ many }) => ({
  // products: many(products),
}));

export const BrandInsertSchema = createInsertSchema(brands);
export const BrandSelectSchema = createSelectSchema(brands);
export type TBrand = z.infer<typeof BrandSelectSchema>;
export type TNewBrand = z.infer<typeof BrandInsertSchema>;
