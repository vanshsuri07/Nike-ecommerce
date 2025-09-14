import { getCart } from '@/lib/actions/cart';
import Cart from '@/components/Cart';
import { getCurrentUser } from '@/lib/auth/actions';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default async function CartPage() {
  const cart = await getCart();
  const user = await getCurrentUser();

  return (
    <div>
      <Navbar />
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl sm:text-4xl font-bold text-dark-900 mb-8">Your Cart</h1>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Cart initialCart={cart as any} user={user as any} />

    </div>
      <Footer />
    </div>
  );
}
