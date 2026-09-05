/* All TypeScript interfaces matching backend models */

// ═══════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════

export type UserRole = 'customer' | 'admin';
export type OrderStatus = 'received' | 'packing' | 'dispatched' | 'delivered';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';
export type NotificationType = 'new_order' | 'new_review' | 'low_stock' | 'payment_received';

// ═══════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface AccessTokenResponse {
  access_token: string;
  token_type: string;
}

// ═══════════════════════════════════════════
// USER
// ═══════════════════════════════════════════

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  page_size: number;
}

// ═══════════════════════════════════════════
// CATEGORY
// ═══════════════════════════════════════════

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id?: string;
  is_active: boolean;
  display_order: number;
  children: Category[];
}

// ═══════════════════════════════════════════
// PRODUCT
// ═══════════════════════════════════════════

export interface ProductVariation {
  id: string;
  product_id: string;
  color: string;
  size?: string;
  stock_quantity: number;
  images: string[];
  video_url?: string;
  is_default: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category_id: string;
  category_name?: string;
  actual_price: number;
  discount_price?: number;
  is_active: boolean;
  seo_keywords: string[];
  primary_image?: string;
  secondary_image?: string;
  average_rating?: number;
  review_count: number;
  total_stock: number;
  created_at: string;
  updated_at: string;
}

export interface ProductDetail extends Product {
  variations: ProductVariation[];
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  page_size: number;
}

// ═══════════════════════════════════════════
// CART
// ═══════════════════════════════════════════

export interface CartItem {
  product_variation_id: string;
  product_name: string;
  color: string;
  size?: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  image?: string;
  stock_available: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  item_count: number;
}

// ═══════════════════════════════════════════
// ORDER
// ═══════════════════════════════════════════

export interface OrderItem {
  product_variation_id: string;
  product_name: string;
  color: string;
  size?: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface StatusHistoryEntry {
  status: OrderStatus;
  changed_by: string;
  changed_at: string;
  notes?: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  items: OrderItem[];
  total_amount: number;
  payment_method?: string;
  payment_status: PaymentStatus;
  payment_proof_url?: string;
  transaction_id?: string;
  status: OrderStatus;
  status_history: StatusHistoryEntry[];
  additional_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderListResponse {
  orders: Order[];
  total: number;
  page: number;
  page_size: number;
}

// ═══════════════════════════════════════════
// REVIEW
// ═══════════════════════════════════════════

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  comment: string;
  is_approved: boolean;
  is_hidden: boolean;
  admin_reply?: string;
  replied_at?: string;
  created_at: string;
}

export interface ReviewListResponse {
  reviews: Review[];
  total: number;
  page: number;
  page_size: number;
}

// ═══════════════════════════════════════════
// SLIDER
// ═══════════════════════════════════════════

export interface Slider {
  id: string;
  image_url: string;
  title?: string;
  subtitle?: string;
  link_url?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

// ═══════════════════════════════════════════
// PROMOTION
// ═══════════════════════════════════════════

export interface Promotion {
  id: string;
  title: string;
  description: string;
  discount_percent: number;
  selected_product_ids: string[];
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  created_at: string;
}

// ═══════════════════════════════════════════
// BANK ACCOUNT
// ═══════════════════════════════════════════

export interface BankAccount {
  id: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  iban: string;
  is_active?: boolean;
  display_order?: number;
}

// ═══════════════════════════════════════════
// SITE SETTINGS
// ═══════════════════════════════════════════

export interface SiteSettings {
  logo_url?: string;
  display_name: string;
  contact_info: string;
  whatsapp_number: string;
  facebook_url: string;
  instagram_url: string;
  youtube_url: string;
  payment_gateway_enabled: boolean;
}

// ═══════════════════════════════════════════
// REPORTS
// ═══════════════════════════════════════════

export interface OrderReport {
  this_month_count: number;
  last_month_count: number;
  total_count: number;
  recent_orders: Array<{
    id: string;
    order_number: string;
    customer_name: string;
    total_amount: number;
    status: OrderStatus;
    created_at: string;
  }>;
}

export interface ProductRankItem {
  rank: number;
  product_id: string;
  product_name: string;
  category_name?: string;
  units_sold: number;
  revenue: number;
}

export interface FinanceReport {
  total_revenue: number;
  total_orders: number;
  average_order_value: number;
  this_month_revenue: number;
  this_month_orders: number;
  top_products: ProductRankItem[];
}

// ═══════════════════════════════════════════
// NOTIFICATION
// ═══════════════════════════════════════════

export interface Notification {
  id: string;
  type: NotificationType;
  entity_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

// ═══════════════════════════════════════════
// WEBSOCKET MESSAGE
// ═══════════════════════════════════════════

export interface WSMessage {
  type: string;
  data?: Record<string, unknown>;
  count?: number;
}
