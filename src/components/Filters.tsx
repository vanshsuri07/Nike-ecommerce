"use client";

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { formUrlQuery } from '@/lib/utils/query';
import { GENDERS, SIZES, COLORS } from '@/lib/data';
import { X, SlidersHorizontal } from 'lucide-react';

const FilterGroup = ({ title, children }: { title: string, children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="border-b border-light-300 py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left"
      >
        <h3 className="text-body-medium">{title}</h3>
        <span>{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen && <div className="mt-4">{children}</div>}
    </div>
  );
};

const Filters = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleFilterChange = (type: string, value: string) => {
    const currentValues = searchParams.get(type)?.split(',') || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: type,
      value: newValues.length > 0 ? newValues.join(',') : null,
    });

    router.push(newUrl, { scroll: false });
  };

  const renderFilters = () => (
    <>
      <FilterGroup title="Gender">
        <div className="space-y-2">
          {GENDERS.map((gender) => (
            <label key={gender} className="flex items-center gap-2">
              <input
                type="checkbox"
                value={gender}
                checked={searchParams.get('gender')?.split(',').includes(gender) || false}
                onChange={() => handleFilterChange('gender', gender)}
                className="h-4 w-4 rounded border-gray-300 text-red focus:ring-red"
              />
              {gender}
            </label>
          ))}
        </div>
      </FilterGroup>
      <FilterGroup title="Size">
        <div className="grid grid-cols-4 gap-2">
          {SIZES.map((size) => (
            <label key={size} className="flex items-center justify-center p-2 border rounded-md cursor-pointer has-[:checked]:bg-dark-900 has-[:checked]:text-light-100">
              <input
                type="checkbox"
                value={size}
                checked={searchParams.get('size')?.split(',').includes(String(size)) || false}
                onChange={() => handleFilterChange('size', String(size))}
                className="sr-only"
              />
              {size}
            </label>
          ))}
        </div>
      </FilterGroup>
      <FilterGroup title="Color">
        <div className="grid grid-cols-4 gap-2">
          {COLORS.map((color) => (
            <label key={color} className="flex items-center justify-center p-2 border rounded-full cursor-pointer has-[:checked]:ring-2 has-[:checked]:ring-offset-1 has-[:checked]:ring-red" style={{ backgroundColor: color, color: color.toLowerCase() === 'white' ? 'black' : 'white' }}>
              <input
                type="checkbox"
                value={color}
                checked={searchParams.get('color')?.split(',').includes(color) || false}
                onChange={() => handleFilterChange('color', color)}
                className="sr-only"
              />
              <span className="sr-only">{color}</span>
            </label>
          ))}
        </div>
      </FilterGroup>
    </>
  );

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="md:hidden mb-4">
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-light-200 rounded-md border border-light-300"
        >
          <SlidersHorizontal size={20} />
          <span>Filters</span>
        </button>
      </div>

      {/* Mobile Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setIsDrawerOpen(false)}>
          <div
            className="fixed top-0 left-0 h-full w-4/5 max-w-sm bg-light-100 p-6 overflow-y-auto transform transition-transform ease-in-out duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-heading-3">Filters</h2>
              <button onClick={() => setIsDrawerOpen(false)}>
                <X size={24} />
              </button>
            </div>
            {renderFilters()}
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <h2 className="text-heading-3 mb-4">Filters</h2>
        {renderFilters()}
      </div>
    </>
  );
};

export default Filters;
