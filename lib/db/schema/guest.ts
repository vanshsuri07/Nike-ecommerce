import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const guests = pgTable('guests', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionToken: text('sessionToken').notNull().unique(),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp('expiresAt', { withTimezone: true }).notNull(),
});
