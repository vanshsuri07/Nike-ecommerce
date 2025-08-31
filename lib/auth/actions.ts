'use server';

import { auth } from '.';
import { db, schema } from '../../src/db';
import { cookies } from 'next/headers';

import { signInSchema, signUpSchema } from './validation';
import { redirect } from 'next/navigation';
import { AuthError } from 'better-auth/errors';

import { and, eq } from 'drizzle-orm';

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
    const guest = await getGuestSession();
    const user = await auth.email.signUp({ email, password });
    if (guest && user) {
      await mergeGuestCartWithUserCart(user.id, guest.id);
    }
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
    const guest = await getGuestSession();
    const user = await auth.email.signIn({ email, password });
    if (guest && user) {
      await mergeGuestCartWithUserCart(user.id, guest.id);
    }
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

import { v4 as uuidv4 } from 'uuid';

export async function createGuestSession() {
  const sessionToken = uuidv4();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const [guest] = await db
    .insert(schema.guests)
    .values({ sessionToken, expiresAt })
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

export async function mergeGuestCartWithUserCart(userId: string, guestId: string) {
  const guestCart = await db.query.carts.findFirst({
    where: eq(schema.carts.guestId, guestId),
    with: {
      items: true,
    },
  });

  if (!guestCart) {
    await db.delete(schema.guests).where(eq(schema.guests.id, guestId));
    cookies().delete('guest_session');
    return;
  }

  const userCart = await db.query.carts.findFirst({
    where: eq(schema.carts.userId, userId),
  });

  if (userCart) {
    for (const guestItem of guestCart.items) {
      const userItem = await db.query.cartItems.findFirst({
        where: and(
          eq(schema.cartItems.cartId, userCart.id),
          eq(schema.cartItems.productId, guestItem.productId)
        ),
      });

      if (userItem) {
        await db
          .update(schema.cartItems)
          .set({ quantity: userItem.quantity + guestItem.quantity })
          .where(eq(schema.cartItems.id, userItem.id));
      } else {
        await db.insert(schema.cartItems).values({
          cartId: userCart.id,
          productId: guestItem.productId,
          quantity: guestItem.quantity,
        });
      }
    }
    await db.delete(schema.cartItems).where(eq(schema.cartItems.cartId, guestCart.id));
    await db.delete(schema.carts).where(eq(schema.carts.id, guestCart.id));
  } else {
    await db
      .update(schema.carts)
      .set({ userId: userId, guestId: null })
      .where(eq(schema.carts.id, guestCart.id));
  }

  await db.delete(schema.guests).where(eq(schema.guests.id, guestId));
  cookies().delete('guest_session');
}
