'use server';

import { db } from '@/db';
import * as schema from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import {
  getCurrentUser,
  getGuestSession,
  createGuestSession,
} from '@/lib/auth/actions';
import { revalidatePath } from 'next/cache';

export async function getCart() {
  const user = await getCurrentUser();
  let guest;
  if (!user) {
    guest = await getGuestSession();
  }

  if (!user && !guest) {
    return null;
  }

  const cart = await db.query.carts.findFirst({
    where: user
      ? eq(schema.carts.userId, user.id)
      : eq(schema.carts.guestId, guest!.id),
    with: {
      items: {
        with: {
          productVariant: {
            with: {
              product: {
                with: {
                  images: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return cart;
}

export async function addCartItem(productVariantId: string, quantity: number) {
  const user = await getCurrentUser();
  let guest;
  if (!user) {
    guest = await getGuestSession();
    if (!guest) {
      guest = await createGuestSession();
    }
  }

  let cart = await getCart();

  if (!cart) {
    const [newCart] = await db
      .insert(schema.carts)
      .values({
        userId: user?.id,
        guestId: guest?.id,
      })
      .returning();
    cart = { ...newCart, items: [] };
  }

  const existingItem = cart.items.find(
    (item) => item.productVariantId === productVariantId,
  );

  if (existingItem) {
    await db
      .update(schema.cartItems)
      .set({ quantity: existingItem.quantity + quantity })
      .where(eq(schema.cartItems.id, existingItem.id));
  } else {
    await db.insert(schema.cartItems).values({
      cartId: cart.id,
      productVariantId,
      quantity,
    });
  }

  revalidatePath('/cart');
}

export async function updateCartItem(cartItemId: string, quantity: number) {
  if (quantity === 0) {
    await removeCartItem(cartItemId);
    return;
  }

  await db
    .update(schema.cartItems)
    .set({ quantity })
    .where(eq(schema.cartItems.id, cartItemId));

  revalidatePath('/cart');
}

export async function removeCartItem(cartItemId: string) {
  await db.delete(schema.cartItems).where(eq(schema.cartItems.id, cartItemId));

  revalidatePath('/cart');
}

export async function clearCart() {
  const cart = await getCart();
  if (!cart) return;

  await db.delete(schema.cartItems).where(eq(schema.cartItems.cartId, cart.id));

  revalidatePath('/cart');
}
