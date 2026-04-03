'use server';

import { db } from '@/db';
import { orders, user as userSchema } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { transporter } from '@/lib/email/client';
import OrderConfirmationEmail from '@/components/emails/OrderConfirmationEmail';
import { render } from '@react-email/render';
import { stripe } from '@/lib/stripe/client';

export async function sendOrderConfirmationEmail(orderId: string) {
  try {
    // ✅ Fetch order from DB
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        items: {
          with: {
            productVariant: {
              with: {
                product: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.confirmationEmailSent) {
      console.log(`📧 Email already sent for order: ${orderId}`);
      return;
    }

    // ✅ Fetch user
    let user = await db.query.user.findFirst({
      where: eq(userSchema.id, order.userId),
    });

    // ✅ If email missing, pull it from Stripe session
    if (!user?.email && order.stripeSessionId) {
      try {
        const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId);
        user = { ...user, email: session.customer_email ?? undefined } as any;
      } catch (err) {
        console.error('❌ Could not fetch email from Stripe:', err);
      }
    }

    if (!user?.email) {
      throw new Error('User email not found');
    }

    // ✅ Build email HTML using your template
    const emailHtml = await render(
      OrderConfirmationEmail({
        orderId: order.id,
        orderDate: order.createdAt.toDateString(),
        customerName: user.name ?? 'Valued Customer',
        items: order.items.map((item) => ({
          name: item.productVariant.product.name,
          quantity: item.quantity,
          price: `$${item.priceAtPurchase}`,
        })),
        total: `$${order.totalAmount}`,
        paymentMethod: 'Card',
      })
    );

    // ✅ Send email
    await transporter.sendMail({
      from: process.env.GMAIL_EMAIL,
      to: user.email,
      subject: `Order Confirmation #${order.id}`,
      html: emailHtml,
    });

    // ✅ Mark as sent
    await db
      .update(orders)
      .set({ confirmationEmailSent: true })
      .where(eq(orders.id, orderId));

    console.log(`✅ Confirmation email sent for order: ${orderId}`);
  } catch (error) {
    console.error(`❌ Error sending confirmation email:`, error);
  }
}
