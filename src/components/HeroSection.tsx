"use client";

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion } from 'framer-motion';
import Model from './Model';
import { Float, OrbitControls, PresentationControls } from '@react-three/drei';
import Loader from './Loader';
import { Variants } from "framer-motion";

const headingVariants: Variants = {
  hidden: { opacity: 0, x: -50, filter: "blur(10px)" },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: {
      delay: i * 0.2,
      duration: 0.6,
      ease: [0.42, 0, 0.58, 1] as [number, number, number, number], // 👈 cast to cubic-bezier tuple
    },
  }),
};
const HeroSection = () => {
 




  return (
    <div className="relative w-full h-[450px] overflow-hidden">
      {/* Video Background */}
      <video
  ref={(video) => {
    if (video) video.playbackRate = 1.0;
  }}
  className="absolute inset-0 w-full h-full object-fill"
  autoPlay
  loop
  muted
  playsInline
>
  <source src="/Streamflow2.mp4" type="video/mp4" />
</video>
 
 
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 h-full w-full px-6 md:px-16">
        {/* Left Side: Text */}
        <div className="flex flex-col justify-center items-center md:items-start text-white pb-25 ml-16">
          <motion.h1
            className="font-semibold leading-tight text-center md:text-left"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.2,
                },
              },
            }}
          >
            <motion.span
              className="block text-3xl sm:text-4xl md:text-5xl lg:text-8xl"
              variants={headingVariants}
              custom={0}
            >
              Unleash
            </motion.span>
            <motion.span
              className="block text-3xl sm:text-4xl md:text-5xl lg:text-8xl"
              variants={headingVariants}
              custom={1}
            >
              Your
            </motion.span>
            <motion.span
              className="block text-3xl sm:text-4xl md:text-5xl lg:text-8xl text-green-500"
              variants={headingVariants}
              custom={2}
            >
              Speed
            </motion.span>
          </motion.h1>
          <motion.button
            className="mt-4 bg-green-600 hover:bg-green-700 transition px-6 py-2 text-base rounded-full font-semibold"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            Shop Now
          </motion.button>
        </div>

        {/* Right Side: 3D Model */}
        <div className="hidden md:flex justify-center items-center">
          <div className="w-full h-[600px]">
            <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
              <OrbitControls
                enableZoom={false}
                enablePan={false}
                autoRotate={false}
                maxPolarAngle={Math.PI / 2}
                minPolarAngle={Math.PI / 3}
              />
              <ambientLight intensity={1.5} />
              <directionalLight position={[5, 5, 5]} intensity={2} />
              <Suspense fallback={<Loader />}>
 


               <Float floatIntensity={1} speed={1}>
  <PresentationControls
  global
  snap
  rotation={[0, 0.3, 0]}
  polar={[-0.4, 0.4]}
  azimuth={[-1, 1]}
>
  <Model />
</PresentationControls>
</Float>
              </Suspense>
            </Canvas>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
