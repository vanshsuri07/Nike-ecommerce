import { createOrder } from '@/lib/actions/orders';
import OrderSuccess from '@/components/OrderSuccess';
import { notFound } from 'next/navigation';

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
    const order = await createOrder(sessionId);
    console.log('CheckoutSuccessPage: Order result:', order);

    if (!order) {
      console.log('CheckoutSuccessPage: No order found, returning notFound');
      return notFound();
    }

    console.log('CheckoutSuccessPage: Rendering OrderSuccess component');
    return <OrderSuccess order={{ ...order, items: [] }} />;

  } catch (error) {
    console.error('CheckoutSuccessPage: Error fetching order:', error);
    // Return a temporary error page instead of crashing
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