import React from 'react';
import SocialProviders from './SocialProviders';

interface AuthFormProps {
  type: 'signIn' | 'signUp';
}

const AuthForm = ({ type }: AuthFormProps) => {
  const title = type === 'signIn' ? 'Sign In' : 'Sign Up';
  const buttonText = type === 'signIn' ? 'Sign In' : 'Sign Up';

  return (
    <div className="bg-light-100 p-8 rounded-lg shadow-md w-full max-w-md">
      <h1 className="text-heading-3 text-dark-900 mb-6 text-center">{title}</h1>
      <SocialProviders />
      <div className="flex items-center my-6">
        <hr className="w-full border-t border-light-400" />
        <span className="px-2 text-dark-700 text-caption">OR</span>
        <hr className="w-full border-t border-light-400" />
      </div>
      <form>
        <div className="mb-4">
          <label htmlFor="email" className="block text-body text-dark-900 mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
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
            className="w-full px-4 py-3 border border-light-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-green text-light-100 py-3 rounded-md hover:bg-opacity-90 transition-colors"
        >
          {buttonText}
        </button>
      </form>
    </div>
  );
};

export default AuthForm;
