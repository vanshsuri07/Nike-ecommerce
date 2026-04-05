// lib/auth/post-auth-actions.ts
'use server';

import { getGuestSession, mergeGuestCartWithUserCart } from './actions';
import { logger } from '@/lib/logger';

export async function handlePostAuthActions(
  type: 'signIn' | 'signUp',
  email: string,
  userId: string
) {
  try {
    // Get guest session for cart merging
    const guest = await getGuestSession();
    
    if (guest) {
      await mergeGuestCartWithUserCart(userId, guest.id);
    }
    
    return { success: true };
    
  } catch (error) {
    logger.error('💥 [POST-AUTH] Error in post-auth actions:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}