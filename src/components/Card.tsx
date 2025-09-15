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
    <article className="group flex flex-col rounded-lg shadow-md overflow-hidden bg-white">
  <div className="relative">
   <Link href={`/products/${id}`} passHref>
  {image && (
    <div className="relative w-full aspect-[4/3] sm:aspect-[3/4] md:aspect-[16/9]">
      <Image
        src={image}
        alt={name}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-110"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        priority={false}
      />
    </div>
  )}
</Link>
  </div>

  <div className="flex flex-col justify-between flex-grow p-4 md:p-5">
    <div className="mb-3">
      <Link href={`/products/${id}`} passHref>
        <h3 className="text-lg md:text-xl font-semibold text-dark-900 hover:underline">
          {name}
        </h3>
      </Link>
      <p className="text-sm text-dark-700 mt-1">{category?.name}</p>
    </div>

    <div className="flex justify-between items-center mt-4">
      <span className="text-base md:text-lg font-bold text-dark-900">
        {price ? `$${price}` : '—'}
      </span>
      <Button
        onClick={handleAddToCart}
        disabled={!defaultVariantId}
        className="px-3 py-1 md:px-4 md:py-2 md:text-sm"
      >
        Add to Cart
      </Button>
    </div>
  </div>
</article>


  );
};

export default Card;
