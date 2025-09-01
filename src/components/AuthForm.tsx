"use client"
import React from 'react';
import Link from 'next/link';
import SocialProviders from './SocialProviders';
import  {useRouter} from 'next/navigation';

interface AuthFormProps {
  type: 'signIn' | 'signUp';
  onSubmit: (data: FormData) => Promise<void>;
}

const AuthForm = ({ type, onSubmit }: AuthFormProps) => {
  const title = type === 'signIn' ? 'Welcome back' : 'Join Nike Today!';
  const subtitle =
    type === 'signIn'
      ? 'Please enter your details to sign in to your account'
      : 'Create your account to start your fitness journey';
  const buttonText = type === 'signIn' ? 'Sign In' : 'Sign Up';
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
   try {
    await onSubmit(formData);
    router.push('/');
  } catch (e) {
    console.log(e);
  }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-caption text-dark-700">
          {type === 'signIn'
                ? "Don't have an account? "
                : 'Already have an account? '}
          <Link href={type === 'signIn' ? '/sign-up' : '/sign-in'} className="text-green font-medium hover:underline">
                {type === 'signIn' ? 'Sign Up' : 'Sign In'}
              </Link>
            </p>
      
      <h1 className="mt-3 text-heading-3 text-dark-900 text-center">{title}</h1>
      <p className="text-lead text-dark-700 mt-2 mb-8">{subtitle}</p>
      </div>
      <SocialProviders variant={type === 'signIn' ? 'sign-in' : 'sign-up'} />

      <div className="flex items-center gap-4">
        <hr className="h-px w-full border-0 bg-light-300" />
        <span className="shrink-0 text-caption text-dark-700">
          Or {type === "signIn" ? "sign in" : "sign up"} with
        </span>
        <hr className="h-px w-full border-0 bg-light-300" />
      </div>

      <form
        className="space-y-4"
        onSubmit={handleSubmit}
      >
            {type === 'signUp' && (
          <div className="mb-4">
            <label htmlFor="name" className="block text-body text-dark-900 mb-2">
                  Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
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
            name="email"
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
              name="password"
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
          className="mt-2 w-full rounded-full bg-dark-900 px-6 py-3 text-body-medium text-light-100 hover:bg-dark-700 focus:outline-none focus:ring-2 focus:ring-dark-900/20"
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
