"use client"

import React from 'react';
import AuthForm from '../../../components/AuthForm';
import { signUp } from "../../../lib/auth/actions";

const SignUpPage = () => {
  const handleSignUp = async (data: FormData) => {
    await signUp(data);
  };
  
  return <AuthForm type="signUp" onSubmit={handleSignUp} />;
};

export default SignUpPage;
