import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black text-light-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8">

          <div className="md:col-span-1">
            <Link href="/" passHref className="text-light-100">
                <Image src="/logo.svg" alt="Logo" width={60} height={30} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 col-span-1 md:col-span-3 gap-8">
            <div>
              <h4 className="text-body-medium text-light-100">Featured</h4>
              <ul className="mt-4 space-y-2 text-dark-500">
                <li><Link href="#" className="hover:text-light-100">Air Force 1</Link></li>
                <li><Link href="#" className="hover:text-light-100">Huarache</Link></li>
                <li><Link href="#" className="hover:text-light-100">Air Max 90</Link></li>
                <li><Link href="#" className="hover:text-light-100">Air Max 95</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-body-medium text-light-100">Shoes</h4>
              <ul className="mt-4 space-y-2 text-dark-500">
                <li><Link href="#" className="hover:text-light-100">All Shoes</Link></li>
                <li><Link href="#" className="hover:text-light-100">Custom Shoes</Link></li>
                <li><Link href="#" className="hover:text-light-100">Jordan Shoes</Link></li>
                <li><Link href="#" className="hover:text-light-100">Running Shoes</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-body-medium text-light-100">Clothing</h4>
              <ul className="mt-4 space-y-2 text-dark-500">
                <li><Link href="#" className="hover:text-light-100">All Clothing</Link></li>
                <li><Link href="#" className="hover:text-light-100">Modest Wear</Link></li>
                <li><Link href="#" className="hover:text-light-100">Hoodies & Pullovers</Link></li>
                <li><Link href="#" className="hover:text-light-100">Shirts & Tops</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-body-medium text-light-100">Kids&apos;</h4>
              <ul className="mt-4 space-y-2 text-dark-500">
                <li><Link href="#" className="hover:text-light-100">Infant & Toddler Shoes</Link></li>
                <li><Link href="#" className="hover:text-light-100">Kids&apos; Shoes</Link></li>
                <li><Link href="#" className="hover:text-light-100">Kids&apos; Jordan Shoes</Link></li>
                <li><Link href="#" className="hover:text-light-100">Kids&apos; Basketball Shoes</Link></li>
              </ul>
            </div>
          </div>
          <div className="flex space-x-4 justify-center md:justify-end text-light-100">

            <Link href="#" passHref>
              <Image src="/x.svg" alt="X" width={24} height={24} />
            </Link>
            <Link href="#" passHref>
              <Image src="/facebook.svg" alt="Facebook" width={24} height={24} />
            </Link>
            <Link href="#" passHref>
              <Image src="/instagram.svg" alt="Instagram" width={24} height={24} />
            </Link>
          </div>
        </div>
        <div className="border-t border-dark-700 mt-8 pt-4 flex flex-col md:flex-row justify-between items-center text-footnote text-dark-500">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
            <span>&#x1F310; Croatia</span>
            <span className="ml-4">&copy; {new Date().getFullYear()} Nike, Inc. All Rights Reserved</span>
          </div>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="#" className="hover:text-light-100">Guides</Link>
            <Link href="#" className="hover:text-light-100">Terms of Sale</Link>
            <Link href="#" className="hover:text-light-100">Terms of Use</Link>
            <Link href="#" className="hover:text-light-100">Nike Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
