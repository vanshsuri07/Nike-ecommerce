"use client";
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import Model from './Model';
import { OrbitControls } from '@react-three/drei';

const HeroSection = () => {
  return (
    <div className="relative w-full h-[450px] overflow-hidden">
      {/* Video Background */}
      <video
        ref={(video) => {
          if (video) video.playbackRate = 2.0;
        }}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="/herosection.mp4" type="video/mp4" />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 h-full w-full px-6 md:px-16">
        {/* Left Side: Text */}
        <div className="flex flex-col justify-center items-center md:items-start text-white pb-25 ml-16">
          <h1 className="font-extrabold leading-tight text-center md:text-left ">
            <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-8xl ">
              Unleash
            </span>
            <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-8xl">
              Your
            </span>
            <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-8xl text-green-500">
              Speed
            </span>
          </h1>
          <button className="mt-4 bg-green-600 hover:bg-green-700 transition px-6 py-2 text-base rounded-full font-semibold">
            Shop Now
          </button>
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
              <Suspense fallback={null}>
                <Model />
              </Suspense>
            </Canvas>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
