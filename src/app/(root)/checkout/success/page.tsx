import { getOrderByStripeSessionId } from '@/lib/actions/orders';
import OrderSuccess from '@/components/OrderSuccess';
import { notFound } from 'next/navigation';

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  if (!searchParams.session_id || typeof searchParams.session_id !== 'string') {
  return notFound();
}

const sessionId = await searchParams.session_id;


  if (!sessionId) {
    return notFound();
  }

  const order = getOrderByStripeSessionId(sessionId);

  if (!order) {
    return notFound();
  }

  return <OrderSuccess order={order as any} />;
}
