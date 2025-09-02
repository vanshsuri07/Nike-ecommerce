"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { formUrlQuery } from '@/lib/utils/query';

const Sort = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const sortOptions = [
    { label: 'Newest', value: 'latest' },
    { label: 'Price: High to Low', value: 'price_desc' },
    { label: 'Price: Low to High', value: 'price_asc' },
  ];

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: 'sortBy',
      value: e.target.value,
    });
    router.push(newUrl, { scroll: false });
  };

  const currentSort = searchParams.get('sortBy') || 'latest';

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort" className="text-body text-dark-700">Sort by:</label>
      <select
        id="sort"
        value={currentSort}
        onChange={handleSortChange}
        className="px-4 py-2 bg-light-200 border border-light-300 rounded-md focus:ring-red focus:border-red"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Sort;
