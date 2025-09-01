import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { carts } from './carts';

export const guests = pgTable('guests', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  sessionToken: text('session_token').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const guestsRelations = relations(guests, ({ many }) => ({
  carts: many(carts),
}));

export const GuestInsertSchema = createInsertSchema(guests);
export const GuestSelectSchema = createSelectSchema(guests);
export type TGuest = z.infer<typeof GuestSelectSchema>;
export type TNewGuest = z.infer<typeof GuestInsertSchema>;
