import { fulfillOrder } from '@/lib/actions/orders';
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

  const order = await fulfillOrder(sessionId);

  if (!order) {
    // This case should ideally not be reached if fulfillOrder works as expected
    return notFound();
  }

  return <OrderSuccess order={order} />;
}