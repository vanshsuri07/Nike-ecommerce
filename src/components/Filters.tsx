"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formUrlQuery } from "@/lib/utils/query";
import { GENDERS, COLORS, PRICES } from "@/lib/data";
import { X, SlidersHorizontal } from "lucide-react";

const FilterGroup = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="border-b border-light-300 py-4 pl-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center pr-4 text-left"
      >
        <h3 className="text-body-medium">{title}</h3>
        <span>{isOpen ? "−" : "+"}</span>
      </button>
      {isOpen && <div className="mt-4">{children}</div>}
    </div>
  );
};

interface Size {
  id: string;
  name: string;
  slug: string;
}

interface FiltersProps {
  sizes: Size[];
}

const Filters = ({ sizes }: FiltersProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleFilterChange = (type: string, value: string) => {
    const currentValues = searchParams.get(type)?.split(",") || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: type,
      value: newValues.length > 0 ? newValues.join(",") : null,
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
                checked={
                  searchParams.get("gender")?.split(",").includes(gender) ||
                  false
                }
                onChange={() => handleFilterChange("gender", gender)}
                className="h-4 w-4 rounded accent-dark-900 border-gray-300"
              />
              {gender}
            </label>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Size">
        <div className="grid grid-cols-4 gap-2">
          {sizes.map((size) => (
            <label key={size.slug} className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                value={size.name}
                checked={
                  searchParams.get("size")?.split(",").includes(
                    String(size.name)
                  ) || false
                }
                onChange={() => handleFilterChange("size", String(size.name))}
                className="h-4 w-4 accent-dark-900"
              />
              {size.name}
            </label>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Color">
        <div className="grid grid-cols-2 gap-2">
          {COLORS.map((color) => (
            <label key={color} className="flex items-center gap-2">
              <input
                type="checkbox"
                value={color}
                checked={
                  searchParams.get("color")?.split(",").includes(color) || false
                }
                onChange={() => handleFilterChange("color", color)}
                className="h-4 w-4 accent-dark-900"
              />
              <span>{color}</span>
            </label>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Price">
        <div className="grid grid-cols-2 gap-2">
          {PRICES.map((price) => (
            <label key={price.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                value={price.id}
                checked={
                  searchParams.get("price")?.split(",").includes(price.id) ||
                  false
                }
                onChange={() => handleFilterChange("price", price.id)}
                className="h-4 w-4 accent-dark-900"
              />
              <span>{price.label}</span>
            </label>
          ))}
        </div>
      </FilterGroup>
    </>
  );

  return (
    <>
      {/* Mobile Header with Filters Button */}
      <div className="flex justify-between items-center mb-4 md:hidden">
        <h2 className="text-lg font-semibold">Products</h2>
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="flex items-center gap-2 px-3 py-2 bg-light-200 rounded-md border border-light-300"
        >
          <SlidersHorizontal size={18} />
          <span>Filters</span>
        </button>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-transform duration-300 ease-in-out ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={() => setIsDrawerOpen(false)}
        />
        {/* Drawer Panel */}
       <div
  className="absolute top-14 right-0 h-[calc(100%-3.5rem)] w-4/5 max-w-sm bg-light-100 p-6 overflow-y-auto shadow-lg rounded-l-lg"
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

      {/* Desktop Sidebar */}
      <div className="hidden md:block sticky top-20 self-start">
        <h2 className="text-heading-3 text-white bg-black w-full mb-3 px-4 py-2 rounded-lg">
          Filters
        </h2>
        {renderFilters()}
      </div>
    </>
  );
};

export default Filters;
