import { products } from '@/lib/product-data';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ProductGallery from '@/components/ProductGallery';
import SizePicker from '@/components/SizePicker';
import CollapsibleSection from '@/components/CollapsibleSection';
import Card from '@/components/Card';
import { Heart, ShoppingBag, Star } from 'lucide-react';

interface ProductPageProps {
  params: {
    id: string;
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const productId = await parseInt(params.id, 10);
  const product = products.find((p) => p.id === productId);

  if (!product) {
    notFound();
  }

  const allProductsForCards = products.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: String(p.price),
      image: p.variants[0].images[0] as string, // Or a placeholder
      category: 'Lifestyle', // Add a category if available
      colors: `${p.variants.length} Colors`,
      bestseller: p.reviews.rating > 4.5
  }));

  const relatedProducts = allProductsForCards.filter(p => p.id !== productId);

  // Shuffle the array
  for (let i = relatedProducts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [relatedProducts[i], relatedProducts[j]] = [relatedProducts[j], relatedProducts[i]];
  }

  return (
    <div className="bg-light-100">
      <main className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12">
          {/* Product Gallery */}
          <div className="lg:sticky top-24 self-start">
            <ProductGallery variants={product.variants} />
          </div>

          {/* Product Info */}
          <div className="mt-8 lg:mt-0">
            <h1 className="text-heading-2 text-dark-900">{product.name}</h1>
            <div className="flex items-center mt-2">
              <p className="text-heading-3 text-dark-900">${product.price}</p>
              {product.originalPrice && (
                <p className="text-lead text-dark-500 line-through ml-4">${product.originalPrice}</p>
              )}
              {product.discount && (
                <span className="ml-4 bg-red-100 text-red-600 text-caption font-medium px-2 py-1 rounded-md">{product.discount}</span>
              )}
            </div>

            <div className="flex items-center mt-4">
                <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-5 h-5 ${i < Math.round(product.reviews.rating) ? 'text-orange-400 fill-orange-400' : 'text-dark-500'}`} />
                    ))}
                </div>
                <p className="ml-2 text-body text-dark-700">({product.reviews.count} Reviews)</p>
            </div>

            <div className="mt-8">
              <SizePicker sizes={product.sizes} />
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button className="w-full bg-dark-900 text-light-100 py-4 px-8 rounded-full text-body-medium flex items-center justify-center hover:bg-dark-700 transition-colors">
                <ShoppingBag className="w-6 h-6 mr-2" />
                Add to Bag
              </button>
              <button className="w-full bg-light-200 text-dark-900 py-4 px-8 rounded-full text-body-medium flex items-center justify-center ring-1 ring-light-400 hover:ring-dark-900 transition-colors">
                <Heart className="w-6 h-6 mr-2" />
                Favorite
              </button>
            </div>

            <div className="mt-12">
                <p className="text-body text-dark-700">{product.description}</p>
            </div>

            <div className="mt-12">
              <CollapsibleSection title="Product Details" isOpen={true}>
                <p className="text-body text-dark-700 whitespace-pre-line">{product.specs}</p>
              </CollapsibleSection>
              <CollapsibleSection title="Shipping & Returns">
                <p className="text-body text-dark-700">Free standard shipping on orders over $50. Returns accepted within 30 days of purchase.</p>
              </CollapsibleSection>
              <CollapsibleSection title="Reviews">
                 <p className="text-body text-dark-700">No reviews yet.</p>
              </CollapsibleSection>
            </div>
          </div>
        </div>

        {/* You Might Also Like */}
        <div className="mt-24">
            <h2 className="text-heading-2 text-dark-900 mb-8">You Might Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {relatedProducts.slice(0, 4).map((product) => (
                    <Link href={`/products/${product.id}`} key={product.id}>
                        <Card product={product} />
                    </Link>
                ))}
            </div>
        </div>
      </main>
    </div>
  );
}
