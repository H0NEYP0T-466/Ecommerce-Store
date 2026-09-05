import api from './api';
import type { Cart } from '../types';

export const cartService = {
  async getCart(): Promise<Cart> {
    const res = await api.get('/api/cart');
    return res.data;
  },

  async addToCart(productVariationId: string, quantity = 1): Promise<Cart> {
    const res = await api.post('/api/cart/items', {
      product_variation_id: productVariationId,
      quantity,
    });
    return res.data;
  },

  async updateQuantity(productVariationId: string, quantity: number): Promise<Cart> {
    const res = await api.put(`/api/cart/items/${productVariationId}`, { quantity });
    return res.data;
  },

  async removeItem(productVariationId: string): Promise<Cart> {
    const res = await api.delete(`/api/cart/items/${productVariationId}`);
    return res.data;
  },

  async clearCart(): Promise<Cart> {
    const res = await api.delete('/api/cart');
    return res.data;
  },
};
