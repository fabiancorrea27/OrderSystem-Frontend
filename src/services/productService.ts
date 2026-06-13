import api from './api';
import type { Product } from '../types';

export const productService = {
  async getAll(): Promise<Product[]> {
    const res = await api.get('/products');
    return res.data;
  },

  async create(name: string, price: number): Promise<Product> {
    const res = await api.post('/products', { name, price });
    return res.data;
  },
};
