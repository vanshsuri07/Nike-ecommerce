import Image from 'next/image';
import React from 'react';
import { Product } from '../types';

interface CardProps {
  product: Product;
}

const Card: React.FC<CardProps> = ({ product }) => {
  const { name, price, image, category, colors, bestseller } = product;

  return (
    <article
      className="group flex flex-col h-full rounded-xl bg-light-200 ring-1 ring-light-300 
                 transition-all duration-300 hover:ring-dark-500 hover:shadow-lg hover:-translate-y-1"
      style={{ minWidth: '280px', maxWidth: '340px' }} // slightly bigger width
    >
      <div className="relative">
        {bestseller && (
          <div className="absolute top-0 left-0 bg-orange text-white text-caption font-bold px-3 py-1 m-4 rounded-full z-10">
            Best Seller
          </div>
        )}

        {image && (
          <div className="relative h-64 w-full overflow-hidden rounded-t-xl"> {/* taller image */}
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(min-width: 1280px) 380px, (min-width: 1024px) 320px, (min-width: 640px) 45vw, 90vw"
            />
          </div>
        )}
      </div>

      <div className="flex flex-col justify-between flex-grow p-5">
        <div className="mb-3">
          <h3 className="text-heading-3 text-dark-900 font-semibold">{name}</h3>
          <p className="text-body text-dark-700 mt-1">{category}</p>
          <p className="text-body text-dark-700 mt-1">{colors}</p>
        </div>
        <span className="text-lead text-dark-900 font-bold">${price}</span>
      </div>
    </article>
  );
};

export default Card;
