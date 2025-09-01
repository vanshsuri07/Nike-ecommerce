import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { addresses } from './addresses';
import { reviews } from './reviews';
import { carts } from './carts';
import { orders } from './orders';
import { wishlists } from './wishlists';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('email_verified', {
    mode: 'date',
    withTimezone: true,
  }),
  image: text('image'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const UserInsertSchema = createInsertSchema(users);
export const UserSelectSchema = createSelectSchema(users);
export type TUser = z.infer<typeof UserSelectSchema>;
export type TNewUser = z.infer<typeof UserInsertSchema>;

export const usersRelations = relations(users, ({ many }) => ({
  addresses: many(addresses),
  reviews: many(reviews),
  carts: many(carts),
  orders: many(orders),
  wishlists: many(wishlists),
}));