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
          {/* Left - Logo */}
          <div className="flex-shrink-0">
            <Link href="/" passHref>
              <Image
                src="/nikelogo.jpg"
                alt="Logo"
                width={90}
                height={40}
                className="cursor-pointer"
              />
            </Link>
          </div>

          {/* Middle - Nav Items (Desktop) */}
          <div className="hidden md:flex md:items-center md:space-x-8 absolute left-1/2 transform -translate-x-1/2">
            <Link href="/products?gender=Men" className="text-light-100 hover:text-green-500 transition-colors">Men</Link>
            <Link href="/products?gender=Women" className="text-light-100 hover:text-green-500 transition-colors">Women</Link>
            <Link href="/products?gender=Kids" className="text-light-100 hover:text-green-500 transition-colors">Kids</Link>
            <Link href="/products" className="text-light-100 hover:text-green-500 transition-colors">Collections</Link>
            <Link href="/wishlist" className="text-light-100 hover:text-green-500 transition-colors">Wishlist</Link>
            <Link href="/contact" className="text-light-100 hover:text-green-500 transition-colors">Contact</Link>
          </div>

          {/* Right - Search, Cart, and Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-4">
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
                    d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-black">
            <ul className="flex flex-col p-4 space-y-4">
              <li><Link href="/products?gender=Men" className="text-light-100 hover:text-green-500 block">Men</Link></li>
              <li><Link href="/products?gender=Women" className="text-light-100 hover:text-green-500 block">Women</Link></li>
              <li><Link href="/products?gender=Kids" className="text-light-100 hover:text-green-500 block">Kids</Link></li>
              <li><Link href="/products" className="text-light-100 hover:text-green-500 block">Collections</Link></li>
              <li><Link href="/wishlist" className="text-light-100 hover:text-green-500 block">Wishlist</Link></li>
              <li><Link href="/contact" className="text-light-100 hover:text-green-500 block">Contact</Link></li>
              <li className="pt-4 border-t border-gray-700"><Search /></li>
              <li><CartIndicator /></li>
            </ul>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
