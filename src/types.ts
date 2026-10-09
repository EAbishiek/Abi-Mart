/**
 * Capstone Project Type Definitions - Full E-Commerce Architecture
 * Covers Authentication, Product Catalog, Cart, Checkout, Order Tracking, and Capstone Rubrics.
 */

export type UserRole = 'BUYER' | 'SELLER' | 'ADMIN';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface UserResponseDto {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface ApiError {
  code: string;
  message: string;
  fieldErrors?: Record<string, string> | null;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  error: ApiError | null;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  role: 'BUYER' | 'SELLER';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface Product {
  id: number;
  seller_id: number;
  name: string;
  brand: string;
  category: string;
  price_cents: number;
  stock_qty: number;
  badge?: string;
  rating: number;
  reviews_count: number;
  image_url: string;
  description: string;
  specs_json: string;
  created_at: string;
}

export interface CartItem {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  product?: Product;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price_cents: number;
  product?: Product;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Order {
  id: number;
  buyer_id: number;
  status: OrderStatus;
  total_amount_cents: number;
  shipping_address_json: string;
  payment_method: string;
  tracking_number: string;
  created_at: string;
  items?: OrderItem[];
  shippingAddress?: ShippingAddress;
}

export interface Review {
  id: number;
  product_id: number;
  user_id: number;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface MigrationInfo {
  id: number;
  name: string;
  applied_at: string;
}

export interface TableInfo {
  name: string;
  columns: { cid: number; name: string; type: string; notnull: number; pk: number }[];
  rowCount: number;
}

export interface DatabaseHealth {
  status: 'UP' | 'DOWN';
  db: 'UP' | 'DOWN';
  timestamp: string;
  tables: TableInfo[];
  migrations: MigrationInfo[];
  totalUsers: number;
}

export interface CapstoneRequirement {
  id: string;
  title: string;
  description: string;
  status: 'PASSED' | 'PENDING';
  evidence: string;
}
