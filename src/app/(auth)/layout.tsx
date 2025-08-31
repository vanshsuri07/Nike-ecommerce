import React from 'react';
import Image from 'next/image';

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 bg-dark-900 text-light-100 p-8 flex-col justify-between">
        <div>
          <Image src="/logo.svg" alt="Logo" width={40} height={40} />
        </div>
        <div>
          <h1 className="text-heading-2">Just Do It</h1>
          <p className="text-lead mt-4">
            Join millions of athletes and fitness enthusiasts who trust Nike for
            their performance needs.
          </p>
        </div>
        <div className="text-footnote text-dark-500">
          © {new Date().getFullYear()} Nike, Inc. All Rights Reserved.
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-light-100">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
