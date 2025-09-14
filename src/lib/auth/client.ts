// lib/auth/client.ts
'use client';

export async function signInClient(email: string, password: string) {
  console.log('🔑 [CLIENT-SIGNIN] Starting client-side sign-in...');
  
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

    console.log('📨 [CLIENT-SIGNIN] Response:', {
      status: response.status,
      ok: response.ok,
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error('❌ [CLIENT-SIGNIN] Sign-in failed:', result);
      throw new Error(result.error?.message || result.message || 'Sign-in failed');
    }

    console.log('✅ [CLIENT-SIGNIN] Sign-in successful');
    return result;
    
  } catch (error) {
    console.error('💥 [CLIENT-SIGNIN] Error:', error);
    throw error;
  }
}

export async function signUpClient(name: string, email: string, password: string) {
  console.log('📝 [CLIENT-SIGNUP] Starting client-side sign-up...');
  
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

    console.log('📨 [CLIENT-SIGNUP] Sign-up response:', {
      status: signUpResponse.status,
      ok: signUpResponse.ok,
    });

    if (!signUpResponse.ok) {
      const signUpResult = await signUpResponse.json();
      console.error('❌ [CLIENT-SIGNUP] Sign-up failed:', signUpResult);
      throw new Error(signUpResult.error?.message || signUpResult.message || 'Sign-up failed');
    }

    const signUpResult = await signUpResponse.json();
    console.log('✅ [CLIENT-SIGNUP] Sign-up successful');

    // Then sign in to get the session cookie
    console.log('🔑 [CLIENT-SIGNUP] Auto sign-in after sign-up...');
    const signInResult = await signInClient(email, password);
    
    return signInResult;
    
  } catch (error) {
    console.error('💥 [CLIENT-SIGNUP] Error:', error);
    throw error;
  }
}

export async function getCurrentSession() {
  console.log('🔍 [CLIENT-SESSION] Getting current session...');
  
  try {
    const response = await fetch('/api/auth/session', {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      console.log('❌ [CLIENT-SESSION] No session found');
      return null;
    }

    const session = await response.json();
    console.log('✅ [CLIENT-SESSION] Session found:', {
      hasUser: !!session.user,
      userId: session.user?.id
    });
    
    return session;
    
  } catch (error) {
    console.error('💥 [CLIENT-SESSION] Error getting session:', error);
    return null;
  }
}