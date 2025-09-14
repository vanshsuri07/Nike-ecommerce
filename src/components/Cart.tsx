'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/store/cart.store';
import { CartWithItems } from '@/types/cart';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { TUser } from '@/lib/db/schema';
import CartSummary from './CartSummary';

interface CartProps {
  initialCart: CartWithItems | null;
  user: TUser | null;
}

export default function Cart({ initialCart, user }: CartProps) {
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
                  
                  <p className="text-body text-dark-900">
                    ${parseFloat(item.productVariant.price).toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
  {/* Quantity input */}
  <input
    type="number"
    value={item.quantity}
    onChange={(e) =>
      handleQuantityChange(item.id, parseInt(e.target.value || "1", 10))
    }
    className="w-16 p-2 border rounded-md text-center"
    min="1"
  />

  {/* Price + Remove in a row */}
  <div className="flex items-center gap-3">
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

            </div>
          ))}
        </div>
      </div>
      <div className="lg:col-span-1">
        <CartSummary user={user} />
      </div>
    </div>
  );
}
