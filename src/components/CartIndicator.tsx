'use client';

import { useCartStore } from '@/store/cart.store';
import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

export default function CartIndicator() {
  const { items, getCart } = useCartStore();

  useEffect(() => {
    getCart();
  }, [getCart]);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <Link href="/cart" className="relative flex items-center text-light-100 hover:text-green">
      <ShoppingCart className="h-6 w-6" />

      {/* Badge (only if > 0) */}
      {totalItems > 0 && (
        <span
          className="
            absolute -top-2 -right-2 
            bg-red text-white text-xs font-bold 
            w-5 h-5 flex items-center justify-center 
            rounded-full md:hidden
          "
        >
          {totalItems}
        </span>
      )}

      {/* Show text on desktop, hide on mobile */}
      <span className="hidden md:inline ml-2 text-body">
        My Cart{totalItems > 0 ? ` (${totalItems})` : ''}
      </span>
    </Link>
  );
}
