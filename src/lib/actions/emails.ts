'use server';

import { db } from '@/db';
import { orders, user as userSchema, orderItems, productVariants, products } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { resend } from '@/lib/email/client';
import OrderConfirmationEmail from '@/components/emails/OrderConfirmationEmail';
import { getOrder } from './orders';


export async function sendOrderConfirmationEmail(orderId: string) {
  try {
    const order = await getOrder(orderId, 'orderId');

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.confirmationEmailSent) {
      console.log(`Email already sent for order: ${orderId}`);
      return;
    }

    const user = await db.query.user.findFirst({
        where: eq(userSchema.id, order.userId),
    });

    if (!user) {
        throw new Error('User not found');
    }

    const emailHtml = await resend.emails.send({
      from: 'Your Store <onboarding@resend.dev>', // Should be a configured domain
      to: [user.email],
      subject: `Order Confirmation #${order.id}`,
      react: OrderConfirmationEmail({
        orderId: order.id,
        orderDate: order.createdAt.toDateString(),
        customerName: user.name ?? 'Valued Customer',
        items: order.items.map(item => ({
            name: item.productVariant.product.name,
            quantity: item.quantity,
            price: `$${item.priceAtPurchase}`
        })),
        total: `$${order.totalAmount}`,
        paymentMethod: 'Card', // This should be dynamic if possible
      }),
    });

    await db
      .update(orders)
      .set({ confirmationEmailSent: true })
      .where(eq(orders.id, orderId));

    console.log(`Confirmation email sent for order: ${orderId}`);
    return { success: true, data: emailHtml };
  } catch (error) {
    console.error(`Error sending confirmation email: ${error}`);
    return { success: false, error: (error as Error).message };
  }
}
