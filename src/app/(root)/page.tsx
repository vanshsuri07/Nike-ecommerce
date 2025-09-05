
import React from 'react';
import Navbar from '../../components/Navbar';
import Card from '../../components/Card';
import Footer from '../../components/Footer';
import { Product } from '../../types';
import HeroSection from '@/components/HeroSection';
import UpcomingProducts from '@/components/UpcomingProducts';
import { getAllProducts, ProductWithDetails } from '@/lib/actions/product';

const Page = async () => {
  const { products: fetchedProducts } = await getAllProducts({
    page: 1,
    limit: 8,
    sortBy: 'latest',
  });

  const products: Product[] = fetchedProducts.map((p: ProductWithDetails) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.minPrice,
    image: p.images[0]?.url || '/shoes/shoe-placeholder.png',
    category: p.category?.name || 'Uncategorized',
    colors: `${p.variants.length} ${p.variants.length === 1 ? 'Colour' : 'Colours'}`,
    bestseller: false, // This field is not available in the new data structure
    defaultVariantId: p.defaultVariantId || undefined,
  }));

  return (
    <div className="bg-light-100">
      <Navbar />
      <HeroSection />
      
      <main className="container mx-auto px-4 py-8 ">
        <div className="text-center mb-12 mt-12">
          <h2 className="text-4xl font-extrabold text-gray-900">Featured Products</h2>
          <p className="text-lg text-gray-600 mt-2">
            Check out our latest and greatest selection of footwear.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 auto-rows-fr">
          {products.map(product => (
            <Card key={product.id} product={product} />
          ))}
        </div>
        <UpcomingProducts />
      </main>
      <Footer />
    </div>
  );
};

export default Page;
