'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from './ui/button';


export default function Search() {
    const router = useRouter();
    const [query, setQuery] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${query.trim()}`);
            setQuery(''); // Clear input after search
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
    };

    return (
        <form onSubmit={handleSearch} className="flex w-full items-center space-x-2">
            <input
                type="text"
                value={query}
                onChange={handleInputChange}
                placeholder="Search products..."
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <Button type="submit" size="sm">Search</Button>
        </form>
    );
}
