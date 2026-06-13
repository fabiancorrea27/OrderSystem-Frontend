import api from './api';
import type { Order, CartItem } from '../types';

export const orderService = {
  async createOrder(items: CartItem[]): Promise<Order> {
    const payload = {
      items: items.map((i) => ({
        productId: i.product.id,
        quantity: i.quantity,
      })),
    };
    const res = await api.post('/orders', payload);
    return res.data;
  },

  async getMyOrders(): Promise<Order[]> {
    const res = await api.get('/orders/my');
    return res.data;
  },
};
