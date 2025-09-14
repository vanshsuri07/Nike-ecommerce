import { getWishlist } from '@/lib/actions/product';
import WishlistCard from '@/components/WishlistCard';
import { getCurrentUser } from '@/lib/auth/actions';
import { unstable_noStore as noStore } from 'next/cache';
import Link from 'next/link';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';

export default async function WishlistPage() {
    noStore();
    const user = await getCurrentUser();

    if (!user) {
        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Your Wishlist</h1>
                <p className="mt-4">
                    Please{' '}
                    <Link href="/sign-in" className="text-blue-500 hover:underline">
                        sign in
                    </Link>{' '}
                    to see your wishlist.
                </p>
            </div>
        );
    }

    const wishlist = await getWishlist(user.id);

    return (
        <>
        <Navbar />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Your Wishlist</h1>
            {wishlist.length === 0 ? (
                <p className="mt-4">Your wishlist is empty.</p>
            ) : (
                <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
                    {wishlist.map((product) => (
                        <WishlistCard key={product.id} product={product} userId={user.id} />
                    ))}
                </div>
            )}
        </div>
        <Footer />
        </>
    );
}
