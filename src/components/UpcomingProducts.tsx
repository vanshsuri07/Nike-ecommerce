"use client";
import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const UpcomingProducts = () => {
  return (
    <section className="py-8 bg-gray-900 text-white">
      <div className="container mx-auto px-4">
        <div className="relative grid grid-cols-1 md:grid-cols-2 items-center gap-6 bg-gray-800 rounded-lg shadow-2xl overflow-hidden min-h-[300px]">
          {/* Background Glow - Fixed positioning */}
          <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-green-500/20 rounded-full blur-3xl opacity-50 -translate-x-1/4 -translate-y-1/4" />
          <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-blue-500/20 rounded-full blur-3xl opacity-50 translate-x-1/4 translate-y-1/4" />

          {/* Text */}
          <motion.div
            className="p-6 md:p-8 z-10 relative"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <span className="text-sm font-bold tracking-widest uppercase text-green-400">
              Limited Edition
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold mt-2 mb-3 leading-tight">
              The Future of Speed
            </h2>
            <p className="text-gray-300 mb-4 text-sm md:text-base">
              Unveiling a new era of performance. This exclusive drop is engineered for the ultimate athlete.
            </p>
            <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-full transition-transform hover:scale-105 text-sm">
              Get Notified
            </button>
          </motion.div>

          {/* Image */}
          <motion.div
            className="relative h-56 md:h-[280px] w-full flex justify-center items-center z-10"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <motion.div
              className="relative w-full h-full"
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 5, ease: "easeInOut", repeat: Infinity }}
            >
              <Image
                src="/shoes/shoe-8.avif"
                alt="Limited Edition Upcoming Shoe"
                fill
                style={{ objectFit: "contain" }}
                className="drop-shadow-2xl -rotate-12"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default UpcomingProducts;
