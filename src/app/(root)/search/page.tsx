import { getAllProducts } from '@/lib/actions/product';
import Card from '@/components/Card';
import { unstable_noStore as noStore } from 'next/cache';

interface SearchPageProps {
    searchParams: {
        q: string;
    };
}

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default async function SearchPage({ searchParams }: SearchPageProps) {
    noStore();
    const { q } = searchParams;
    const { products } = await getAllProducts({ search: q, page: 1, limit: 20 });

    return (
        <div>
            <Navbar />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-3xl sm:text-4xl font-bold text-dark-900 mb-8">
                    Search results for &quot;{q}&quot;
                </h1>
                {products.length === 0 ? (
                    <p className="mt-4">No products found.</p>
                ) : (
                    <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
                        {products.map((product) => (
                            <Card key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}
