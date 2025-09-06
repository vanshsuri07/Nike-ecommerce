import { create } from 'zustand';
import { TProduct } from '../types';

interface ProductState {
  products: TProduct[];
  isLoading: boolean;
  error: string | null;
  setProducts: (products: TProduct[]) => void;
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
