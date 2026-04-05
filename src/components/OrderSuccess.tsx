'use client';

import { TOrderWithItems } from '@/types';
import Image from 'next/image';
import { Button } from './ui/button';
import Link from 'next/link';
import Confetti from 'react-confetti';
import { useCartStore } from '@/store/cart.store';
import { useEffect, useState } from 'react';

interface OrderSuccessProps {
  order: TOrderWithItems;
}

export default function OrderSuccess({ order }: OrderSuccessProps) {
  const { clearCart } = useCartStore();
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });
  
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  useEffect(() => {
    const updateSize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const total = Number(order.totalAmount).toFixed(2);

  // Helper function to get a working image URL
  const getImageUrl = (imageUrl?: string) => {
    
    if (!imageUrl) {
      return '/shoe-placeholder.png';
    }
    
    // If it's already a full URL, use it
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // For relative URLs that start with /, they should work as-is from /public
    if (imageUrl.startsWith('/')) {
      return imageUrl;
    }
    
    // For relative URLs without leading slash, add it
    const finalUrl = `/${imageUrl}`;
    return finalUrl;
  };
 
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Confetti 
        width={windowSize.width}
        height={windowSize.height}
        recycle={false}
        numberOfPieces={400}
      />
      <div className="max-w-2xl mx-auto">
        <div className="text-center">
          <h1 className="text-heading-2 text-dark-900 mb-2">
            Thank you for your order!
          </h1>
          <p className="text-body text-dark-700 mb-8">
            Your order has been confirmed. A confirmation email has been sent to your inbox.
          </p>
        </div>
        <div className="p-6 border rounded-lg space-y-4 mb-8">
          <h2 className="text-heading-3 text-dark-900">Order Summary</h2>
          <div className="flex justify-between">
            <p className="text-body text-dark-700">Order ID</p>
            <p className="text-body text-dark-900">{order.id}</p>
          </div>
          <div className="flex justify-between">
            <p className="text-body text-dark-700">Total</p>
            <p className="text-body-medium text-dark-900">${total}</p>
          </div>
          <hr />
          
          <div className="space-y-4">
            {order.items.map((item) => {
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-4">
                    <Image
                      src={getImageUrl(item.productVariant.product.images?.[0]?.url || item.productVariant.product.image || undefined)}
                      alt={item.productVariant.product.name}
                      width={80}
                      height={80}
                      className="rounded-md"
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.src = '/shoe-placeholder.png';
                      }}
                    />
                    <div>
                      <h3 className="text-body-medium text-dark-900">
                        {item.productVariant.product.name}
                      </h3>
                      <p className="text-caption text-dark-700">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <p>${Number(item.priceAtPurchase).toFixed(2)}</p>
                </div>
              );
            })}
          </div>
        </div>
        <div className="text-center">
          <Button asChild>
            <Link href="/">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}