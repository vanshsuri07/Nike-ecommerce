'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/store/cart.store';
import { CartWithItems } from '@/types/cart';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { TUser } from '@/lib/db/schema';

interface CartProps {
  initialCart: CartWithItems | null;
  user: TUser | null;
}

export default function Cart({ initialCart, user }: CartProps) {
  const router = useRouter();
  const { items, loading, getCart, updateCartItem, removeCartItem } =
    useCartStore();

  useEffect(() => {
    if (initialCart) {
      useCartStore.setState({ items: initialCart.items });
    } else {
      getCart();
    }
  }, [initialCart, getCart]);

  const handleQuantityChange = (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    updateCartItem(itemId, quantity);
  };

  const handleRemoveItem = (itemId: string) => {
    removeCartItem(itemId);
  };

  const handleCheckout = () => {
    if (!user) {
      router.push('/sign-in?redirect_url=/checkout');
    } else {
      // Proceed to checkout
      router.push('/checkout');
    }
  };

  const subtotal = items.reduce(
    (acc, item) => acc + parseFloat(item.productVariant.price) * item.quantity,
    0,
  );
  const shipping = 5.0;
  const total = subtotal + shipping;

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!items || items.length === 0) {
    return (
      <div className="text-center">
        <p className="text-body text-dark-700">Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <Image
                  src={item.productVariant.product.images[0]?.url || '/shoe-placeholder.png'}
                  alt={item.productVariant.product.name}
                  width={80}
                  height={80}
                  className="rounded-md"
                />
                <div>
                  <h3 className="text-body-medium text-dark-900">
                    {item.productVariant.product.name}
                  </h3>
                  <p className="text-caption text-dark-700">
                    {item.productVariant.name}
                  </p>
                  <p className="text-body text-dark-900">
                    ${parseFloat(item.productVariant.price).toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    handleQuantityChange(item.id, parseInt(e.target.value))
                  }
                  className="w-16 p-2 border rounded-md text-center"
                  min="1"
                />
                <p className="text-body-medium text-dark-900">
                  ${(parseFloat(item.productVariant.price) * item.quantity).toFixed(2)}
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveItem(item.id)}
                >
                  <Trash2 className="h-5 w-5 text-dark-700" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="lg:col-span-1">
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
          <Button onClick={handleCheckout} className="w-full">
            Checkout
          </Button>
        </div>
      </div>
    </div>
  );
}
