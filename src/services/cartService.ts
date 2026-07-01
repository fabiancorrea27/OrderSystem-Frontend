import api from './api';
import type { ApiCart } from '../types';

export const cartService = {
  async getCart(): Promise<ApiCart> {
    const res = await api.get('/cart');
    return res.data;
  },

  async addItem(productId: string, quantity: number): Promise<ApiCart> {
    const res = await api.post('/cart/items', { productId, quantity });
    return res.data;
  },

  async updateQty(productId: string, quantity: number): Promise<ApiCart> {
    const res = await api.put(`/cart/items/${productId}`, { productId, quantity });
    return res.data;
  },

  async updateItemPrice(productId: string, price: number): Promise<ApiCart> {
    const res = await api.put(`/cart/items/${productId}/price`, { price });
    return res.data;
  },

  async removeItem(productId: string): Promise<ApiCart> {
    const res = await api.delete(`/cart/items/${productId}`);
    return res.data;
  },

  async clearCart(): Promise<void> {
    await api.delete('/cart');
  },

  async merge(items: { productId: string; quantity: number }[]): Promise<ApiCart> {
    const res = await api.post('/cart/merge', items);
    return res.data;
  },
};
