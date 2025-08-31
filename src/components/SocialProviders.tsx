import React from 'react';
import { Chrome, Apple } from 'lucide-react';

const SocialProviders = () => {
  return (
    <div className="flex flex-col gap-4">
      <button className="flex items-center justify-center gap-2 w-full bg-light-100 text-dark-900 py-3 px-4 rounded-md border border-light-400 hover:bg-light-200 transition-colors">
        <Chrome size={20} />
        <span>Sign in with Google</span>
      </button>
      <button className="flex items-center justify-center gap-2 w-full bg-dark-900 text-light-100 py-3 px-4 rounded-md hover:bg-opacity-90 transition-colors">
        <Apple size={20} />
        <span>Sign in with Apple</span>
      </button>
    </div>
  );
};

export default SocialProviders;
