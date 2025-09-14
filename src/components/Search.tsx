'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';

export default function Search() {
    const router = useRouter();
    const [query, setQuery] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${query.trim()}`);
        }
    };

    return (
        <form onSubmit={handleSearch} className="flex items-center space-x-2">
            <Input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                className="text-black"
            />
            <Button type="submit">Search</Button>
        </form>
    );
}
