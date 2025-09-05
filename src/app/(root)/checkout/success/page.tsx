import { getOrderByStripeSessionId } from '@/lib/actions/orders';
import OrderSuccess from '@/components/OrderSuccess';
import { notFound } from 'next/navigation';

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const sessionId = searchParams.session_id as string;

  if (!sessionId) {
    return notFound();
  }

  const order = await getOrderByStripeSessionId(sessionId);

  if (!order) {
    return notFound();
  }

  return <OrderSuccess order={order} />;
}
