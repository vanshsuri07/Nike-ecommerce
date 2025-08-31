import React from 'react';
import Link from 'next/link';
import SocialProviders from './SocialProviders';

interface AuthFormProps {
  type: 'signIn' | 'signUp';
}

const AuthForm = ({ type }: AuthFormProps) => {
  const title = type === 'signIn' ? 'Welcome back' : 'Join Nike Today!';
  const subtitle =
    type === 'signIn'
      ? 'Please enter your details to sign in to your account'
      : 'Create your account to start your fitness journey';
  const buttonText = type === 'signIn' ? 'Sign In' : 'Sign Up';

  return (
    <div className="w-full max-w-md">
      <div className="text-right mb-6">
        <p className="text-body text-dark-700">
          {type === 'signIn'
            ? "Don't have an account? "
            : 'Already have an account? '}
          <Link href={type === 'signIn' ? '/sign-up' : '/sign-in'} className="text-green font-medium hover:underline">
            {type === 'signIn' ? 'Sign Up' : 'Sign In'}
          </Link>
        </p>
      </div>
      <h1 className="text-heading-2 text-dark-900">{title}</h1>
      <p className="text-lead text-dark-700 mt-2 mb-8">{subtitle}</p>
      <SocialProviders />
      <div className="flex items-center my-8">
        <hr className="w-full border-t border-light-400" />
        <span className="px-4 text-dark-700 text-caption">OR</span>
        <hr className="w-full border-t border-light-400" />
      </div>
      <form>
        {type === 'signUp' && (
          <div className="mb-4">
            <label htmlFor="name" className="block text-body text-dark-900 mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              placeholder="Enter your full name"
              className="w-full px-4 py-3 border border-light-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green"
            />
          </div>
        )}
        <div className="mb-4">
          <label htmlFor="email" className="block text-body text-dark-900 mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            placeholder="johndoe@gmail.com"
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
            id="password"
            placeholder="minimum 8 characters"
            className="w-full px-4 py-3 border border-light-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green"
          />
        </div>
        {type === 'signIn' && (
          <div className="text-right mb-6">
            <Link href="#" className="text-green font-medium hover:underline">
              Forgot password?
            </Link>
          </div>
        )}
        <button
          type="submit"
          className="w-full bg-dark-900 text-light-100 py-4 rounded-full hover:bg-opacity-90 transition-colors text-body-medium"
        >
          {buttonText}
        </button>
      </form>
      <p className="text-footnote text-dark-500 mt-6 text-center">
        By signing up, you agree to our{' '}
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
