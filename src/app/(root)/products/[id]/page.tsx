import { Suspense } from 'react';
import { getProduct } from '@/lib/actions/product';
import ProductGallery from '@/components/ProductGallery';

import CollapsibleSection from '@/components/CollapsibleSection';

import ProductNotFound from './ProductNotFound';
import { ReviewsList } from './_components/ReviewsList';
import { RecommendedProductsGrid } from './_components/RecommendedProductsGrid';
import { RecommendedSkeleton } from './_components/RecommendedSkeleton';
import AddToCartForm from '@/components/AddToCartForm';

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  // Await the params Promise
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return <ProductNotFound />;
  }

  const uniqueSizes = [...new Set(product.variants.map(v => v.size.name))].sort();
  console.log('Unique sizes:', uniqueSizes);
  // A more robust solution would be to find the price of the default variant
  // or the minimum price, but this is fine for now.
  const displayPrice = product.variants[0]?.price || '0.00';

  return (
    <div className="bg-light-100">
      <main className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12">
          <div className="lg:sticky top-24 self-start">
            <ProductGallery variants={product.variants} mainImages={product.mainImages} />
          </div>

          <div className="mt-8 lg:mt-0">
            <p className="text-body text-dark-700">{product.brand.name}</p>
            <h1 className="text-heading-2 text-dark-900 mt-1">{product.name}</h1>

            <div className="flex items-center mt-4">
              <p className="text-heading-3 text-dark-900">${displayPrice}</p>
              {/* Compare at price logic can be added here from variant salePrice */}
            </div>

            <Suspense fallback={<div className="mt-4 h-24" />}>
              <ReviewsList productId={product.id} />
            </Suspense>

            <AddToCartForm product={product} />

            <div className="mt-12">
                <CollapsibleSection title="Description" isOpen={true}>
                    <div className="prose text-body text-dark-700">
                        {product.description}
                    </div>
                </CollapsibleSection>
                <CollapsibleSection title="Shipping & Returns">
                    <p className="text-body text-dark-700">Free standard shipping on orders over $50. Returns accepted within 30 days of purchase.</p>
                </CollapsibleSection>
            </div>
          </div>
        </div>

        <Suspense fallback={<RecommendedSkeleton />}>
          <RecommendedProductsGrid productId={product.id} />
        </Suspense>
      </main>
    </div>
  );
}