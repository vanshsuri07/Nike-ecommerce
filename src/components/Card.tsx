'use client';

import Image from 'next/image';
import React from 'react';
import Link from 'next/link';
import { Product } from '../types';
import { useCartStore } from '@/store/cart.store';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface CardProps {
  product: Product;
}

const Card: React.FC<CardProps> = ({ product }) => {
  const { name, price, image, category, colors, bestseller, id, defaultVariantId } = product;
  const { addCartItem } = useCartStore();

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (defaultVariantId) {
      addCartItem(defaultVariantId, 1);
      toast.success(`${name} has been added to your cart.`);
    } else {
      toast.error('This product cannot be added to the cart at the moment.');
    }
  };

  return (
    <article className="group flex flex-col ...">
  <div className="relative">
    <Link href={`/products/${id}`} passHref>
      {bestseller && (
        <div className="absolute top-0 left-0 bg-orange ...">
          Best Seller
        </div>
      )}

      {image && (
        <div className="relative h-64 w-full overflow-hidden rounded-t-xl">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
      )}
    </Link>
  </div>

  <div className="flex flex-col justify-between flex-grow p-5">
    <div className="mb-3">
      <Link href={`/products/${id}`} passHref>
        <h3 className="text-heading-3 text-dark-900 font-semibold hover:underline">
          {name}
        </h3>
      </Link>
      <p className="text-body text-dark-700 mt-1">{category}</p>
      <p className="text-body text-dark-700 mt-1">{colors}</p>
    </div>
    <div className="flex justify-between items-center mt-4">
      <span className="text-lead text-dark-900 font-bold">${price}</span>
      <Button onClick={handleAddToCart} disabled={!defaultVariantId}>
        Add to Cart
      </Button>
    </div>
  </div>
</article>

  );
};

export default Card;
