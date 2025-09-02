import React from 'react';
import AuthForm from '../../../components/AuthForm';
import { signIn } from "../../../lib/auth/actions";

const SignInPage = () => {
  const handleSignIn = async (data: FormData) => {
    await signIn(data);
  };
  
  return <AuthForm type="signIn" onSubmit={handleSignIn} />;
};

export default SignInPage;
