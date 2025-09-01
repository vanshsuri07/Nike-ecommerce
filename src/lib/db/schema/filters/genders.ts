import { pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { products } from '../products';

export const genders = pgTable('genders', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  label: text('label').notNull(),
  slug: text('slug').notNull().unique(),
});

export const gendersRelations = relations(genders, ({ many }) => ({
  products: many(products),
}));

export const GenderInsertSchema = createInsertSchema(genders);
export const GenderSelectSchema = createSelectSchema(genders);
export type TGender = z.infer<typeof GenderSelectSchema>;
export type TNewGender = z.infer<typeof GenderInsertSchema>;
