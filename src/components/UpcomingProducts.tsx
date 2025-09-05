"use client";
import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const UpcomingProducts = () => {
  return (
    <section className="py-12 bg-gray-900 text-white">
      <div className="container mx-auto px-4">
        <div className="relative grid grid-cols-1 md:grid-cols-2 items-center gap-8 bg-gray-800 rounded-lg shadow-2xl overflow-hidden">
          {/* Background Spotlight Effect */}
          <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-green-500/20 rounded-full filter blur-3xl opacity-50" />
          <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-blue-500/20 rounded-full filter blur-3xl opacity-50" />

          {/* Left Side: Text Content */}
          <motion.div
            className="p-8 md:p-12 z-10"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <span className="text-sm font-bold tracking-widest uppercase text-green-400">
              Limited Edition
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold mt-2 mb-4 leading-tight">
              The Future of Speed
            </h2>
            <p className="text-gray-300 mb-6">
              Unveiling a new era of performance. This exclusive drop is engineered for the ultimate athlete. Be the first to experience it.
            </p>
            <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full transition-transform transform hover:scale-105">
              Get Notified
            </button>
          </motion.div>

          {/* Right Side: Product Image */}
          <motion.div
            className="relative h-64 md:h-full w-full"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          >
            <Image
              src="/shoes/shoe-8.avif"
              alt="Limited Edition Upcoming Shoe"
              layout="fill"
              objectFit="contain"
              className="drop-shadow-2xl -rotate-12"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default UpcomingProducts;
