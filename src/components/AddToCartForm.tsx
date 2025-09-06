'use client';

import { useState, useTransition } from 'react';
import SizePicker from '@/components/SizePicker';
import { Loader, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cart.store';
import { toast } from 'sonner';
import { TProductWithVariants } from '@/lib/db/schema/products';

interface AddToCartFormProps {
    product: TProductWithVariants;
}

export default function AddToCartForm({ product }: AddToCartFormProps) {
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const { addCartItem } = useCartStore();

    const uniqueSizes = [...new Set(product.variants.map((v) => v.size.name))].sort();

    const selectedVariant = product.variants.find(
        (v) => v.size.name === selectedSize,
    );

    const handleAddToCart = () => {
        if (!selectedSize) {
            toast.error('Please select a size');
            return;
        }
        if (!selectedVariant) {
            toast.error('Selected size is not available');
            return;
        }

        startTransition(async () => {
            try {
                await addCartItem(selectedVariant.id, 1);
                toast.success('Added to cart');
            } catch (error) {
                toast.error('Failed to add to cart. Please try again.');
            }
        });
    };

    return (
        <>
            <div className="mt-8">
    <SizePicker
        sizes={uniqueSizes}
        selectedSize={selectedSize}
        onSelectSize={setSelectedSize}
    />
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                    onClick={handleAddToCart}
                    className="w-full bg-dark-900 text-light-100 py-4 px-8 rounded-full text-body-medium flex items-center justify-center hover:bg-dark-700 transition-colors disabled:opacity-50"
                    disabled={isPending || !selectedSize}
                >
                    {isPending ? (
                        <Loader className="w-6 h-6 animate-spin" />
                    ) : (
                        <>
                            <ShoppingBag className="w-6 h-6 mr-2" />
                            Add to Bag
                        </>
                    )}
                </button>
                <button className="w-full bg-light-200 text-dark-900 py-4 px-8 rounded-full text-body-medium flex items-center justify-center ring-1 ring-light-400 hover:ring-dark-900 transition-colors">
                    <ShoppingBag className="w-6 h-6 mr-2" />
                    Favorite
                </button>
            </div>
        </>
    );
}
