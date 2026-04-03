import { getOrder } from '@/lib/actions/orders';
import OrderSuccess from '@/components/OrderSuccess';
import { notFound } from 'next/navigation';
import { sendOrderConfirmationEmail } from '@/lib/actions/emails';

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const sessionId = params.session_id;

  if (!sessionId || typeof sessionId !== 'string') {
    return notFound();
  }

  try {
    const order = await getOrder(sessionId);

    if (!order) {
      return notFound();
    }

    // ✅ Send confirmation email if not sent already
    if (!order.confirmationEmailSent) {
      await sendOrderConfirmationEmail(order.id);
    }

    return <OrderSuccess order={order as any} />;

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('CheckoutSuccessPage: Error fetching order:', error);
    }
    return (
      <div className="container mx-auto px-4 py-8">
        <h1>Error</h1>
        <p>There was an error processing your order. Please contact support.</p>
        <pre className="bg-gray-100 p-4 mt-4 text-xs overflow-auto">
          {error instanceof Error ? error.message : 'Unknown error'}
        </pre>
      </div>
    );
  }
}
