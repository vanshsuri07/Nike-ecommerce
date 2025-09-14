// lib/auth/post-auth-actions.ts
'use server';

import { getGuestSession, mergeGuestCartWithUserCart } from './actions';

export async function handlePostAuthActions(
  type: 'signIn' | 'signUp',
  email: string,
  userId: string
) {
  console.log(`🔄 [POST-AUTH] Handling post-${type} actions for user:`, userId);
  
  try {
    // Get guest session for cart merging
    console.log('🎭 [POST-AUTH] Getting guest session...');
    const guest = await getGuestSession();
    console.log('🔍 [POST-AUTH] Guest session:', guest ? `ID: ${guest.id}` : 'None');
    
    if (guest) {
      console.log('🛒 [POST-AUTH] Merging guest cart with user cart...');
      await mergeGuestCartWithUserCart(userId, guest.id);
      console.log('✅ [POST-AUTH] Cart merge completed');
    } else {
      console.log('ℹ️ [POST-AUTH] No guest session found, skipping cart merge');
    }
    
    console.log('🎉 [POST-AUTH] Post-auth actions completed successfully');
    return { success: true };
    
  } catch (error) {
    console.error('💥 [POST-AUTH] Error in post-auth actions:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}