import api from './api';

export const authService = {
  async login(email: string, password: string): Promise<{ token: string }> {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },

  async register(email: string, password: string): Promise<void> {
    await api.post('/auth/register', { email, password });
  },
};
