import api from './api';
import type { ProductListResponse, ProductDetail, ReviewListResponse } from '../types';

export const productService = {
  async getProducts(params: {
    page?: number;
    page_size?: number;
    category?: string;
    color?: string;
    size?: string;
    min_price?: number;
    max_price?: number;
    search?: string;
    sort?: string;
  } = {}): Promise<ProductListResponse> {
    const res = await api.get('/api/products', { params });
    return res.data;
  },

  async getProduct(slug: string): Promise<ProductDetail> {
    const res = await api.get(`/api/products/${slug}`);
    return res.data;
  },

  async getProductReviews(productId: string, page = 1): Promise<ReviewListResponse> {
    const res = await api.get(`/api/products/${productId}/reviews`, {
      params: { page },
    });
    return res.data;
  },

  async createReview(productId: string, rating: number, comment: string): Promise<void> {
    await api.post(`/api/products/${productId}/reviews`, { rating, comment });
  },
};
