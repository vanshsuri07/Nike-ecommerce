import { getProducts } from '@/lib/data';
import Card from '@/components/Card';
import Filters from '@/components/Filters';
import Sort from '@/components/Sort';
import Link from 'next/link';
import { Product as CardProduct } from '@/types';

type ProductsPageProps = {
  searchParams: { [key: string]: string | string[] | undefined };
};

const ProductsPage = ({ searchParams }: ProductsPageProps) => {
  const productsData = getProducts(searchParams);

  // Adapt the data to what the Card component expects
  const products: CardProduct[] = productsData.map(p => ({
    id: parseInt(p.id, 10),
    name: p.name,
    description: null, // No description in our mock data
    price: String(p.price),
    image: p.image,
    category: p.category,
    colors: p.colors.join(', '),
    bestseller: p.isBestSeller,
  }));

  const activeFilters = Object.entries(searchParams).filter(([key]) => key !== 'sort');

  const createRemoveFilterHref = (keyToRemove: string, valueToRemove?: string) => {
    const newParams = new URLSearchParams(searchParams as any);
    const currentValue = newParams.get(keyToRemove);

    if (currentValue && valueToRemove) {
      const values = currentValue.split(',').filter(v => v !== valueToRemove);
      if (values.length > 0) {
        newParams.set(keyToRemove, values.join(','));
      } else {
        newParams.delete(keyToRemove);
      }
    }
    return `/products?${newParams.toString()}`;
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="w-full md:w-1/4 lg:w-1/5">
          <div className="sticky top-24">
            <Filters />
          </div>
        </aside>

        {/* Products Grid */}
        <section className="w-full md:w-3/4 lg:w-4/5">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-heading-2">New Arrivals</h1>
            <Sort />
          </div>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="flex items-center flex-wrap gap-2 mb-4">
              <span className="text-body-medium">Active Filters:</span>
              {activeFilters.flatMap(([key, value]) => {
                const values = typeof value === 'string' ? value.split(',') : (Array.isArray(value) ? value : [value]);
                return values.map(v => v && (
                  <div key={`${key}-${v}`} className="flex items-center gap-1 px-3 py-1 bg-light-300 rounded-full text-caption">
                    <span>{v}</span>
                    <Link href={createRemoveFilterHref(key, v)} className="text-dark-500 hover:text-dark-900">
                      &times;
                    </Link>
                  </div>
                ));
              })}
              <Link href="/products" className="text-caption text-red underline hover:text-dark-900">
                Clear All
              </Link>
            </div>
          )}

          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <h2 className="text-heading-3">No Products Found</h2>
              <p className="text-body text-dark-700 mt-2">
                Try adjusting your filters or
                <Link href="/products" className="text-red underline ml-1">clearing them</Link>
                .
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default ProductsPage;
