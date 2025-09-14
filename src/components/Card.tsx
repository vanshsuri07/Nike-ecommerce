'use client';

import Image from 'next/image';
import React from 'react';
import Link from 'next/link';
import { ProductWithDetails } from '@/lib/actions/product';
import { useCartStore } from '@/store/cart.store';
import { Button } from './ui/button';
import { toast } from 'sonner';


interface CardProps {
  product: ProductWithDetails;
}

const Card: React.FC<CardProps> = ({ product }) => {

  const { name, category, id, defaultVariantId, images, variants } = product;
  const { addCartItem } = useCartStore();
  // Change the debug line to this:
console.log('Product images for', name, ':', images.map(img => img.url));

  // Get price from default variant if available
  const defaultVariant = variants.find(v => v.id === defaultVariantId);
  const price = defaultVariant ? defaultVariant.price : undefined;
  // Use first image if available

// Use first available image
const image = images && images.length > 0 ? images[0].url : undefined;  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
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
    <article className="group flex flex-col bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="relative">
        <Link href={`/products/${id}`} passHref>
          {image ? (
            <div className="relative aspect-square w-full overflow-hidden">
              <Image
                src={image}
                alt={name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
          ) : (
            <div className="relative aspect-square w-full bg-gray-200 flex items-center justify-center rounded-t-xl">
              <span className="text-gray-500">No Image</span>
            </div>
          )}
        </Link>
      </div>

      <div className="flex flex-col justify-between flex-grow p-3 sm:p-4">
        <div className="mb-2">
          <Link href={`/products/${id}`} passHref>
            <h3 className="text-base sm:text-lg font-semibold text-dark-900 hover:underline leading-tight">
              {name}
            </h3>
          </Link>
          <p className="text-sm text-dark-700 mt-1">{category?.name}</p>
        </div>
        <div className="flex justify-between items-center mt-3">
          <span className="text-md sm:text-lg font-bold text-dark-900">{price ? `$${price}` : '—'}</span>
          <Button onClick={handleAddToCart} disabled={!defaultVariantId} size="sm">
            Add to Cart
          </Button>
        </div>
      </div>
    </article>
  );
};

export default Card;
