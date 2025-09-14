import { pgTable, text, timestamp, uuid, boolean } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { addresses } from './addresses';
import { reviews } from './reviews';
import { carts } from './carts';
import { orders } from './orders';
import { wishlists } from './wishlists';

export const user = pgTable('users', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  name: text('name'),
  email: text('email').notNull().unique(),
   emailVerified: boolean('email_verified').default(false),


  image: text('image'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const UserInsertSchema = createInsertSchema(user);
export const UserSelectSchema = createSelectSchema(user);
export type TUser = z.infer<typeof UserSelectSchema>;
export type TNewUser = z.infer<typeof UserInsertSchema>;

export const userRelations = relations(user, ({ many }) => ({
  addresses: many(addresses),
  reviews: many(reviews),
  carts: many(carts),
  orders: many(orders),
  wishlists: many(wishlists),
}));