import { Suspense } from 'react';
import { getProduct } from '@/lib/actions/product';
import ProductGallery from '@/components/ProductGallery';

import CollapsibleSection from '@/components/CollapsibleSection';

import ProductNotFound from './ProductNotFound';
import { ReviewsList } from './_components/ReviewsList';
import { RecommendedProductsGrid } from './_components/RecommendedProductsGrid';
import { RecommendedSkeleton } from './_components/RecommendedSkeleton';
import AddToCartForm from '@/components/AddToCartForm';
import AddToWishlistButton from '@/components/AddToWishlistButton';
import { getCurrentUser } from '@/lib/auth/actions';
import { isProductInWishlist } from '@/lib/actions/product';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  // Await the params Promise
  const { id } = await params;
  const product = await getProduct(id);
  const user = await getCurrentUser();
  const inWishlist = user ? await isProductInWishlist(user.id, id) : false;

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
      <Navbar />
      <main className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12">
          <div className="lg:sticky top-24 self-start">
            <ProductGallery variants={product.variants} mainImages={product.mainImages} />
          </div>

          <div className="mt-8 lg:mt-0">
            <p className="text-sm text-dark-700">{product.brand.name}</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-dark-900 mt-1">{product.name}</h1>

            <div className="flex items-center mt-4">
              <p className="text-2xl sm:text-3xl font-semibold text-dark-900">${displayPrice}</p>
              {/* Compare at price logic can be added here from variant salePrice */}
            </div>

            <Suspense fallback={<div className="mt-4 h-24" />}>
              <ReviewsList productId={product.id} />
            </Suspense>
            <div className='mt-8 space-y-4'>
            <AddToCartForm product={product} />
            <AddToWishlistButton productId={product.id} initialInWishlist={inWishlist} />
            </div>
          <div className="mt-12">
                <CollapsibleSection title="Description" isOpen={true}>
                    <div className="prose text-body text-dark-700">
                        {product.description}
                    </div>
                </CollapsibleSection>
                <CollapsibleSection title="Shipping & Returns">
                    <p className="text-body text-dark-700">
  Shipping: $5 — Returns accepted within 30 days of purchase.
</p>
                </CollapsibleSection>
            </div>
          </div>
        </div>

        <Suspense fallback={<RecommendedSkeleton />}>
          <RecommendedProductsGrid productId={product.id} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}