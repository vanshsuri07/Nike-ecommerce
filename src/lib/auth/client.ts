// lib/auth/client.ts
'use client';
import { logger } from '@/lib/logger';

export async function signInClient(email: string, password: string) {
  try {
    const response = await fetch('/api/auth/sign-in/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
      credentials: 'include', // Important: include cookies
    });

    const result = await response.json();
    
    if (!response.ok) {
      logger.error('❌ [CLIENT-SIGNIN] Sign-in failed:', result);
      throw new Error(result.error?.message || result.message || 'Sign-in failed');
    }

    return result;
    
  } catch (error) {
    logger.error('💥 [CLIENT-SIGNIN] Error:', error);
    throw error;
  }
}

export async function signUpClient(name: string, email: string, password: string) {
  try {
    // First sign up
    const signUpResponse = await fetch('/api/auth/sign-up/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
      credentials: 'include',
    });

    if (!signUpResponse.ok) {
      const signUpResult = await signUpResponse.json();
      logger.error('❌ [CLIENT-SIGNUP] Sign-up failed:', signUpResult);
      throw new Error(signUpResult.error?.message || signUpResult.message || 'Sign-up failed');
    }

    const signUpResult = await signUpResponse.json();

    // Then sign in to get the session cookie
    const signInResult = await signInClient(email, password);
    
    return signInResult;
    
  } catch (error) {
    logger.error('💥 [CLIENT-SIGNUP] Error:', error);
    throw error;
  }
}

export async function getCurrentSession() {
  try {
    const response = await fetch('/api/auth/session', {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      return null;
    }

    const session = await response.json();
    return session;
    
  } catch (error) {
    logger.error('💥 [CLIENT-SESSION] Error getting session:', error);
    return null;
  }
}