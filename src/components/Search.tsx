'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query)}`);
      setOpen(false); // close input after searching
    }
  };

  return (
    <div className="relative">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="text-white hover:text-green"
        >
          Search
        </button>
      ) : (
        <form
          onSubmit={handleSearch}
          className="flex items-center space-x-2 absolute right-0 bg-black p-2 rounded-md shadow-md"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="text-white border rounded-md px-2 py-1"
          />
          <Button type="submit">Go</Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setOpen(false)}
          >
            ✕
          </Button>
        </form>
      )}
    </div>
  );
}
