import { pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { productVariants } from '../variants';

export const colors = pgTable('colors', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  hexCode: text('hex_code').notNull(),
});

export const colorsRelations = relations(colors, ({ many }) => ({
  productVariants: many(productVariants),
}));

export const ColorInsertSchema = createInsertSchema(colors);
export const ColorSelectSchema = createSelectSchema(colors);
export type TColor = z.infer<typeof ColorSelectSchema>;
export type TNewColor = z.infer<typeof ColorInsertSchema>;
