'use client';

import { TOrderWithItems } from '@/types';
import Image from 'next/image';
import { Button } from './ui/button';
import Link from 'next/link';

interface OrderSuccessProps {
  order: TOrderWithItems;
}

export default function OrderSuccess({ order }: OrderSuccessProps) {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="text-center">
          <h1 className="text-heading-2 text-dark-900 mb-2">
            Thank you for your order!
          </h1>
          <p className="text-body text-dark-700 mb-8">
            Your order has been confirmed. You&apos;ll receive a confirmation email
            shortly.
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
            <p className="text-body-medium text-dark-900">
              ${Number(order.totalAmount).toFixed(2)}
            </p>
          </div>
          <hr />
          <div className="space-y-4">
            {order?.items?.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <Image
                    src={
                      item.productVariant.product.images[0]?.url ||
                      '/shoe-placeholder.png'
                    }
                    alt={item.productVariant.product.name}
                    width={64}
                    height={64}
                    className="rounded-md"
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
                <p>
                  Total: $
                  {Number(item.priceAtPurchase * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
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
