'use client';

import { ProductWithDetails } from '@/lib/actions/product';
import Card from './Card';
import { Button } from './ui/button';
import { removeFromWishlist } from '@/lib/actions/product';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';


interface WishlistCardProps {
    product: ProductWithDetails;
    userId: string;
}

export default function WishlistCard({ product, userId }: WishlistCardProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleRemove = () => {
        startTransition(async () => {
            await removeFromWishlist(userId, product.id);
            toast.success(`${product.name} has been removed from your wishlist.`);
            router.refresh();
        });
    };

    return (
        <div className="relative">
            
            <Card product={product} />
            <div className="absolute top-2 right-2">
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleRemove}
                    disabled={isPending}
                >
                    {isPending ? 'Removing...' : 'Remove'}
                </Button>
            </div>
            
        </div>
    );
}
