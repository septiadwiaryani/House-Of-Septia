import { Product, Order, Customer, SalesReport, AdminUser } from '../types/index.ts';

const API_BASE = '/api';

export async function fetchHealth(): Promise<{ status: string; database: string; alive: boolean }> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function fetchProducts(category?: string, search?: string): Promise<Product[]> {
  const params = new URLSearchParams();
  if (category && category !== 'Semua') params.append('category', category);
  if (search) params.append('search', search);

  const res = await fetch(`${API_BASE}/products?${params.toString()}`);
  if (!res.ok) throw new Error('Gagal memuat produk dari database');
  return res.json();
}

export async function fetchProductById(id: string): Promise<Product> {
  const res = await fetch(`${API_BASE}/products/${id}`);
  if (!res.ok) throw new Error('Produk tidak ditemukan');
  return res.json();
}

export async function createProduct(productData: Partial<Product>): Promise<{ success: boolean; id: string }> {
  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Gagal menambahkan produk');
  }
  return res.json();
}

export async function updateProduct(id: string, productData: Partial<Product>): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Gagal memperbarui produk');
  }
  return res.json();
}

export async function deleteProduct(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Gagal menghapus produk');
  return res.json();
}

export async function createOrder(orderPayload: any): Promise<{ success: boolean; order_id: string; total_amount: number }> {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderPayload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Gagal membuat pesanan');
  }
  return res.json();
}

export async function fetchOrders(filter?: { status?: string; payment_status?: string; search?: string; customer_email?: string }): Promise<Order[]> {
  const params = new URLSearchParams();
  if (filter?.status) params.append('status', filter.status);
  if (filter?.payment_status) params.append('payment_status', filter.payment_status);
  if (filter?.search) params.append('search', filter.search);
  if (filter?.customer_email) params.append('customer_email', filter.customer_email);

  const res = await fetch(`${API_BASE}/orders?${params.toString()}`);
  if (!res.ok) throw new Error('Gagal memuat daftar pesanan');
  return res.json();
}

export async function fetchOrderById(id: string): Promise<Order> {
  const res = await fetch(`${API_BASE}/orders/${id}`);
  if (!res.ok) throw new Error('Pesanan tidak ditemukan');
  return res.json();
}

export async function uploadPaymentProof(orderId: string, proofImageBase64: string, notes?: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/orders/${orderId}/upload-proof`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ proof_image: proofImageBase64, notes }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Gagal mengunggah bukti pembayaran');
  }
  return res.json();
}

export async function approvePayment(orderId: string, status: 'lunas' | 'ditolak', adminNotes?: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/orders/${orderId}/payment-approval`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, admin_notes: adminNotes }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Gagal memproses verifikasi pembayaran');
  }
  return res.json();
}

export async function updateOrderStatus(orderId: string, order_status: string, adminNotes?: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ order_status, admin_notes: adminNotes }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Gagal mengubah status pesanan');
  }
  return res.json();
}

export async function fetchCustomers(search?: string): Promise<Customer[]> {
  const params = new URLSearchParams();
  if (search) params.append('search', search);

  const res = await fetch(`${API_BASE}/customers?${params.toString()}`);
  if (!res.ok) throw new Error('Gagal memuat data pelanggan');
  return res.json();
}

export async function fetchSalesReport(): Promise<SalesReport> {
  const res = await fetch(`${API_BASE}/reports/sales`);
  if (!res.ok) throw new Error('Gagal memuat laporan penjualan');
  return res.json();
}

export async function loginAdmin(username: string, password: string): Promise<{ success: boolean; user: AdminUser; token: string }> {
  const res = await fetch(`${API_BASE}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Login admin gagal');
  }
  return res.json();
}

export async function resetDemoDatabase(): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/reset-demo`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Gagal reset demo database');
  return res.json();
}
