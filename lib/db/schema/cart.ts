import { pgTable, uuid, integer, timestamp, text } from 'drizzle-orm/pg-core';
import { user } from './user';
import { guests } from './guest';
import { product } from './product';

export const cart = pgTable('cart', {
  id: text('id').primaryKey(),
  userId: text('userId').references(() => user.id, { onDelete: 'cascade' }),
  guestId: text('guestId').references(() => guests.id, { onDelete: 'cascade' }),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow(),
});

export const cartItems = pgTable('cart_items', {
  id: text('id').primaryKey(),
  cartId: text('cartId')
    .notNull()
    .references(() => cart.id, { onDelete: 'cascade' }),
  productId: integer('productId')
    .notNull()
    .references(() => product.id, { onDelete: 'cascade' }),
  quantity: integer('quantity').notNull().default(1),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow(),
});
