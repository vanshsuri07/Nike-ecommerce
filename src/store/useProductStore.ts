import { create } from 'zustand';
import { Product } from '@/types';

interface ProductState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  setProducts: (products: Product[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  isLoading: true, // Default to true, will be false after fetch
  error: null,
  setProducts: (products) => set({ products, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
}));
