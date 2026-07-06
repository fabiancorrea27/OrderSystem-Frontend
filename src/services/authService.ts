import api from './api';
import type { Address, User } from '../types';

export const authService = {
  async login(email: string, password: string): Promise<{ token: string }> {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },

  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    address?: Address,
    phone?: string,
  ): Promise<void> {
    await api.post('/auth/register', { email, password, firstName, lastName, address, phone });
  },

  async getProfile(): Promise<User> {
    const res = await api.get('/auth/profile');
    return res.data;
  },

  async updateProfile(data: {
    firstName: string;
    lastName: string;
    email: string;
    address?: Address;
    addresses?: Address[];
    phone?: string;
  }): Promise<User> {
    const res = await api.put('/auth/profile', data);
    return res.data;
  },
};
