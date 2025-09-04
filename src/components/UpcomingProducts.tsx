import React from 'react';
import Image from 'next/image';

const upcomingProducts = [
  {
    id: 1,
    name: 'Futuristic Runner',
    image: '/shoes/shoe-5.avif',
  },
  {
    id: 2,
    name: 'Urban Explorer',
    image: '/shoes/shoe-6.avif',
  },
  {
    id: 3,
    name: 'Stealth Walker',
    image: '/shoes/shoe-7.avif',
  },
];

const UpcomingProducts = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900">Coming Soon</h2>
          <p className="text-lg text-gray-600 mt-2">
            Get ready for the next generation of footwear.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {upcomingProducts.map((product) => (
            <div
              key={product.id}
              className="relative group overflow-hidden rounded-lg shadow-lg"
            >
              <Image
                src={product.image}
                alt={product.name}
                width={400}
                height={400}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-end p-6">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {product.name}
                </h3>
                <span className="absolute top-4 right-4 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Coming Soon
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UpcomingProducts;
