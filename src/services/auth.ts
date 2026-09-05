import api from './api';
import type { TokenResponse, User } from '../types';

export const authService = {
  async register(data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
  }): Promise<TokenResponse> {
    const res = await api.post('/api/auth/register', data);
    return res.data;
  },

  async login(email: string, password: string): Promise<TokenResponse> {
    const res = await api.post('/api/auth/login', { email, password });
    return res.data;
  },

  async getProfile(): Promise<User> {
    const res = await api.get('/api/users/me');
    return res.data;
  },

  async updateProfile(data: {
    first_name?: string;
    last_name?: string;
    phone?: string;
  }): Promise<User> {
    const res = await api.put('/api/users/me', data);
    return res.data;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.put('/api/users/me/password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post('/api/auth/forgot-password', { email });
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await api.post('/api/auth/reset-password', {
      token,
      new_password: newPassword,
    });
  },
};
