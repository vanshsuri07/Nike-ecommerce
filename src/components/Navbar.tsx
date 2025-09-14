'use client';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import CartIndicator from './CartIndicator';
import Search from './Search';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);


  return (
    <header className="sticky top-0 bg-black z-50">
  <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between h-16">
      <div className="flex-shrink-0">
        <Link href="/" passHref className="text-light-100">
          <Image src="/nikelogo.jpg" alt="Logo" width={90} height={40} />
        </Link>
      </div>

      <div className="hidden md:flex md:items-center md:space-x-8">
        <Link href="/products?gender=Men" className="text-light-100 hover:text-green text-body">Men</Link>
        <Link href="/products?gender=Women" className="text-light-100 hover:text-green text-body">Women</Link>
        <Link href="/products?gender=Kids" className="text-light-100 hover:text-green text-body">Kids</Link>
        <Link href="/products" className="text-light-100 hover:text-green text-body">Collections</Link>
        <Link href="/wishlist" className="text-light-100 hover:text-green text-body">Wishlist</Link>
        <Link href="/contact" className="text-light-100 hover:text-green text-body">Contact</Link>
      </div>

      <div className="hidden md:flex md:items-center md:space-x-8">
        <Search />
        <CartIndicator />
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden flex items-center">
        <button
          className="text-light-100 focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </button>
      </div>
    </div>

    {/* Mobile Menu */}
    {isOpen && (
      <div className="absolute top-16 left-0 w-full bg-white shadow-md md:hidden">
        <ul className="flex flex-col p-4 space-y-2">
          <Link href="/products?gender=Men" className="text-black hover:text-green text-body">Men</Link>
          <Link href="/products?gender=Women" className="text-black hover:text-green text-body">Women</Link>
          <Link href="#" className="text-black hover:text-green text-body">Kids</Link>
          <Link href="#" className="text-black hover:text-green text-body">Collections</Link>
          <Link href="#" className="text-black hover:text-green text-body">Contact</Link>
        </ul>
      </div>
    )}
  </nav>
</header>

);
};

export default Navbar;
