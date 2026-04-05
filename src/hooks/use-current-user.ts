'use client';

import { useState, useEffect } from 'react';
import { TUser } from '@/lib/db/schema/user';
import { logger } from '@/lib/logger';

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
                logger.error('Failed to fetch user:', error);
            }
        }

        fetchUser();
    }, []);

    return user;
}
