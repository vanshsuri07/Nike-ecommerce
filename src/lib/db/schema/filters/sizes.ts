import { pgTable, text, uuid, integer } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
// import { productVariants } from '../variants';

export const sizes = pgTable('sizes', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  sortOrder: integer('sort_order').default(0).notNull(),
});

export const sizesRelations = relations(sizes, ({ }) => ({
  // productVariants: many(productVariants),
}));

export const SizeInsertSchema = createInsertSchema(sizes);
export const SizeSelectSchema = createSelectSchema(sizes);
export type TSize = z.infer<typeof SizeSelectSchema>;
export type TNewSize = z.infer<typeof SizeInsertSchema>;
