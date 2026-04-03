'use client';

import { useState, useEffect } from 'react';
import { TUser } from '@/lib/db/schema/user';

export function useCurrentUser() {
    const [user, setUser] = useState<TUser | null>(null);

    useEffect(() => {
        async function fetchUser() {
            try {
                const response = await fetch('/api/auth/me');
                if (response.ok) {
                    const data = await response.json();
                    setUser(data);
                }
            } catch (error) {
                if (process.env.NODE_ENV !== 'production') {
                    console.error('Failed to fetch user:', error);
                }
            }
        }

        fetchUser();
    }, []);

    return user;
}
