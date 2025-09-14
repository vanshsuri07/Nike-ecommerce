import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black text-light-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Logo */}
          <div className="md:col-span-2 lg:col-span-3">
            <Link href="/" passHref>
              <Image src="/logo.svg" alt="Logo" width={60} height={30} />
            </Link>
          </div>

          {/* Links */}
          <div className="md:col-span-8 lg:col-span-6 grid grid-cols-2 sm:grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold text-light-100">Featured</h4>
              <ul className="mt-4 space-y-2 text-dark-500">
                <li><Link href="#" className="hover:text-light-100 transition-colors">Air Force 1</Link></li>
                <li><Link href="#" className="hover:text-light-100 transition-colors">Huarache</Link></li>
                <li><Link href="#" className="hover:text-light-100 transition-colors">Air Max 90</Link></li>
                <li><Link href="#" className="hover:text-light-100 transition-colors">Air Max 95</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-light-100">Shoes</h4>
              <ul className="mt-4 space-y-2 text-dark-500">
                <li><Link href="#" className="hover:text-light-100 transition-colors">All Shoes</Link></li>
                <li><Link href="#" className="hover:text-light-100 transition-colors">Custom Shoes</Link></li>
                <li><Link href="#" className="hover:text-light-100 transition-colors">Jordan Shoes</Link></li>
                <li><Link href="#" className="hover:text-light-100 transition-colors">Running Shoes</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-light-100">Clothing</h4>
              <ul className="mt-4 space-y-2 text-dark-500">
                <li><Link href="#" className="hover:text-light-100 transition-colors">All Clothing</Link></li>
                <li><Link href="#" className="hover:text-light-100 transition-colors">Modest Wear</Link></li>
                <li><Link href="#" className="hover:text-light-100 transition-colors">Hoodies & Pullovers</Link></li>
                <li><Link href="#" className="hover:text-light-100 transition-colors">Shirts & Tops</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-light-100">Kids'</h4>
              <ul className="mt-4 space-y-2 text-dark-500">
                <li><Link href="#" className="hover:text-light-100 transition-colors">Infant & Toddler Shoes</Link></li>
                <li><Link href="#" className="hover:text-light-100 transition-colors">Kids' Shoes</Link></li>
                <li><Link href="#" className="hover:text-light-100 transition-colors">Kids' Jordan Shoes</Link></li>
                <li><Link href="#" className="hover:text-light-100 transition-colors">Kids' Basketball Shoes</Link></li>
              </ul>
            </div>
          </div>

          {/* Social Icons */}
          <div className="md:col-span-2 lg:col-span-3 flex justify-start md:justify-end space-x-4 text-light-100">
            <Link href="#" passHref>
              <Image src="/x.svg" alt="X" width={24} height={24} className="hover:opacity-80 transition-opacity" />
            </Link>
            <Link href="#" passHref>
              <Image src="/facebook.svg" alt="Facebook" width={24} height={24} className="hover:opacity-80 transition-opacity" />
            </Link>
            <Link href="#" passHref>
              <Image src="/instagram.svg" alt="Instagram" width={24} height={24} className="hover:opacity-80 transition-opacity" />
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-dark-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-dark-500">
          <div className="flex items-center mb-4 md:mb-0">
            <span className="mr-4">&#x1F310; Croatia</span>
            <span>&copy; {new Date().getFullYear()} Nike, Inc. All Rights Reserved</span>
          </div>
          <div className="flex flex-wrap justify-center space-x-4">
            <Link href="#" className="hover:text-light-100 transition-colors">Guides</Link>
            <Link href="#" className="hover:text-light-100 transition-colors">Terms of Sale</Link>
            <Link href="#" className="hover:text-light-100 transition-colors">Terms of Use</Link>
            <Link href="#" className="hover:text-light-100 transition-colors">Nike Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
