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
  // Safely extract params for the data fetching function
  const filterParams = {
    gender: searchParams.gender,
    size: searchParams.size,
    color: searchParams.color,
    sort: Array.isArray(searchParams.sort) ? searchParams.sort[0] : searchParams.sort,
  };
  const productsData = getProducts(filterParams);

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

  // Safely generate active filters from the plain object
  const activeFilters = Object.entries(filterParams)
    .filter(([key, value]) => key !== 'sort' && value)
    .flatMap(([key, value]) => {
      const values = Array.isArray(value) ? value : String(value).split(',');
      return values.map(v => ({ key, value: v }));
    });

  const createRemoveFilterHref = (keyToRemove: string, valueToRemove: string) => {
    // Create a mutable URLSearchParams instance from the incoming searchParams
    const newParams = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (Array.isArray(value)) {
        value.forEach(v => newParams.append(key, v));
      } else if (value) {
        newParams.set(key, value);
      }
    }

    // Get the current values for the key we're modifying
    const currentValues = newParams.getAll(keyToRemove);
    // Filter out the value to remove
    const newValues = currentValues.filter(v => v !== valueToRemove);

    // Delete the key entirely to clear it
    newParams.delete(keyToRemove);

    // Add back the remaining values
    newValues.forEach(v => newParams.append(keyToRemove, v));

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