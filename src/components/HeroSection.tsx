import React from 'react'
import Modal from "./Model"
const HeroSection = () => {
  return (
    <div className="relative w-full h-[550px] overflow-hidden">
  {/* Video Background */}
  <video 
  
   ref={(video) => {
    if (video) video.playbackRate = 2.0; // 1.0 = normal speed, 1.5 = faster
   }}
    className="absolute inset-0 w-full h-full object-cover"
    autoPlay
    loop
    muted
  >
    <source src="/herosection.mp4" type="video/mp4" />
  </video>

  {/* Dark Overlay (optional for better text visibility) */}
  <div className="absolute inset-0 bg-black/30"></div>

  {/* Content */}
  <div className="relative z-10 flex items-center justify-between h-full px-8 md:px-16">
  {/* Left Side Text */}
  <div className="max-w-lg">
    <h1 className="font-extrabold text-white mb-4 leading-[1.1]">
      <span className="block text-4xl md:text-6xl lg:text-8xl">Unleash</span>
      <span className="block text-4xl md:text-6xl lg:text-8xl">Your</span>
      <span className="block text-4xl md:text-6xl lg:text-8xl text-green-500">Speed</span>
    </h1>
    <button className="bg-red-600 text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-red-700 transition duration-300">
      Shop Now
    </button>
  </div>

  {/* Right Side Shoe */}
  {/* <div className="w-[400px] h-auto">
    <img 
      src="/shoe-model.png" 
      alt="Nike Shoe" 
      className="w-full h-auto object-contain drop-shadow-2xl"
    />
  </div> */}
  <Modal />
</div>

</div>

  )
}

export default HeroSection
