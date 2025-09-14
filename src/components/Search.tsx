'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from './ui/button';


export default function Search() {
    const router = useRouter();
    const [query, setQuery] = useState('');

     const handleSearch = (e: React.FormEvent) => {
        console.log('handleSearch called');
        e.preventDefault();
        console.log('query:', query);
        if (query.trim()) {
            console.log('redirecting to:', `/search?q=${query.trim()}`);
            router.push(`/search?q=${query.trim()}`);
        }
    };

     const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log('handleInputChange called, value:', e.target.value);
        setQuery(e.target.value);
    };
    return (
        <form onSubmit={handleSearch} className="flex items-center space-x-2">
            <input
                type="text"
                value={query}
                onChange={handleInputChange}
                placeholder="Search products..."
                className="text-black"
            />
            <Button type="submit">Search</Button>
        </form>
    );
}
