import { pgTable, text, uuid, integer, timestamp } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { users } from './user';
import { productVariants } from './variants';

export const carts = pgTable('carts', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  guestId: text('guest_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const cartItems = pgTable('cart_items', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  cartId: uuid('cart_id').notNull().references(() => carts.id, { onDelete: 'cascade' }),
  productVariantId: uuid('product_variant_id').notNull().references(() => productVariants.id, { onDelete: 'cascade' }),
  quantity: integer('quantity').notNull().default(1),
});

export const cartsRelations = relations(carts, ({ one, many }) => ({
  user: one(users, {
    fields: [carts.userId],
    references: [users.id],
  }),
  items: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, {
    fields: [cartItems.cartId],
    references: [carts.id],
  }),
  productVariant: one(productVariants, {
    fields: [cartItems.productVariantId],
    references: [productVariants.id],
  }),
}));

export const CartInsertSchema = createInsertSchema(carts);
export const CartSelectSchema = createSelectSchema(carts);
export type TCart = z.infer<typeof CartSelectSchema>;
export type TNewCart = z.infer<typeof CartInsertSchema>;

export const CartItemInsertSchema = createInsertSchema(cartItems);
export const CartItemSelectSchema = createSelectSchema(cartItems);
export type TCartItem = z.infer<typeof CartItemSelectSchema>;
export type TNewCartItem = z.infer<typeof CartItemInsertSchema>;
