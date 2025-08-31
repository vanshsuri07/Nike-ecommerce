import Image from 'next/image';
import React from 'react';
import { Product } from '../types';

interface CardProps {
  product: Product;
}

const Card: React.FC<CardProps> = ({ product }) => {
  const { name, price, image, category, colors, bestseller } = product;

  return (
    <div className="bg-light-200 rounded-lg overflow-hidden">
      <div className="relative">
        {/* The z-index is added to ensure the tag is on top of the image. */}
        {bestseller && (
          <div className="absolute top-0 left-0 bg-orange text-red text-caption font-bold px-3 py-1 m-4 rounded-full z-10">
            Best Seller
          </div>
        )}
        {image && (
          <div className="relative h-80 w-full">
            <Image src={image} alt={name} layout="fill" objectFit="cover" />
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-heading-3 text-dark-900">{name}</h3>
            <p className="text-body text-dark-700 mt-1">{category}</p>
            <p className="text-body text-dark-700 mt-1">{colors}</p>
          </div>
          <span className="text-lead text-dark-900">${price}</span>
        </div>
      </div>
    </div>
  );
};

export default Card;
