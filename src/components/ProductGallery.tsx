"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ProductVariant } from '@/lib/product-data';
import { Check, ImageOff, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductGalleryProps {
  variants: ProductVariant[];
}

const colorClassMap: { [key: string]: string } = {
    'Red': 'bg-product-red',
    'Blue': 'bg-product-blue',
    'Green': 'bg-product-green',
    'Orange': 'bg-product-orange',
};

export default function ProductGallery({ variants }: ProductGalleryProps) {
  const [activeVariantIndex, setActiveVariantIndex] = useState(0);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const activeVariant = variants[activeVariantIndex];
  const activeImage = activeVariant.images[activeImageIndex];

  useEffect(() => {
    setActiveImageIndex(0);
  }, [activeVariantIndex]);

  const handleVariantChange = (index: number) => {
    setActiveVariantIndex(index);
  };

  const handleThumbnailClick = (index: number) => {
    setActiveImageIndex(index);
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + activeVariant.images.length) % activeVariant.images.length);
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % activeVariant.images.length);
  };

  if (!variants || variants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full bg-light-200 rounded-lg">
        <ImageOff className="w-16 h-16 text-dark-500" />
        <p className="mt-4 text-dark-700">No images available</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="relative aspect-square w-full">
        {activeImage ? (
          <Image
            src={activeImage}
            alt={`${activeVariant.color} product image`}
            fill
            className="object-cover rounded-lg"
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-light-200 rounded-lg">
            <ImageOff className="w-16 h-16 text-dark-500" />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-between px-4">
            <button onClick={handlePrevImage} className="p-2 bg-white/50 rounded-full hover:bg-white transition-colors">
                <ChevronLeft className="w-6 h-6 text-dark-900"/>
            </button>
            <button onClick={handleNextImage} className="p-2 bg-white/50 rounded-full hover:bg-white transition-colors">
                <ChevronRight className="w-6 h-6 text-dark-900"/>
            </button>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <div className="flex space-x-2">
          {activeVariant.images.map((image, index) => (
            <button
              key={index}
              onClick={() => handleThumbnailClick(index)}
              className={`relative w-20 h-20 flex-shrink-0 rounded-md ring-2 ring-offset-2 ${
                index === activeImageIndex ? 'ring-dark-900' : 'ring-transparent'
              }`}
            >
              {image ? (
                <Image
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover rounded-md"
                  sizes="80px"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-light-200 rounded-md">
                  <ImageOff className="w-8 h-8 text-dark-500" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <p className="text-body-medium text-dark-900">Color: <span className="font-bold">{activeVariant.color}</span></p>
        <div className="flex space-x-3 mt-2">
          {variants.map((variant, index) => (
            <button
              key={variant.color}
              onClick={() => handleVariantChange(index)}
              className={`w-10 h-10 rounded-full flex items-center justify-center ring-2 ring-offset-2 ${
                index === activeVariantIndex ? 'ring-dark-900' : 'ring-transparent'
              } ${colorClassMap[variant.color] || 'bg-gray-200'}`}
              aria-label={`Select ${variant.color} color ${index === activeVariantIndex ? '(selected)' : ''}`}
            >
              {index === activeVariantIndex && <Check className="w-6 h-6 text-white" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
