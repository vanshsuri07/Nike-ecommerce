"use client"

import React,{Suspense} from 'react';
import AuthForm from '../../../components/AuthForm';


const SignUpPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthForm type="signUp" />
    </Suspense>
  );
};

export default SignUpPage;
