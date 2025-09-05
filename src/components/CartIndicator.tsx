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
    <Link href="/cart" className="flex items-center space-x-2 text-light-100 hover:text-green">
      <ShoppingCart className="h-6 w-6" />
      <span className="text-body">My Cart ({totalItems})</span>
    </Link>
  );
}
