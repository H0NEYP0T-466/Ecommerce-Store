import api from './api';
import type { Order, OrderListResponse } from '../types';

export const orderService = {
  async placeOrder(data: {
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    customer_address: string;
    payment_method?: string;
    transaction_id?: string;
    additional_notes?: string;
  }): Promise<Order> {
    const res = await api.post('/api/orders', data);
    return res.data;
  },

  async getOrders(page = 1): Promise<OrderListResponse> {
    const res = await api.get('/api/orders', { params: { page } });
    return res.data;
  },

  async getOrder(orderId: string): Promise<Order> {
    const res = await api.get(`/api/orders/${orderId}`);
    return res.data;
  },

  async uploadPaymentProof(orderId: string, file: File): Promise<{ payment_proof_url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post(`/api/orders/${orderId}/upload-proof`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};
