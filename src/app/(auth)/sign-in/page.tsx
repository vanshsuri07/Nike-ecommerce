"use client"

import React from 'react';
import AuthForm from '../../../components/AuthForm';
import { signIn } from "../../../lib/auth/actions";

const SignInPage = () => {
  const handleSubmit = async (data: FormData): Promise<void> => {
    await signIn(data);
  };

  return <AuthForm type="signIn" onSubmit={handleSubmit} />;
};

export default SignInPage;
