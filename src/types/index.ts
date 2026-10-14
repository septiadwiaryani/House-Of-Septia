export interface Product {
  id: string;
  name: string;
  category: 'Dress & Kebaya Modern' | 'Atasan & Blouse Chic' | 'Bawahan & Rok Kasual' | string;
  price: number;
  stock: number;
  description: string;
  image_url: string;
  sizes: string[];
  colors: string[];
  material: string;
  created_at: string;
}

export interface CartItem {
  product: Product;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  image_url: string;
}

export type PaymentStatus = 'menunggu_pembayaran' | 'menunggu_verifikasi' | 'lunas' | 'ditolak';
export type OrderStatus = 'pending' | 'diproses' | 'dikirim' | 'selesai' | 'dibatalkan';

export interface Order {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  items: OrderItem[];
  subtotal: number;
  shipping_fee: number;
  discount: number;
  total_amount: number;
  payment_method: string;
  payment_proof_url: string | null;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  notes: string;
  admin_notes: string;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  total_orders: number;
  total_spent: number;
  created_at: string;
}

export interface SalesReport {
  totalRevenue: number;
  paidOrdersCount: number;
  totalOrdersCount: number;
  totalCustomers: number;
  pendingApprovals: number;
  totalProducts: number;
  lowStockCount: number;
  totalItemsSold: number;
  averageOrderValue: number;
  categoryStats: Record<string, { revenue: number; itemsSold: number }>;
  topSellingProducts: { id: string; name: string; qty: number; revenue: number }[];
  paymentStatusBreakdown: { payment_status: string; count: number; sum_amount: number }[];
  orderStatusBreakdown: { order_status: string; count: number }[];
}

export interface AdminUser {
  id: string;
  username: string;
  name: string;
  role: string;
  last_login?: string;
}
