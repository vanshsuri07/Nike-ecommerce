'use server';

import { auth } from './index';
import { db } from '@/db';
import * as schema from '@/lib/db/schema';
import { cookies} from 'next/headers';
import { v4 as uuidv4 } from 'uuid';
import { signInSchema, signUpSchema } from './validation';
import { redirect } from 'next/navigation';
import { BetterAuthError } from 'better-auth';
import { and, eq } from 'drizzle-orm';

export async function signUp(data: FormData) {
  console.log('Attempting to sign up...');
  const formData = Object.fromEntries(data);
  const parsed = signUpSchema.safeParse(formData);

  if (!parsed.success) {
    console.error('Sign-up validation failed:', parsed.error);
    return {
      error: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    console.log('Sign-up validation successful. Getting guest session...');
    const guest = await getGuestSession();
    
    console.log('Creating user...');
    // Create user
    await auth.api.signUpEmail({
      body: {
        name: parsed.data.name,
        email: parsed.data.email,
        password: parsed.data.password,
      },
    });

    console.log('User created. Signing in...');
    // Sign them in immediately
    const session = await auth.api.signInEmail({
      body: {
        email: parsed.data.email,
        password: parsed.data.password,
      },
    });

    console.log("User signed in:", session);

    if (guest && session?.user) {
      console.log('Merging guest cart with user cart...');
      await mergeGuestCartWithUserCart(session.user.id, guest.id);
      console.log('Guest cart merged.');
    }
  } catch (error) {
    console.error('Error during sign-up:', error);
    if (error instanceof BetterAuthError) {
      return {
        error: { _errors: [error.message] },
      };
    }
    throw error;
  }

  console.log('Sign-up successful. Redirecting...');
  redirect('/');
}
export async function signIn(data: FormData) {
  console.log('Attempting to sign in...');
  const formData = Object.fromEntries(data);
  const redirectUrl = (data.get('redirectUrl') as string) || '/';
  const parsed = signInSchema.safeParse(formData);

  if (!parsed.success) {
    console.error('Sign-in validation failed:', parsed.error);
    return {
      error: parsed.error.flatten().fieldErrors,
    };
  }

  const { email, password } = parsed.data;

  try {
    console.log('Sign-in validation successful. Getting guest session...');
    const guest = await getGuestSession();
    console.log('Signing in user...');
    const user = await auth.api.signInEmail({ body: { email, password } });
    console.log('User signed in:', user);
    if (guest && user) {
      console.log('Merging guest cart with user cart...');
      await mergeGuestCartWithUserCart(user.user.id, guest.id);
      console.log('Guest cart merged.');
    }
  } catch (error) {
    console.error('Error during sign-in:', error);
    if (error instanceof BetterAuthError) {
      if (error.message.includes('user') && error.message.includes('not found')) {
        console.log('User not found. Redirecting to sign-up page...');
        const url = new URLSearchParams();
        url.append('email', email);
        if (redirectUrl) {
          url.append('redirect_url', redirectUrl);
        }
        redirect(`/sign-up?${url.toString()}`);
      }
      return {
        error: { _errors: [error.message] },
      };
    }
    throw error;
  }

  console.log('Sign-in successful. Redirecting...');
  redirect(redirectUrl);
}

export async function signOut() {
  await auth.api.signOut({ headers: {} });
  return redirect('/');
}

export async function getGuestSession() {
  const cookieStore = await cookies();
  const guestSessionToken = cookieStore.get('guest_session')?.value;
  if (!guestSessionToken) return null;

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
    const session = await auth.api.getSession({
      headers: new Headers(),
    });
    console.log('Full session object:', session);
    return session?.user || null;
  } catch (e) {
    console.error('Error getting current user:', e);
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