'use server';

import { createAuth } from 'better-auth';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { cookies } from 'next/headers';

const auth = createAuth({
  db,
  schema,
});

import { signInSchema, signUpSchema } from './validation';
import { redirect } from 'next/navigation';
import { AuthError } from 'better-auth/errors';

export async function signUp(data: FormData) {
  const formData = Object.fromEntries(data);
  const parsed = signUpSchema.safeParse(formData);

  if (!parsed.success) {
    return {
      error: parsed.error.flatten().fieldErrors,
    };
  }

  const { email, password } = parsed.data;

  try {
    await auth.createUser({ email, password });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error: { _errors: [error.message] },
      };
    }
    throw error;
  }

  return redirect('/');
}

export async function signIn(data: FormData) {
  const formData = Object.fromEntries(data);
  const parsed = signInSchema.safeParse(formData);

  if (!parsed.success) {
    return {
      error: parsed.error.flatten().fieldErrors,
    };
  }

  const { email, password } = parsed.data;

  try {
    await auth.signIn('credentials', { email, password });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error: { _errors: [error.message] },
      };
    }
    throw error;
  }

  return redirect('/');
}

export async function signOut() {
  await auth.signOut();
  return redirect('/');
}

export async function getGuestSession() {
  const guestSessionToken = cookies().get('guest_session')?.value;
  if (!guestSessionToken) return null;

  const guest = await db.query.guests.findFirst({
    where: (guests, { eq }) => eq(guests.sessionToken, guestSessionToken),
  });

  if (!guest || guest.expiresAt < new Date()) {
    return null;
  }

  return guest;
}

export async function createGuestSession() {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const [guest] = await db
    .insert(schema.guests)
    .values({ expiresAt })
    .returning();

  cookies().set('guest_session', guest.sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    expires: expiresAt,
  });

  return guest;
}

export async function mergeGuestCartWithUserCart() {
  // This function is a placeholder.
  // The cart functionality is not implemented in this task.
  // To implement this, you would need to:
  // 1. Get the guest session.
  // 2. Get the user session.
  // 3. Find the guest's cart.
  // 4. Find the user's cart.
  // 5. Merge the guest's cart into the user's cart.
  // 6. Delete the guest's cart.
  // 7. Delete the guest session.
}
