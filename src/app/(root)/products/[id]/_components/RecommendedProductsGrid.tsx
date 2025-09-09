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

  // Map to ProductWithDetails structure expected by Card
  const allProductsForCards = products.map(p => {
    const variantId = p.defaultVariantId ?? p.id;
    return {
      id: p.id,
      name: p.name,
      description: '',
      categoryId: null,
      genderId: null,
      brandId: null,
      isPublished: true,
      defaultVariantId: variantId,
      createdAt: new Date(),
      updatedAt: new Date(),
      brand: { id: '', name: '', slug: '', logoUrl: null },
      category: null,
      gender: null,
      images: p.image ? [{ id: '', productId: p.id, variantId: null, url: p.image, sortOrder: 0, isPrimary: true }] : [],
      variants: [
        {
          id: variantId,
          productId: p.id,
          sku: '',
          price: p.price,
          salePrice: null,
          colorId: '',
          sizeId: '',
          inStock: 0,
          weight: null,
          dimensions: {},
          createdAt: new Date(),
          color: { id: '', name: '', hex: '' },
          size: { id: '', name: '' },
        },
      ],
      minPrice: p.price,
      maxPrice: p.price,
      image: p.image ?? null,
      price: p.price,
      stripeProductId: null,
      stripePriceId: null,
    };
  });

  return (
    <div className="mt-24">
      <h2 className="text-heading-2 text-dark-900 mb-8">You Might Also Like</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {allProductsForCards.map((product) => (
          <Card key={product.id} product={product as any} />
        ))}
      </div>
    </div>
  );
}
