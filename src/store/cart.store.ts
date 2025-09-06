import { create } from 'zustand';
import {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
} from '@/lib/actions/cart';
import { CartItemWithProduct } from '@/types/cart';

interface CartState {
  items: CartItemWithProduct[];
  loading: boolean;
  error: string | null;
  getCart: () => Promise<void>;
  addCartItem: (productVariantId: string, quantity: number) => Promise<void>;
  updateCartItem: (cartItemId: string, quantity: number) => Promise<void>;
  removeCartItem: (cartItemId: string) => Promise<void>;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  loading: false,
  error: null,
  getCart: async () => {
    set({ loading: true, error: null });
    try {
      const cart = await getCart();
      set({ items: (cart?.items || []) as CartItemWithProduct[], loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch cart.', loading: false });
      console.error(error);
    }
  },
  addCartItem: async (productVariantId, quantity) => {
    set({ loading: true, error: null });
    try {
      await addCartItem(productVariantId, quantity);
      const cart = await getCart();
      set({ items: (cart?.items || []) as CartItemWithProduct[], loading: false });
    } catch (error) {
      set({ error: 'Failed to add item to cart.', loading: false });
      console.error(error);
    }
  },
  updateCartItem: async (cartItemId, quantity) => {
    set({ loading: true, error: null });
    try {
      await updateCartItem(cartItemId, quantity);
      const cart = await getCart();
      set({ items: (cart?.items || []) as CartItemWithProduct[], loading: false });
    } catch (error) {
      set({ error: 'Failed to update item in cart.', loading: false });
      console.error(error);
    }
  },
  removeCartItem: async (cartItemId) => {
    set({ loading: true, error: null });
    try {
      await removeCartItem(cartItemId);
      const cart = await getCart();
      set({ items: (cart?.items || []) as CartItemWithProduct[], loading: false });
    } catch (error) {
      set({ error: 'Failed to remove item from cart.', loading: false });
      console.error(error);
    }
  },
}));
