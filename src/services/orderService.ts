import api from './api';
import type { Order, CartItem, Address } from '../types';

export const orderService = {
  async createOrder(items: CartItem[], shippingAddress?: Address): Promise<Order> {
    const payload = {
      items: items.map((i) => ({
        productId: i.product.id,
        quantity: i.quantity,
      })),
      shippingAddress,
    };
    const res = await api.post('/orders', payload);
    return res.data;
  },

  async getMyOrders(): Promise<Order[]> {
    const res = await api.get('/orders/my');
    return res.data;
  },
};
