import { getAllProducts, type ProductWithDetails } from '@/lib/actions/product';
import { parseFilterParams } from '@/lib/utils/query';
import Card from '@/components/Card';
import Filters from '@/components/Filters';
import Sort from '@/components/Sort';
import Link from 'next/link';
import { Product as CardProduct } from '@/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

type SearchParamsType = Promise<Record<string, string | string[] | undefined>>;

export default async function ProductsPage({ searchParams }: { searchParams: SearchParamsType }) {
  const resolvedParams = await searchParams; // ✅ Await the searchParams
  const filters = parseFilterParams(resolvedParams);
  const { products: fetchedProducts, totalCount } = await getAllProducts(filters);

  const products: CardProduct[] = fetchedProducts.map((p: ProductWithDetails) => ({
    id: parseInt(p.id.substring(0, 8), 16),
    name: p.name,
    description: p.description,
    price: p.minPrice || '0',
    image: p.images[0]?.url || null,
    category: p.category?.name || 'N/A',
    colors: p.variants.map(v => v.color.name).slice(0, 3).join(', '),
    bestseller: false,
  }));

  const activeFilters = Object.entries(filters)
    .filter(([key, value]) =>
      !['sort', 'page', 'limit', 'sortBy', 'priceMin', 'priceMax'].includes(key) &&
      value &&
      (Array.isArray(value) ? value.length > 0 : true)
    )
    .flatMap(([key, value]) =>
      (Array.isArray(value) ? value : String(value).split(',')).map(v => ({ key, value: v }))
    );

  if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
    activeFilters.push({ key: 'price', value: `${filters.priceMin || '0'}-${filters.priceMax || ''}` });
  }

  const createRemoveFilterHref = (keyToRemove: string, valueToRemove: string) => {
    const currentParams = new URLSearchParams();
    for (const [key, value] of Object.entries(resolvedParams)) {
      if (Array.isArray(value)) {
        value.forEach(v => currentParams.append(key, v));
      } else if (value) {
        currentParams.set(key, String(value));
      }
    }

    if (keyToRemove === 'price') {
      currentParams.delete('price');
      currentParams.delete('priceMin');
      currentParams.delete('priceMax');
    } else {
      const currentValues = currentParams.getAll(keyToRemove);
      const newValues = currentValues.filter(v => v !== valueToRemove);
      currentParams.delete(keyToRemove);
      newValues.forEach(v => currentParams.append(keyToRemove, v));
    }

    return `/products?${currentParams.toString()}`;
  };

  return (
    <div>
      <Navbar />
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-1/4 lg:w-1/5">
          <div className="sticky top-24">
            <Filters />
          </div>
        </aside>

        <section className="w-full md:w-3/4 lg:w-4/5">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-heading-2">New Arrivals</h1>
            <div className="flex items-center gap-4">
              <p className="text-body text-dark-700">{totalCount} Results</p>
              <Sort />
            </div>
          </div>

          {activeFilters.length > 0 && (
            <div className="flex items-center flex-wrap gap-2 mb-4">
              <span className="text-body-medium">Active Filters:</span>
              {activeFilters.map(({ key, value }) => (
                <div key={`${key}-${value}`} className="flex items-center gap-1 px-3 py-1 bg-light-300 rounded-full text-caption">
                  <span>{value}</span>
                  <Link href={createRemoveFilterHref(key, value)} className="text-dark-500 hover:text-dark-900">
                    &times;
                  </Link>
                </div>
              ))}
              <Link href="/products" className="text-caption text-red underline hover:text-dark-900">
                Clear All
              </Link>
            </div>
          )}

          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Link href={`/products/${product.id}`} key={product.id}>
                  <Card product={product} />
                </Link>
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
    <Footer />
    </div>
  );
}