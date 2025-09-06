'use client';

import { useCartStore } from '@/store/cart.store';
import { Button } from '@/components/ui/button';
import { TUser } from '@/lib/db/schema';
import { createStripeCheckoutSession } from '@/lib/actions/checkout';
import { useTransition } from 'react';
import { Loader } from 'lucide-react';
import { toast } from 'sonner';

interface CartSummaryProps {
  user: TUser | null;
}

export default function CartSummary({ }: CartSummaryProps) {
  const { items } = useCartStore();
  const [isPending, startTransition] = useTransition();

  const handleCheckout = () => {
    startTransition(async () => {
      try {
        await createStripeCheckoutSession();
      } catch (error) {
        toast.error('Failed to create checkout session. Please try again.');
        console.error('Error creating checkout session:', error);
      }
    });
  };

  const subtotal = items.reduce(
    (acc, item) => acc + parseFloat(item.productVariant.price) * item.quantity,
    0,
  );
  const shipping = 5.0;
  const total = subtotal + shipping;

  return (
    <div className="p-6 border rounded-lg space-y-4">
      <h2 className="text-heading-3 text-dark-900">Order Summary</h2>
      <div className="flex justify-between">
        <p className="text-body text-dark-700">Subtotal</p>
        <p className="text-body text-dark-900">${subtotal.toFixed(2)}</p>
      </div>
      <div className="flex justify-between">
        <p className="text-body text-dark-700">Shipping</p>
        <p className="text-body text-dark-900">${shipping.toFixed(2)}</p>
      </div>
      <hr />
      <div className="flex justify-between">
        <p className="text-body-medium text-dark-900">Total</p>
        <p className="text-body-medium text-dark-900">${total.toFixed(2)}</p>
      </div>
      <form
        action={handleCheckout}
        className="w-full"
      >
        <Button
          className="w-full"
          disabled={items.length === 0 || isPending}
        >
          {isPending ? (
            <Loader className="w-5 h-5 animate-spin" />
          ) : (
            'Checkout'
          )}
        </Button>
      </form>
    </div>
  );
}
