'use client';

import React, { Suspense } from 'react';
import AuthForm from '../../../components/AuthForm';

const SignInPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthForm type="signIn" />
    </Suspense>
  );
};

export default SignInPage;
