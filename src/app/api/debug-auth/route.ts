// app/api/debug-session/route.ts
import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth/actions';
import { cookies } from 'next/headers';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  console.log('🔍 [DEBUG-SESSION] Starting session debug...');
  
  // Check cookies
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  console.log('🍪 [DEBUG-SESSION] All cookies:', allCookies.map(c => `${c.name}=${c.value.slice(0, 10)}...`));
  
  const sessionDataCookie = cookieStore.get('better-auth.session_data');
  const sessionTokenCookie = cookieStore.get('better-auth.session_token');
  console.log('🎫 [DEBUG-SESSION] Session cookies:', {
    sessionData: sessionDataCookie ? `Found: ${sessionDataCookie.value.slice(0, 8)}...` : 'Not found',
    sessionToken: sessionTokenCookie ? `Found: ${sessionTokenCookie.value.slice(0, 8)}...` : 'Not found'
  });
  
  // Test direct auth API call
  try {
    const headers = new Headers();
    allCookies.forEach(cookie => {
      headers.append('cookie', `${cookie.name}=${cookie.value}`);
    });
    
    console.log('📤 [DEBUG-SESSION] Testing direct auth.api.getSession...');
    const directSession = await auth.api.getSession({ headers });
    console.log('🔍 [DEBUG-SESSION] Direct session result:', {
      hasSession: !!directSession,
      hasUser: !!directSession?.user,
      userId: directSession?.user?.id,
      sessionId: directSession?.session?.id
    });
  } catch (error) {
    console.error('💥 [DEBUG-SESSION] Direct session error:', error);
  }
  
  // Test getCurrentUser function
  console.log('👤 [DEBUG-SESSION] Testing getCurrentUser function...');
  const user = await getCurrentUser();
  console.log('🔍 [DEBUG-SESSION] getCurrentUser result:', user);
  
  return Response.json({
    cookies: allCookies.map(c => ({ name: c.name, hasValue: !!c.value })),
    sessionDataCookie: !!sessionDataCookie,
    sessionTokenCookie: !!sessionTokenCookie,
    user: user ? { id: user.id, email: user.email } : null,
    timestamp: new Date().toISOString()
  });
}