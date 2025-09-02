import React from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Card from '../../components/Card';
import Footer from '../../components/Footer';
import { Product } from '../../types';
import { getCurrentUser } from "../../lib/auth/actions"

const products: Product[] = [
  {
    id: 1,
    name: "Nike Air Force 1 Mid '07",
    description: null,
    price: '98.30',
    image: '/shoes/shoe-1.jpg',
    category: "Men's Shoes",
    colors: '6 Colour',
    bestseller: true,
  },
  {
    id: 2,
    name: 'Nike Air Max 90',
    description: null,
    price: '130.00',
    image: '/shoes/shoe-2.webp',
    category: "Women's Shoes",
    colors: '4 Colour',
    bestseller: false,
  },
  {
    id: 3,
    name: 'Nike Jordan Low',
    description: null,
    price: '110.00',
    image: '/shoes/shoe-3.webp',
    category: "Kids' Shoes",
    colors: '8 Colour',
    bestseller: false,
  },
  {
    id: 4,
    name: 'Nike Air Zoom Pegasus 37',
    description: null,
    price: '120.00',
    image: '/shoes/shoe-4.webp',
    category: "Men's Shoes",
    colors: '5 Colour',
    bestseller: false,
  }
];

const Page = async () => {
  const currentUser = await getCurrentUser();
  console.log('Current User:', currentUser);
  return (
    <div className="bg-light-100">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-heading-1 text-dark-900 mb-8">Our Products</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <Link href={`/products/${product.id}`} key={product.id}>
              <Card product={product} />
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Page;
