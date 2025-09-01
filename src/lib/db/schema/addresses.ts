import { pgTable, text, uuid, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { users } from './user';
// import { orders } from './orders';

export const addressTypeEnum = pgEnum('address_type', ['billing', 'shipping']);

export const addresses = pgTable('addresses', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: addressTypeEnum('type').notNull(),
  line1: text('line1').notNull(),
  line2: text('line2'),
  city: text('city').notNull(),
  state: text('state').notNull(),
  country: text('country').notNull(),
  postalCode: text('postal_code').notNull(),
  isDefault: boolean('is_default').default(false).notNull(),
});

export const addressesRelations = relations(addresses, ({ one, many }) => ({
  user: one(users, {
    fields: [addresses.userId],
    references: [users.id],
  }),
  // shippingOrders: many(orders, { relationName: 'shipping_address' }),
  // billingOrders: many(orders, { relationName: 'billing_address' }),
}));

export const AddressInsertSchema = createInsertSchema(addresses);
export const AddressSelectSchema = createSelectSchema(addresses);
export type TAddress = z.infer<typeof AddressSelectSchema>;
export type TNewAddress = z.infer<typeof AddressInsertSchema>;
