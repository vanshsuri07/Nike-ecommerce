import { getRecommendedProducts } from '@/lib/actions/product';

import Card from '@/components/Card';

interface RecommendedProductsGridProps {
  productId: string;
}

export async function RecommendedProductsGrid({ productId }: RecommendedProductsGridProps) {
  const products = await getRecommendedProducts(productId);

  if (products.length === 0) {
    return null;
  }

  // Map to TProductWithVariants structure expected by Card
  const allProductsForCards = products.map(p => ({
    id: p.id,
    name: p.name,
    description: '',
    categoryId: null,
    genderId: null,
    brandId: null,
    isPublished: true,
    defaultVariantId: p.defaultVariantId ?? null,
    createdAt: new Date(),
    updatedAt: new Date(),
    brand: { id: '', name: '', slug: '', logoUrl: null },
    images: p.image ? [{ id: '', productId: p.id, variantId: null, url: p.image, sortOrder: 0, isPrimary: true }] : [],
    variants: [],
  }));

  return (
    <div className="mt-24">
      <h2 className="text-heading-2 text-dark-900 mb-8">You Might Also Like</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {allProductsForCards.map((product) => (
          <Card key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
