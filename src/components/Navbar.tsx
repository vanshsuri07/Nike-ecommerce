import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const Navbar: React.FC = () => {
  return (
    <header className="bg-light-100">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="/" passHref className="text-dark-900">
              <Image src="/logo.svg" alt="Logo" width={60} height={30} />
            </Link>
          </div>
          <div className="hidden md:flex md:items-center md:space-x-8">
            <Link href="#" className="text-dark-900 hover:text-green text-body">Men</Link>
            <Link href="#" className="text-dark-900 hover:text-green text-body">Women</Link>
            <Link href="#" className="text-dark-900 hover:text-green text-body">Kids</Link>
            <Link href="#" className="text-dark-900 hover:text-green text-body">Collections</Link>
            <Link href="#" className="text-dark-900 hover:text-green text-body">Contact</Link>
          </div>
          <div className="hidden md:flex md:items-center md:space-x-8">
            <span className="text-dark-900 text-body">Search</span>
            <span className="text-dark-900 text-body">My Cart (2)</span>
          </div>
          <div className="md:hidden flex items-center">
            <button className="text-dark-900 focus:outline-none">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
