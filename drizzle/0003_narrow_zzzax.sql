ALTER TABLE "products" ADD COLUMN "price" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "image" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "stripe_product_id" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "stripe_price_id" text;