"use client"

import React from 'react';
import AuthForm from '../../../components/AuthForm';
import { signUp } from "../../../lib/auth/actions";

const SignUpPage = () => {
  return <AuthForm type="signUp" onSubmit={signUp} />;
};

export default SignUpPage;
