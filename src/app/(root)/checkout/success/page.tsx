import { getOrder } from '@/lib/actions/orders';
import OrderSuccess from '@/components/OrderSuccess';
import { notFound } from 'next/navigation';
import { sendOrderConfirmationEmail } from '@/lib/actions/emails';

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  console.log('CheckoutSuccessPage: Starting...');
  
  const params = await searchParams;
  console.log('CheckoutSuccessPage: Params:', params);
  
  const sessionId = params.session_id;
  console.log('CheckoutSuccessPage: Session ID:', sessionId);

  if (!sessionId || typeof sessionId !== 'string') {
    console.log('CheckoutSuccessPage: Invalid session ID, returning notFound');
    return notFound();
  }

  try {
    console.log('CheckoutSuccessPage: Fetching order for session:', sessionId);
    const order = await getOrder(sessionId);
    console.log('CheckoutSuccessPage: Order result:', order);

    if (!order) {
      console.log('CheckoutSuccessPage: No order found, returning notFound');
      return notFound();
    }

    // ✅ Send confirmation email if not sent already
    if (!order.confirmationEmailSent) {
      await sendOrderConfirmationEmail(order.id);
      console.log('📧 Confirmation email triggered for order:', order.id);
    }

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

    console.log('CheckoutSuccessPage: Rendering OrderSuccess component');
    return (
      <div>
        <Navbar />
        <OrderSuccess order={order as any} />
        <Footer />
      </div>
    );

  } catch (error) {
    console.error('CheckoutSuccessPage: Error fetching order:', error);
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-dark-900 mb-8">Error</h1>
          <p>There was an error processing your order. Please contact support.</p>
          <pre className="bg-gray-100 p-4 mt-4 text-xs overflow-auto">
            {error instanceof Error ? error.message : 'Unknown error'}
          </pre>
        </div>
        <Footer />
      </div>
    );
  }
}
