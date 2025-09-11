"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Check, ImageOff, ChevronLeft, ChevronRight } from 'lucide-react';
import type { ProductDetails } from '@/lib/actions/product';

// Extract the variant type from the ProductDetails type
type Variant = ProductDetails['variants'][0];
type ImageType = ProductDetails['mainImages'][0];

interface ProductGalleryProps {
  variants: Variant[];
  mainImages: ImageType[];
}

const colorClassMap: { [key: string]: string } = {
    'Red': 'bg-product-red',
    'Blue': 'bg-product-blue',
    'Green': 'bg-product-green',
    'Orange': 'bg-product-orange',
    'Black': 'bg-black',
    'White': 'bg-white',
    'Gray': 'bg-gray-400',
};

export default function ProductGallery({ variants, mainImages }: ProductGalleryProps) {
  const [activeVariantIndex, setActiveVariantIndex] = useState<number | null>(
    mainImages.length === 0 && variants.length > 0 ? 0 : null
  );
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Determine the set of images to display
  const galleryImages = activeVariantIndex !== null
    ? variants[activeVariantIndex].images
    : mainImages;

  const activeImage = galleryImages[activeImageIndex];

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
    setActiveImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  if (galleryImages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full bg-light-200 rounded-lg aspect-square">
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
            src={activeImage.url}
            alt={activeVariantIndex !== null ? `${variants[activeVariantIndex].color.name} product image` : 'Product image'}
            fill
            className="object-cover rounded-lg"
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority // For LCP
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-light-200 rounded-lg">
            <ImageOff className="w-16 h-16 text-dark-500" />
          </div>
        )}
        {galleryImages.length > 1 && (
            <div className="absolute inset-0 flex items-center justify-between px-4">
                <button onClick={handlePrevImage} className="p-2 bg-white/50 rounded-full hover:bg-white transition-colors">
                    <ChevronLeft className="w-6 h-6 text-dark-900"/>
                </button>
                <button onClick={handleNextImage} className="p-2 bg-white/50 rounded-full hover:bg-white transition-colors">
                    <ChevronRight className="w-6 h-6 text-dark-900"/>
                </button>
            </div>
        )}
      </div>

      {galleryImages.length > 1 && (
        <div className="mt-4 overflow-x-auto">
          <div className="flex space-x-2">
            {galleryImages.map((image, index) => (
              <button
                key={image.id}
                onClick={() => handleThumbnailClick(index)}
                className={`relative w-20 h-20 flex-shrink-0 rounded-md ring-2 ring-offset-2 ${
                  index === activeImageIndex ? 'ring-dark-900' : 'ring-transparent'
                }`}
              >
                <Image
                  src={image.url}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover rounded-md"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
  <p className="text-body-medium text-dark-900">
    Color: <span className="font-bold">{activeVariantIndex !== null ? variants[activeVariantIndex].color.name : 'Default'}</span>
  </p>
</div>
    </div>
  );
}
