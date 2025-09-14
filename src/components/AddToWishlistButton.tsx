'use client';

import { useState, useTransition } from 'react';
import { Button } from './ui/button';
import { addToWishlist, isProductInWishlist } from '@/lib/actions/product';
import { toast } from 'sonner';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useRouter } from 'next/navigation';

interface AddToWishlistButtonProps {
    productId: string;
    initialInWishlist: boolean;
}

export default function AddToWishlistButton({ productId, initialInWishlist }: AddToWishlistButtonProps) {
    const user = useCurrentUser();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [inWishlist, setInWishlist] = useState(initialInWishlist);

    const handleAddToWishlist = () => {
        if (!user) {
            router.push('/sign-in');
            return;
        }

        startTransition(async () => {
            const result = await addToWishlist(user.id, productId);
            if (result.success) {
                toast.success(result.success);
                setInWishlist(true);
            } else if (result.error) {
                toast.error(result.error);
            }
        });
    };

    return (
        <Button
            onClick={handleAddToWishlist}
            disabled={isPending || inWishlist}
            variant="outline"
            className="w-full mt-2"
        >
            {isPending
                ? 'Adding...'
                : inWishlist
                ? 'In Wishlist'
                : 'Add to Wishlist'}
        </Button>
    );
}
