import { create } from 'zustand';
import type { Cart } from '../types';
import { cartService } from '../services/cart';

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  loadCart: () => Promise<void>;
  addToCart: (variationId: string, quantity?: number) => Promise<void>;
  updateQuantity: (variationId: string, quantity: number) => Promise<void>;
  removeItem: (variationId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  setCart: (cart: Cart) => void;
}

export const useCartStore = create<CartState>((set) => ({
  cart: null,
  isLoading: false,

  loadCart: async () => {
    set({ isLoading: true });
    try {
      const cart = await cartService.getCart();
      set({ cart, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  addToCart: async (variationId, quantity = 1) => {
    const cart = await cartService.addToCart(variationId, quantity);
    set({ cart });
  },

  updateQuantity: async (variationId, quantity) => {
    const cart = await cartService.updateQuantity(variationId, quantity);
    set({ cart });
  },

  removeItem: async (variationId) => {
    const cart = await cartService.removeItem(variationId);
    set({ cart });
  },

  clearCart: async () => {
    const cart = await cartService.clearCart();
    set({ cart });
  },

  setCart: (cart) => set({ cart }),
}));
