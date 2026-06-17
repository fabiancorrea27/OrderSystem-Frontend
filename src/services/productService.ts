import api from './api';
import type { Product } from '../types';

export const productService = {
  async getAll(): Promise<Product[]> {
    const res = await api.get('/products');
    return res.data;
  },

  async create(name: string, price: number, stock: number): Promise<Product> {
    const res = await api.post('/products', { name, price, stock });
    return res.data;
  },

  async updateStock(productId: string, stock: number): Promise<Product> {
    const res = await api.put(`/products/${productId}/stock`, { stock });
    return res.data;
  },
};
