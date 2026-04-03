'use client';

import { useState } from 'react';
import SizePicker from '@/components/SizePicker';
import { Loader, ShoppingBag} from 'lucide-react';
import { useCartStore } from '@/store/cart.store';
import { toast } from 'sonner';
// Define a type for product variant with size
type ProductVariantWithSize = {
    id: string;
    size: { name: string };
};

interface ProductWithVariants {
    name: string;
    variants: ProductVariantWithSize[];
}

interface AddToCartFormProps {
    product: ProductWithVariants;
}

export default function AddToCartForm({ product }: AddToCartFormProps) {
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [isPending, setIsPending] = useState(false);
    const { addCartItem } = useCartStore();

    const uniqueSizes = [...new Set(product.variants.map((v: ProductVariantWithSize) => v.size.name))].sort((a, b) => Number(a) - Number(b));

    const selectedVariant = product.variants.find(
        (v: ProductVariantWithSize) => v.size.name === selectedSize,
    );

    const handleAddToCart = async () => {
        if (!selectedSize) {
            toast.error('Please select a size');
            return;
        }
        if (!selectedVariant) {
            toast.error('Selected size is not available');
            return;
        }

        setIsPending(true);
        try {
            await addCartItem(selectedVariant.id, 1);
            toast.success('Added to cart');
        } catch (error) {
            toast.error('Failed to add to cart. Please try again.');
            console.error('Error adding to cart:', error);
        } finally {
            setIsPending(false);
        }
    };
    

    return (
        <>
            <div className="mt-8">
                <SizePicker
                    sizes={uniqueSizes as string[]}
                    selectedSize={selectedSize}
                    onSelectSize={setSelectedSize}
                />
            </div>

            <div className="">
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
               
            </div>
        </>
    );
}