import { pgTable, text, uuid, numeric, integer, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const discountTypeEnum = pgEnum('discount_type', ['percentage', 'fixed']);

export const coupons = pgTable('coupons', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  code: text('code').notNull().unique(),
  discountType: discountTypeEnum('discount_type').notNull(),
  discountValue: numeric('discount_value', { precision: 10, scale: 2 }).notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  maxUsage: integer('max_usage').notNull().default(1),
  usedCount: integer('used_count').notNull().default(0),
});

export const CouponInsertSchema = createInsertSchema(coupons);
export const CouponSelectSchema = createSelectSchema(coupons);
export type TCoupon = z.infer<typeof CouponSelectSchema>;
export type TNewCoupon = z.infer<typeof CouponInsertSchema>;
