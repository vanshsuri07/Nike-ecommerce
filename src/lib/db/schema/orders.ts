import { pgTable, uuid, integer, numeric, timestamp, pgEnum,text, boolean } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { user } from './user';
import { addresses } from './addresses';
import { productVariants } from './variants';
import { payments } from './payments';

export const orderStatusEnum = pgEnum('order_status', ['pending', 'paid', 'shipped', 'delivered', 'cancelled']);

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  status: orderStatusEnum('status').notNull().default('pending'),
  totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
  shippingAddressId: uuid('shipping_address_id').notNull().references(() => addresses.id, { onDelete: 'set null' }),
  billingAddressId: uuid('billing_address_id').notNull().references(() => addresses.id, { onDelete: 'set null' }),
  stripeSessionId: text('stripe_session_id'), 
  stripePaymentIntentId: text('stripe_payment_intent_id'), // ✅ NEW COLUMN
  confirmationEmailSent: boolean('confirmation_email_sent').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productVariantId: uuid('product_variant_id').notNull().references(() => productVariants.id, { onDelete: 'no action' }),
  quantity: integer('quantity').notNull(),
  priceAtPurchase: numeric('price_at_purchase', { precision: 10, scale: 2 }).notNull(),
});

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(user, {
    fields: [orders.userId],
    references: [user.id],
  }),
  shippingAddress: one(addresses, {
    fields: [orders.shippingAddressId],
    references: [addresses.id],
    relationName: 'shipping_address',
  }),
  billingAddress: one(addresses, {
    fields: [orders.billingAddressId],
    references: [addresses.id],
    relationName: 'billing_address',
  }),
  items: many(orderItems),
  payments: many(payments),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  productVariant: one(productVariants, {
    fields: [orderItems.productVariantId],
    references: [productVariants.id],
  }),
}));

export const OrderInsertSchema = createInsertSchema(orders);
export const OrderSelectSchema = createSelectSchema(orders);
export type TOrder = z.infer<typeof OrderSelectSchema>;
export type TNewOrder = z.infer<typeof OrderInsertSchema>;

export const OrderItemInsertSchema = createInsertSchema(orderItems);
export const OrderItemSelectSchema = createSelectSchema(orderItems);
export type TOrderItem = z.infer<typeof OrderItemSelectSchema>;
export type TNewOrderItem = z.infer<typeof OrderItemInsertSchema>;
