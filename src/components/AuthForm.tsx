'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import SocialProviders from './SocialProviders';
import { signInOrUp } from '@/lib/auth/actions';

const AuthForm = () => {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect_url');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    if (redirectUrl) {
      formData.append('redirectUrl', redirectUrl);
    }

    const result = await signInOrUp(formData);

    if (result?.error) {
      const errorMessages = Object.values(result.error).flat();
      setError(errorMessages.join(' '));
    }
    // The redirect is handled by the server action, so no need for router.push here.
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="mt-3 text-heading-3 text-dark-900 text-center">
          Sign In or Create an Account
        </h1>
        <p className="text-lead text-dark-700 mt-2 mb-8">
          Enter your details below to continue.
        </p>
      </div>
      <SocialProviders variant="sign-in" />

      <div className="flex items-center gap-4">
        <hr className="h-px w-full border-0 bg-light-300" />
        <span className="shrink-0 text-caption text-dark-700">
          Or continue with
        </span>
        <hr className="h-px w-full border-0 bg-light-300" />
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="mb-4">
          <label htmlFor="name" className="block text-body text-dark-900 mb-2">
            Name (optional, for new accounts)
          </label>
          <input
            type="text"
            name="name"
            placeholder="Enter your name"
            className="w-full px-4 py-3 border border-light-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block text-body text-dark-900 mb-2">
            Email
          </label>
          <input
            type="email"
            name="email"
            placeholder="johndoe@gmail.com"
            required
            className="w-full px-4 py-3 border border-light-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green"
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="password"
            className="block text-body text-dark-900 mb-2"
          >
            Password
          </label>
          <input
            type="password"
            name="password"
            placeholder="minimum 8 characters"
            required
            className="w-full px-4 py-3 border border-light-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green"
          />
        </div>
        <div className="text-right mb-6">
          <Link href="#" className="text-green font-medium hover:underline">
            Forgot password?
          </Link>
        </div>
        <button
          type="submit"
          className="mt-2 w-full rounded-full bg-dark-900 px-6 py-3 text-body-medium text-light-100 hover:bg-dark-700 focus:outline-none focus:ring-2 focus:ring-dark-900/20"
        >
          Continue
        </button>
      </form>
      <p className="text-footnote text-dark-500 mt-6 text-center">
        By continuing, you agree to our{' '}
        <Link href="#" className="underline">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href="#" className="underline">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
};

export default AuthForm;
