'use server';

import { auth } from './index';
import { db } from '@/db';
import * as schema from '@/lib/db/schema';
import { logger } from '@/lib/logger';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';
import { signInSchema, signUpSchema } from './validation';
import { redirect } from 'next/navigation';
import { BetterAuthError } from 'better-auth';
import { and, eq } from 'drizzle-orm';

export async function signUp(data: FormData) {
  const formData = Object.fromEntries(data);
  const parsed = signUpSchema.safeParse(formData);

  if (!parsed.success) {
    logger.error('Sign-up validation failed:', parsed.error);
    return {
      error: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const guest = await getGuestSession();
    
    // Create user with proper headers
    const cookieStore = await cookies();
    const headers = new Headers();
    
    // Get all cookies and set them in headers
    cookieStore.getAll().forEach(cookie => {
      headers.append('cookie', `${cookie.name}=${cookie.value}`);
    });

    await auth.api.signUpEmail({
      body: {
        name: parsed.data.name,
        email: parsed.data.email,
        password: parsed.data.password,
      },
      headers,
    });

    // Sign them in immediately with proper headers
    const session = await auth.api.signInEmail({
      body: {
        email: parsed.data.email,
        password: parsed.data.password,
      },
      headers,
    });

    // Set the session token in cookies
    if (session?.token) {
      cookieStore.set('better-auth.session_token', session.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }
    if (session?.user) {
  await db
    .insert(schema.user)
    .values({
      id: session.user.id,             // keep BetterAuth UUID
      name: session.user.name ?? '',
      email: session.user.email,
      emailVerified: false,           // or use session.user.emailVerified if available
      image: session.user.image ?? null,
    })
    .onConflictDoNothing({ target: schema.user.id }); 
}

    if (guest && session?.user) {
      await mergeGuestCartWithUserCart(session.user.id, guest.id);
    }

    return { success: true };
    
  } catch (error) {
    logger.error('Error during sign-up:', error);
    if (error instanceof BetterAuthError) {
      return {
        error: { _errors: [error.message] },
      };
    }
    throw error;
  }
}

export async function signIn(data: FormData) {
  const formData = Object.fromEntries(data);
  const redirectUrl = (data.get('redirectUrl') as string) || '/';
  
  const parsed = signInSchema.safeParse(formData);

  if (!parsed.success) {
    logger.error('❌ [SIGNIN] Validation failed:', parsed.error);
    return {
      error: parsed.error.flatten().fieldErrors,
    };
  }

  const { email, password } = parsed.data;

  try {
    const guest = await getGuestSession();
    
    // Use the working API endpoint that sets cookies properly
    const baseUrl = process.env.BETTER_AUTH_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/auth/sign-in/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      logger.error('❌ [SIGNIN] Sign-in failed:', result);
      if (result.error?.message?.includes('user') || result.message?.includes('not found')) {
        const url = new URLSearchParams();
        url.append('email', email);
        if (redirectUrl) {
          url.append('redirect_url', redirectUrl);
        }
        return { 
          success: false, 
          redirectTo: `/sign-up?${url.toString()}` 
        };
      }
      return {
        success: false,
        error: { _errors: [result.error?.message || result.message || 'Sign-in failed'] },
      };
    }

    // The cookies should be set automatically by the API response

    if (guest && result.user) {
      await mergeGuestCartWithUserCart(result.user.id, guest.id);
    }

    return { success: true, redirectUrl };
    
  } catch (error) {
    logger.error('💥 [SIGNIN] Error during sign-in:', error);
    return {
      success: false,
      error: { _errors: ['Sign-in failed. Please try again.'] },
    };
  }
}
export async function signOut() {
  const cookieStore = await cookies();
  const headers = new Headers();
  
  // Get all cookies and set them in headers
  cookieStore.getAll().forEach(cookie => {
    headers.append('cookie', `${cookie.name}=${cookie.value}`);
  });
  
  await auth.api.signOut({ headers });
  
  // Clear the session cookie
  cookieStore.delete('better-auth.session_token');
  
  return redirect('/');
}

export async function getGuestSession() {
  const cookieStore = await cookies();
  const guestSessionToken = cookieStore.get('guest_session')?.value;
  
  if (!guestSessionToken) {
    return null;
  }

  const guest = await db.query.guests.findFirst({
    where: eq(schema.guests.sessionToken, guestSessionToken),
  });

  if (!guest || guest.expiresAt < new Date()) {
    return null;
  }

  return guest;
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const headers = new Headers();
    
    // Get all cookies and set them in headers
    cookieStore.getAll().forEach(cookie => {
      headers.append('cookie', `${cookie.name}=${cookie.value}`);
    });
    
    const session = await auth.api.getSession({
      headers,
    });
    return session?.user || null;
  } catch (e) {
    logger.error('Error getting current user:', e);
    return null;
  }
}

export async function createGuestSession() {
  const sessionToken = uuidv4();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const [guest] = await db
    .insert(schema.guests)
    .values({ sessionToken, expiresAt })
    .returning();

  const cookieStore = await cookies();
  cookieStore.set('guest_session', guest.sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    expires: expiresAt,
  });

  return guest;
}

export async function mergeGuestCartWithUserCart(
  userId: string,
  guestId: string,
) {
  const guestCart = await db.query.carts.findFirst({
    where: eq(schema.carts.guestId, guestId),
    with: {
      items: true,
    },
  });

  if (!guestCart) {
    await db.delete(schema.guests).where(eq(schema.guests.id, guestId));
    const cookieStore = await cookies();
    cookieStore.delete('guest_session');
    return;
  }

  const userCart = await db.query.carts.findFirst({
    where: eq(schema.carts.userId, userId),
  });

  if (userCart) {
    // Merge guest cart items into user cart
    for (const guestItem of guestCart.items) {
      const userItem = await db.query.cartItems.findFirst({
        where: and(
          eq(schema.cartItems.cartId, userCart.id),
          eq(
            schema.cartItems.productVariantId,
            guestItem.productVariantId,
          ),
        ),
      });

      if (userItem) {
        // Update existing item quantity
        await db
          .update(schema.cartItems)
          .set({ quantity: userItem.quantity + guestItem.quantity })
          .where(eq(schema.cartItems.id, userItem.id));
      } else {
        // Add new item to user cart
        await db.insert(schema.cartItems).values({
          cartId: userCart.id,
          productVariantId: guestItem.productVariantId,
          quantity: guestItem.quantity,
        });
      }
    }

    // Clean up guest cart and items
    await db
      .delete(schema.cartItems)
      .where(eq(schema.cartItems.cartId, guestCart.id));
    await db.delete(schema.carts).where(eq(schema.carts.id, guestCart.id));
  } else {
    // Transfer guest cart to user
    await db
      .update(schema.carts)
      .set({ userId: userId, guestId: null })
      .where(eq(schema.carts.id, guestCart.id));
  }

  // Clean up guest session
  await db.delete(schema.guests).where(eq(schema.guests.id, guestId));
  const cookieStore = await cookies();
  cookieStore.delete('guest_session');
}