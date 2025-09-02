import Link from 'next/link';

export default function ProductNotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-[50vh] text-center">
      <h1 className="text-heading-2 text-dark-900">Product Not Found</h1>
      <p className="mt-4 text-body text-dark-700">
        Sorry, we couldn't find the product you're looking for.
      </p>
      <Link href="/products" className="mt-8 bg-dark-900 text-light-100 py-3 px-6 rounded-full text-body-medium hover:bg-dark-700 transition-colors">
          Shop All Products
      </Link>
    </div>
  );
}
