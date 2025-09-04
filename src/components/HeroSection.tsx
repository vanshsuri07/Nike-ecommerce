"use client";
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import Model from './Model';

const HeroSection = () => {
  return (
    <div className="relative w-full h-[550px] md:h-[650px] lg:h-[750px] overflow-hidden">
      {/* Video Background */}
      <video
        ref={(video) => {
          if (video) video.playbackRate = 0.5;
        }}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="/herosection.mp4" type="video/mp4" />
      </video>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Content Grid */}
      <div className="relative z-10 grid md:grid-cols-2 items-center h-full px-8 md:px-16">
        {/* Left Side: Text */}
        <div className="max-w-lg text-center md:text-left">
          <h1 className="font-extrabold text-white mb-4 leading-tight">
            <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-8xl">
              Unleash
            </span>
            <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-8xl">
              Your
            </span>
            <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-8xl text-green-500">
              Speed
            </span>
          </h1>
          <button className="bg-green-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-green-700 transition duration-300 mt-4">
            Shop Now
          </button>
        </div>

        {/* Right Side: 3D Model */}
        <div className="hidden md:flex justify-center items-center w-full h-full">
          <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
            <ambientLight intensity={1.5} />
            <directionalLight position={[5, 5, 5]} intensity={2} />
            <Suspense fallback={null}>
              <Model />
            </Suspense>
          </Canvas>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
