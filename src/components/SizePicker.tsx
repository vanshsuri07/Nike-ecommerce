"use client";

import { useState } from 'react';

interface SizePickerProps {
  sizes: string[];
}

export default function SizePicker({ sizes }: SizePickerProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  if (!sizes || sizes.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <p className="text-body-medium text-dark-900">Select Size</p>
        <a href="#" className="text-body text-dark-700 hover:underline">Size Guide</a>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {sizes.map((size) => (
          <button
            key={size}
            onClick={() => setSelectedSize(size)}
            className={`py-3 px-4 rounded-md border text-center text-body-medium transition-colors ${
              selectedSize === size
                ? 'bg-dark-900 text-light-100 border-dark-900'
                : 'bg-light-100 text-dark-900 border-light-400 hover:border-dark-900'
            }`}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
}
