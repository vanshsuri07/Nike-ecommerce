'use client';

import { useState, useTransition } from 'react';
import { Button } from './ui/button';
import { addToWishlist } from '@/lib/actions/product';
import { toast } from 'sonner';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useRouter } from 'next/navigation';
import { HeartIcon } from 'lucide-react';

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
    <button
      onClick={handleAddToWishlist}
      disabled={isPending || inWishlist} // 🔹 disable if already in wishlist
      className={`w-full py-4 px-8 rounded-full text-body-medium flex items-center justify-center ring-1 transition-colors
        ${
          inWishlist
            ? 'bg-light-200 text-dark-900 ring-light-400 cursor-not-allowed'
            : 'bg-light-200 text-dark-900 ring-light-400 hover:ring-dark-900'
        }`}
    >
      {isPending ? (
        'Adding...'
      ) : inWishlist ? (
        <>
          In Wishlist
          <HeartIcon className="w-6 h-6 ml-2 text-red-500 fill-red-500" />
        </>
      ) : (
        <>
          Add to Wishlist
          <HeartIcon className="w-6 h-6 ml-2" />
        </>
      )}
    </button>
  );
}