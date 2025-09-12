"use client"
import React from 'react';
import Link from 'next/link';
import SocialProviders from './SocialProviders';
import { useSearchParams } from 'next/navigation';
import { signUp, signIn } from '@/lib/auth/actions'; // Import your server actions
import { toast } from 'sonner';

interface AuthFormProps {
  type: 'signIn' | 'signUp';
}

const AuthForm = ({ type }: AuthFormProps) => {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect_url');
  const email = searchParams.get('email');

  const title = type === 'signIn' ? 'Welcome back' : 'Join Nike Today!';
  const subtitle =
    type === 'signIn'
      ? 'Please enter your details to sign in to your account'
      : 'Create your account to start your fitness journey';
  const buttonText = type === 'signIn' ? 'Sign In' : 'Sign Up';
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, setIsPending] = React.useState(false);

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setError(null);
  setIsPending(true);

  // Helper function to get appropriate error message
  const getErrorMessage = (type: string, errorMessage: string) => {
    const lowerError = errorMessage.toLowerCase();

    if (type === 'signUp') {
      if (lowerError.includes('email') || lowerError.includes('already') ||
          lowerError.includes('exists') || lowerError.includes('duplicate')) {
        return 'Email already exists. Please use a different email.';
      }
      return 'Failed to create account. Please try again.';
    } else {
      if (lowerError.includes('email') || lowerError.includes('password') ||
          lowerError.includes('invalid') || lowerError.includes('credentials')) {
        return 'Email or password is incorrect.';
      }
      return 'Sign-in failed. Please try again.';
    }
  };

  try {
    const formData = new FormData(e.currentTarget);
    if (redirectUrl) {
      formData.append('redirectUrl', redirectUrl);
    }

    const result = type === 'signUp' 
      ? await signUp(formData) 
      : await signIn(formData);

    console.log('Auth result:', result);

    // Check if there's an error
    if (result?.error) {
      const errorMessages = Object.values(result.error).flat();
      const rawErrorMessage = errorMessages.join(' ');
      const formattedError = getErrorMessage(type, rawErrorMessage);
      setError(formattedError);
      toast.error(formattedError);
      return;
    }

    // The server actions will handle redirection on success.
    // If the action returns, it's because of an error.
    if (result?.error) {
      const errorMessages = Object.values(result.error).flat();
      const rawErrorMessage = errorMessages.join(' ');
      const formattedError = getErrorMessage(type, rawErrorMessage);
      setError(formattedError);
      toast.error(formattedError);
    }

  } catch (err) {
    console.error('Auth error:', err);
    const errorMessage = (err as Error)?.message || 'An unexpected error occurred';
    const formattedError = getErrorMessage(type, errorMessage);
    setError(formattedError);
    toast.error(formattedError);
  } finally {
    setIsPending(false);
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
            <input type="hidden" name="redirectUrl" value={redirectUrl || ''} />
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            {type === 'signUp' && (
          <div className="mb-4">
            <label htmlFor="name" className="block text-body text-dark-900 mb-2">
                  Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              required
              disabled={isPending}
              className="w-full px-4 py-3 border border-light-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green disabled:opacity-50"
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
            defaultValue={email || ''}
            required
            disabled={isPending}
            className="w-full px-4 py-3 border border-light-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green disabled:opacity-50"
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="password"
            className=" text-caption text-dark-900"
          >
            Password
          </label>
            
<input
  type="password"
  name="password"
  placeholder="minimum 8 characters"
  required
  disabled={isPending}
  className="w-full rounded-xl border border-light-300 bg-light-100 px-4 py-3 pr-12 text-lg text-dark-900 placeholder:text-dark-500 focus:outline-none focus:ring-2 focus:ring-dark-900/10"
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
          disabled={isPending}
          className="mt-2 w-full rounded-full bg-dark-900 px-6 py-3 text-body-medium text-light-100 hover:bg-dark-700 focus:outline-none focus:ring-2 focus:ring-dark-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (type === 'signUp' ? 'Creating Account...' : 'Signing In...') : buttonText}
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