import { pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { products } from './products';

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parentId: uuid('parent_id').references((): any => categories.id, { onDelete: 'set null' }),
});

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: 'parent_category',
  }),
  children: many(categories, {
    relationName: 'parent_category',
  }),
  products: many(products),
}));

export const CategoryInsertSchema = createInsertSchema(categories);
export const CategorySelectSchema = createSelectSchema(categories);
export type TCategory = z.infer<typeof CategorySelectSchema>;
export type TNewCategory = z.infer<typeof CategoryInsertSchema>;
