/**
 * Admin API service — all admin CRUD operations.
 */
import api from './api';
import type {
  Category, ProductDetail, ProductListResponse,
  Order, OrderListResponse,
  User, UserListResponse,
  Review, ReviewListResponse,
  Slider, Promotion, BankAccount, SiteSettings,
  OrderReport, FinanceReport,
} from '../types';

export const adminService = {
  // ─── Categories ───
  async getCategories(): Promise<Category[]> {
    const res = await api.get('/api/admin/categories');
    return res.data;
  },
  async createCategory(data: { name: string; parent_id?: string; display_order?: number }): Promise<Category> {
    const res = await api.post('/api/admin/categories', data);
    return res.data;
  },
  async updateCategory(id: string, data: Record<string, unknown>): Promise<Category> {
    const res = await api.put(`/api/admin/categories/${id}`, data);
    return res.data;
  },
  async deleteCategory(id: string): Promise<void> {
    await api.delete(`/api/admin/categories/${id}`);
  },

  // ─── Products ───
  async getProducts(params: Record<string, unknown> = {}): Promise<ProductListResponse> {
    const res = await api.get('/api/admin/products', { params });
    return res.data;
  },
  async createProduct(data: Record<string, unknown>): Promise<ProductDetail> {
    const res = await api.post('/api/admin/products', data);
    return res.data;
  },
  async updateProduct(id: string, data: Record<string, unknown>): Promise<ProductDetail> {
    const res = await api.put(`/api/admin/products/${id}`, data);
    return res.data;
  },
  async deleteProduct(id: string): Promise<void> {
    await api.delete(`/api/admin/products/${id}`);
  },
  async duplicateProduct(id: string): Promise<ProductDetail> {
    const res = await api.post(`/api/admin/products/${id}/duplicate`);
    return res.data;
  },
  async generateSeo(id: string): Promise<{ seo_keywords: string[] }> {
    const res = await api.post(`/api/admin/products/${id}/generate-seo`);
    return res.data;
  },

  // Variations
  async addVariation(productId: string, data: Record<string, unknown>): Promise<unknown> {
    const res = await api.post(`/api/admin/products/${productId}/variations`, data);
    return res.data;
  },
  async updateVariation(productId: string, varId: string, data: Record<string, unknown>): Promise<unknown> {
    const res = await api.put(`/api/admin/products/${productId}/variations/${varId}`, data);
    return res.data;
  },
  async deleteVariation(productId: string, varId: string): Promise<void> {
    await api.delete(`/api/admin/products/${productId}/variations/${varId}`);
  },

  // ─── Orders ───
  async getOrders(params: Record<string, unknown> = {}): Promise<OrderListResponse> {
    const res = await api.get('/api/admin/orders', { params });
    return res.data;
  },
  async getOrder(id: string): Promise<Order> {
    const res = await api.get(`/api/admin/orders/${id}`);
    return res.data;
  },
  async updateOrderStatus(id: string, status: string, notes?: string): Promise<Order> {
    const res = await api.put(`/api/admin/orders/${id}/status`, { status, notes });
    return res.data;
  },
  async updatePaymentStatus(id: string, paymentStatus: string): Promise<Order> {
    const res = await api.put(`/api/admin/orders/${id}/payment`, null, {
      params: { payment_status: paymentStatus },
    });
    return res.data;
  },

  // ─── Users ───
  async getUsers(params: Record<string, unknown> = {}): Promise<UserListResponse> {
    const res = await api.get('/api/admin/users', { params });
    return res.data;
  },
  async createUser(data: Record<string, unknown>): Promise<User> {
    const res = await api.post('/api/admin/users', data);
    return res.data;
  },
  async updateUser(id: string, data: Record<string, unknown>): Promise<User> {
    const res = await api.put(`/api/admin/users/${id}`, data);
    return res.data;
  },
  async deleteUser(id: string): Promise<void> {
    await api.delete(`/api/admin/users/${id}`);
  },

  // ─── Reviews ───
  async getReviews(params: Record<string, unknown> = {}): Promise<ReviewListResponse> {
    const res = await api.get('/api/admin/reviews', { params });
    return res.data;
  },
  async updateReview(id: string, data: Record<string, unknown>): Promise<Review> {
    const res = await api.put(`/api/admin/reviews/${id}`, data);
    return res.data;
  },
  async replyToReview(id: string, reply: string): Promise<Review> {
    const res = await api.post(`/api/admin/reviews/${id}/reply`, { admin_reply: reply });
    return res.data;
  },
  async deleteReview(id: string): Promise<void> {
    await api.delete(`/api/admin/reviews/${id}`);
  },

  // ─── Reports ───
  async getOrderReport(): Promise<OrderReport> {
    const res = await api.get('/api/admin/reports/orders');
    return res.data;
  },
  async getProductReport(params: Record<string, unknown> = {}): Promise<{ products: unknown[]; period: string }> {
    const res = await api.get('/api/admin/reports/products', { params });
    return res.data;
  },
  async getFinanceReport(): Promise<FinanceReport> {
    const res = await api.get('/api/admin/reports/finance');
    return res.data;
  },

  // ─── Sliders ───
  async getSliders(): Promise<Slider[]> {
    const res = await api.get('/api/admin/sliders');
    return res.data;
  },
  async createSlider(data: Record<string, unknown>): Promise<Slider> {
    const res = await api.post('/api/admin/sliders', data);
    return res.data;
  },
  async updateSlider(id: string, data: Record<string, unknown>): Promise<Slider> {
    const res = await api.put(`/api/admin/sliders/${id}`, data);
    return res.data;
  },
  async deleteSlider(id: string): Promise<void> {
    await api.delete(`/api/admin/sliders/${id}`);
  },

  // ─── Promotions ───
  async getPromotions(): Promise<Promotion[]> {
    const res = await api.get('/api/admin/promotions');
    return res.data;
  },
  async createPromotion(data: Record<string, unknown>): Promise<Promotion> {
    const res = await api.post('/api/admin/promotions', data);
    return res.data;
  },
  async updatePromotion(id: string, data: Record<string, unknown>): Promise<Promotion> {
    const res = await api.put(`/api/admin/promotions/${id}`, data);
    return res.data;
  },
  async deletePromotion(id: string): Promise<void> {
    await api.delete(`/api/admin/promotions/${id}`);
  },

  // ─── Payments ───
  async getBankAccounts(): Promise<BankAccount[]> {
    const res = await api.get('/api/admin/payments/bank-accounts');
    return res.data;
  },
  async createBankAccount(data: Record<string, unknown>): Promise<BankAccount> {
    const res = await api.post('/api/admin/payments/bank-accounts', data);
    return res.data;
  },
  async updateBankAccount(id: string, data: Record<string, unknown>): Promise<BankAccount> {
    const res = await api.put(`/api/admin/payments/bank-accounts/${id}`, data);
    return res.data;
  },
  async deleteBankAccount(id: string): Promise<void> {
    await api.delete(`/api/admin/payments/bank-accounts/${id}`);
  },
  async getPendingPayments(params: Record<string, unknown> = {}): Promise<OrderListResponse> {
    const res = await api.get('/api/admin/payments/pending-orders', { params });
    return res.data;
  },

  // ─── Settings ───
  async getSettings(): Promise<SiteSettings> {
    const res = await api.get('/api/admin/settings');
    return res.data;
  },
  async updateSettings(data: Record<string, unknown>): Promise<SiteSettings> {
    const res = await api.put('/api/admin/settings', data);
    return res.data;
  },

  // ─── Uploads ───
  async uploadImage(file: File): Promise<{ id: string; url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/api/uploads', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};
