import Image from 'next/image';
import React from 'react';
import { Product } from '../types';

interface CardProps {
  product: Product;
}

const Card: React.FC<CardProps> = ({ product }) => {
  const { name, price, image, category, colors, bestseller } = product;

  return (
    <article className="group flex flex-col h-full rounded-lg bg-light-200 ring-1 ring-light-300 transition-colors hover:ring-dark-500">
      <div className="relative">
        {bestseller && (
          <div className="absolute top-0 left-0 bg-orange text-red text-caption font-bold px-3 py-1 m-4 rounded-full z-10">
            Best Seller
          </div>
    )}

    {image && (
      <div className="relative h-60 w-full overflow-hidden">
  <Image 
    src={image} 
    alt={name} 
    fill
    className="object-cover transition-transform duration-300 group-hover:scale-105"
    sizes="(min-width: 1280px) 360px, (min-width: 1024px) 300px, (min-width: 640px) 45vw, 90vw" 
  />
</div>
    )}
  </div>

  <div className="flex flex-col justify-between flex-grow p-4">
  <div className="mb-2">
    <h3 className="text-heading-3 text-dark-900">{name}</h3>
    <p className="text-body text-dark-700 mt-1">{category}</p>
    <p className="text-body text-dark-700 mt-1">{colors}</p>
  </div>
  <span className="text-lead text-dark-900">${price}</span>
</div>

</article>

  );
};

export default Card;
