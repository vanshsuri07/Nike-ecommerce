import React from 'react';
import AuthForm from '../../../components/AuthForm';
import { signIn } from 'lib/auth/actions';

const SignInPage = () => {
  return <AuthForm type="signIn" onSubmit={signIn} />;
};

export default SignInPage;
