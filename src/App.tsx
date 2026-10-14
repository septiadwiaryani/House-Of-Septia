/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { HeroBanner } from './components/HeroBanner.tsx';
import { ProductCard } from './components/ProductCard.tsx';
import { ProductDetailModal } from './components/ProductDetailModal.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { CheckoutModal } from './components/CheckoutModal.tsx';
import { OrderConfirmationModal } from './components/OrderConfirmationModal.tsx';
import { OrderTrackerModal } from './components/OrderTrackerModal.tsx';
import { AdminLoginModal } from './components/Admin/AdminLoginModal.tsx';
import { AdminDashboard } from './components/Admin/AdminDashboard.tsx';
import { Product, CartItem, Order, Customer, SalesReport, AdminUser } from './types/index.ts';
import {
  fetchProducts,
  fetchOrders,
  fetchCustomers,
  fetchSalesReport,
  fetchHealth,
} from './services/api.ts';
import {
  Sparkles,
  ShoppingBag,
  RefreshCw,
  Database,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';

export default function App() {
  // Products & Database State
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<string>('Connecting...');

  // Navigation & Filtering State
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'stock'>('default');

  // Cart State (saved to local storage)
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('hos_cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [discount, setDiscount] = useState<number>(0);

  // Modals & Drawers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isOrderTrackerOpen, setIsOrderTrackerOpen] = useState(false);

  // Post Checkout Confirmation Modal
  const [createdOrderData, setCreatedOrderData] = useState<{
    orderId: string;
    totalAmount: number;
    paymentMethod: string;
  } | null>(null);

  // Admin State
  const [isAdminView, setIsAdminView] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem('hos_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Save cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem('hos_cart_items', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Error saving cart:', e);
    }
  }, [cartItems]);

  // Load all initial data from SQLite Real Database
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [health, prodList] = await Promise.all([
        fetchHealth().catch(() => ({ status: 'error', database: 'Offline', alive: false })),
        fetchProducts(),
      ]);

      setDbStatus(health.alive ? 'SQLite 3 (WAL Connected)' : 'Offline');
      setProducts(prodList);

      fetchOrders().then(setOrders).catch(console.error);
      fetchCustomers().then(setCustomers).catch(console.error);
      fetchSalesReport().then(setSalesReport).catch(console.error);
    } catch (error) {
      console.error('Failed to load database:', error);
      setDbStatus('Error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Cart Operations
  const handleAddToCart = (product: Product) => {
    setCartItems((prev) => {
      const existingIdx = prev.findIndex(
        (it) => it.product.id === product.id && it.selectedSize === product.sizes[0]
      );
      if (existingIdx >= 0) {
        const copy = [...prev];
        const newQty = Math.min(product.stock, copy[existingIdx].quantity + 1);
        copy[existingIdx].quantity = newQty;
        return copy;
      } else {
        return [
          ...prev,
          {
            product,
            selectedSize: product.sizes[0] || 'M',
            selectedColor: product.colors[0] || 'Standard',
            quantity: 1,
          },
        ];
      }
    });
    setIsCartOpen(true);
  };

  const handleAddToCartWithSize = (product: Product, size: string, color: string, qty: number) => {
    setCartItems((prev) => {
      const existingIdx = prev.findIndex(
        (it) => it.product.id === product.id && it.selectedSize === size && it.selectedColor === color
      );
      if (existingIdx >= 0) {
        const copy = [...prev];
        const newQty = Math.min(product.stock, copy[existingIdx].quantity + qty);
        copy[existingIdx].quantity = newQty;
        return copy;
      } else {
        return [
          ...prev,
          {
            product,
            selectedSize: size,
            selectedColor: color,
            quantity: qty,
          },
        ];
      }
    });
  };

  const handleUpdateQuantity = (index: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(index);
      return;
    }
    setCartItems((prev) => {
      const copy = [...prev];
      copy[index].quantity = newQty;
      return copy;
    });
  };

  const handleRemoveItem = (index: number) => {
    setCartItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleApplyVoucher = (code: string): boolean => {
    if (code === 'SEPTIA10' || code === 'SEPTIALUXURY') {
      const subtotal = cartItems.reduce((acc, it) => acc + it.product.price * it.quantity, 0);
      setDiscount(Math.round(subtotal * 0.1));
      return true;
    }
    if (code === 'ONGKIRFREE') {
      setDiscount(25000);
      return true;
    }
    return false;
  };

  // Checkout Handlers
  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = (orderId: string, totalAmount: number, paymentMethod: string) => {
    setIsCheckoutOpen(false);
    setCartItems([]);
    setDiscount(0);
    setCreatedOrderData({ orderId, totalAmount, paymentMethod });
    loadData();
  };

  // Admin Auth Handlers
  const handleOpenAdmin = () => {
    if (adminUser) {
      setIsAdminView(true);
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  const handleLoginSuccess = (user: AdminUser) => {
    setAdminUser(user);
    localStorage.setItem('hos_admin_user', JSON.stringify(user));
    setIsAdminLoginOpen(false);
    setIsAdminView(true);
    loadData();
  };

  const handleAdminLogout = () => {
    setAdminUser(null);
    localStorage.removeItem('hos_admin_user');
    setIsAdminView(false);
  };

  // Filter & Sort Products
  const filteredProducts = products
    .filter((p) => {
      const matchCat = selectedCategory === 'Semua' || p.category === selectedCategory;
      const matchQuery =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.material.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'stock') return b.stock - a.stock;
      return 0;
    });

  // If Admin View is active, render Admin Dashboard
  if (isAdminView && adminUser) {
    return (
      <AdminDashboard
        adminUser={adminUser}
        onLogout={handleAdminLogout}
        onBackToStore={() => setIsAdminView(false)}
        products={products}
        orders={orders}
        customers={customers}
        salesReport={salesReport}
        onRefreshAll={loadData}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F3EC] text-[#382A22] flex flex-col font-sans">
      {/* Navbar with Horizontally Aligned (Sejajar) Title & Earth Tones */}
      <Navbar
        cartCount={cartItems.reduce((acc, it) => acc + it.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAdmin={handleOpenAdmin}
        onOpenOrderTracker={() => setIsOrderTrackerOpen(true)}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setSearchQuery('');
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        adminUser={adminUser}
        onAdminLogout={handleAdminLogout}
      />

      {/* Hero Banner */}
      <HeroBanner
        onExplore={() => {
          const el = document.getElementById('catalog-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Main Catalog Section */}
      <main id="catalog-section" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Section Heading & Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#E2D7C7]">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-[#A45A38]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Katalog Busana Terpilih</span>
            </div>
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#382A22] mt-1">
              {selectedCategory === 'Semua' ? 'Koleksi Lengkap 12 Produk' : selectedCategory}
            </h2>
            <p className="text-xs text-[#7E6E63] mt-1">
              Menampilkan {filteredProducts.length} dari 12 produk fashion wanita · Real DB Connected
            </p>
          </div>

          {/* Sort & Refresh controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-[#7E6E63]">
              <label htmlFor="sort-select" className="font-medium text-[#382A22]">Urutkan:</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[#FCFAF6] border border-[#D6C7B2] rounded px-2.5 py-1 text-xs text-[#382A22] focus:outline-none focus:ring-1 focus:ring-[#A45A38]"
              >
                <option value="default">Rekomendasi</option>
                <option value="price-asc">Harga: Rendah ke Tinggi</option>
                <option value="price-desc">Harga: Tinggi ke Rendah</option>
                <option value="stock">Stok Terbanyak</option>
              </select>
            </div>

            <button
              onClick={loadData}
              className="p-1.5 border border-[#D6C7B2] bg-[#FCFAF6] rounded text-[#645347] hover:text-[#382A22] hover:bg-[#EFE8DC] cursor-pointer"
              title="Perbarui data stok langsung dari database"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#A45A38]' : ''}`} />
            </button>
          </div>
        </div>

        {/* 3 Categories Overview Cards - Earth Tone */}
        {selectedCategory === 'Semua' && !searchQuery && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
            <button
              onClick={() => setSelectedCategory('Dress & Kebaya Modern')}
              className="p-5 rounded-lg border border-[#E2D7C7] bg-[#FCFAF6] text-left hover:border-[#A45A38] hover:shadow-xs transition-all cursor-pointer group"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#A45A38] block">Kategori 1</span>
              <h3 className="font-editorial text-lg font-bold text-[#382A22] group-hover:text-[#A45A38] transition-colors mt-0.5">
                Dress &amp; Kebaya Modern
              </h3>
              <p className="text-xs text-[#645347] mt-1">
                Gaun pesta sutra jacquard, kebaya organza bordir &amp; kaftan mewah.
              </p>
              <span className="text-[11px] font-semibold text-[#A45A38] mt-2 inline-block">
                4 Koleksi Tersedia &rarr;
              </span>
            </button>

            <button
              onClick={() => setSelectedCategory('Atasan & Blouse Chic')}
              className="p-5 rounded-lg border border-[#E2D7C7] bg-[#FCFAF6] text-left hover:border-[#A45A38] hover:shadow-xs transition-all cursor-pointer group"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#A45A38] block">Kategori 2</span>
              <h3 className="font-editorial text-lg font-bold text-[#382A22] group-hover:text-[#A45A38] transition-colors mt-0.5">
                Atasan &amp; Blouse Chic
              </h3>
              <p className="text-xs text-[#645347] mt-1">
                Linen rami puff sleeve, kemeja renda poplin vintage, peplum &amp; rajut ribbon.
              </p>
              <span className="text-[11px] font-semibold text-[#A45A38] mt-2 inline-block">
                4 Koleksi Tersedia &rarr;
              </span>
            </button>

            <button
              onClick={() => setSelectedCategory('Bawahan & Rok Kasual')}
              className="p-5 rounded-lg border border-[#E2D7C7] bg-[#FCFAF6] text-left hover:border-[#A45A38] hover:shadow-xs transition-all cursor-pointer group"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#A45A38] block">Kategori 3</span>
              <h3 className="font-editorial text-lg font-bold text-[#382A22] group-hover:text-[#A45A38] transition-colors mt-0.5">
                Bawahan &amp; Rok Kasual
              </h3>
              <p className="text-xs text-[#645347] mt-1">
                Kulot high-waist, rok duyung bertingkat, plisket flowy &amp; palazzo tailoring.
              </p>
              <span className="text-[11px] font-semibold text-[#A45A38] mt-2 inline-block">
                4 Koleksi Tersedia &rarr;
              </span>
            </button>
          </div>
        )}

        {/* Product Cards Grid */}
        <div className="mt-8">
          {loading && products.length === 0 ? (
            <div className="py-20 text-center text-[#7E6E63]">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#A45A38] mb-3" />
              <p className="font-editorial text-lg font-bold text-[#382A22]">Memuat Koleksi Busana House of Septia...</p>
              <p className="text-xs text-[#7E6E63]">Menghubungkan ke SQLite single source of truth database.</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-16 text-center text-[#7E6E63] bg-[#FCFAF6] rounded-lg border border-[#E2D7C7]">
              <ShoppingBag className="w-10 h-10 mx-auto text-[#D6C7B2] mb-2" />
              <p className="font-editorial text-lg font-bold text-[#382A22]">Produk Tidak Ditemukan</p>
              <p className="text-xs text-[#7E6E63] mt-1">
                Tidak ada busana yang cocok dengan kata kunci "{searchQuery}".
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('Semua');
                }}
                className="mt-4 px-4 py-2 bg-[#382A22] text-[#F7F3EC] text-xs font-semibold rounded cursor-pointer hover:bg-[#4E3B30]"
              >
                Tampilkan Semua Koleksi
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={(p) => setQuickViewProduct(p)}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Floating Database & Admin Banner - Earth Tone */}
      <aside className="border-t border-[#E2D7C7] bg-[#FCFAF6] py-4 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#645347]">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#5E694A] animate-ping" />
            <Database className="w-4 h-4 text-[#5E694A]" />
            <span className="font-semibold text-[#382A22]">Database Status:</span>
            <span>{dbStatus}</span>
            <span aria-hidden="true" className="text-[#D6C7B2]">·</span>
            <span className="text-[#7E6E63]">12 Produk Aktif · {orders.length} Transaksi Terdata</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOrderTrackerOpen(true)}
              className="text-[#A45A38] font-semibold hover:underline cursor-pointer"
            >
              Cek Riwayat Pesanan
            </button>
            <span aria-hidden="true" className="text-[#D6C7B2]">·</span>
            <button
              onClick={handleOpenAdmin}
              className="px-3 py-1 bg-[#382A22] text-[#F7F3EC] rounded text-xs font-semibold hover:bg-[#4E3B30] flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#E5B582]" />
              <span>Buka Admin Panel (Kelola Stok &amp; Approval)</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Footer - Earth Dark Cacao & Warm Sand */}
      <footer className="bg-[#2E221A] text-[#F7F3EC] pt-12 pb-8 border-t border-[#443327]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#443327] text-xs">
            {/* Col 1: Brand */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src="/logo.jpg"
                  alt="House of Septia Emblem"
                  className="w-12 h-12 rounded-full object-cover border border-[#634C3E] shadow-xs flex-shrink-0"
                />
                <h3 className="font-editorial text-2xl font-bold tracking-[0.14em] text-white uppercase">
                  House of Septia
                </h3>
              </div>
              <p className="text-[#D6C7B2] leading-relaxed">
                Butik fashion wanita terkurasi yang memadukan siluet modern dengan warisan tekstil adiluhung Nusantara.
              </p>
              <p className="text-[11px] text-[#E5B582] font-mono">
                Single Source of Truth: Relational Database Engine
              </p>
            </div>

            {/* Col 2: Kategori */}
            <div className="space-y-2 text-[#D6C7B2]">
              <h4 className="font-semibold text-white uppercase tracking-wider text-xs">Koleksi Busana</h4>
              <ul className="space-y-1.5">
                <li>
                  <button onClick={() => setSelectedCategory('Dress & Kebaya Modern')} className="hover:text-[#E5B582] cursor-pointer">
                    Dress &amp; Kebaya Modern
                  </button>
                </li>
                <li>
                  <button onClick={() => setSelectedCategory('Atasan & Blouse Chic')} className="hover:text-[#E5B582] cursor-pointer">
                    Atasan &amp; Blouse Chic
                  </button>
                </li>
                <li>
                  <button onClick={() => setSelectedCategory('Bawahan & Rok Kasual')} className="hover:text-[#E5B582] cursor-pointer">
                    Bawahan &amp; Rok Kasual
                  </button>
                </li>
                <li>
                  <button onClick={() => setSelectedCategory('Semua')} className="hover:text-[#E5B582] cursor-pointer">
                    Semua 12 Produk
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Layanan Pelanggan */}
            <div className="space-y-2 text-[#D6C7B2]">
              <h4 className="font-semibold text-white uppercase tracking-wider text-xs">Layanan Butik</h4>
              <ul className="space-y-1.5">
                <li>
                  <button onClick={() => setIsOrderTrackerOpen(true)} className="hover:text-[#E5B582] cursor-pointer">
                    Lacak Status &amp; Bukti Pembayaran
                  </button>
                </li>
                <li>
                  <button onClick={() => setIsCartOpen(true)} className="hover:text-[#E5B582] cursor-pointer">
                    Keranjang Belanja
                  </button>
                </li>
                <li>
                  <button onClick={handleOpenAdmin} className="hover:text-[#E5B582] cursor-pointer">
                    Portal Pengelola / Admin
                  </button>
                </li>
                <li>Panduan Ukuran Busana (Size Guide)</li>
              </ul>
            </div>

            {/* Col 4: Kontak & Alamat */}
            <div className="space-y-2 text-[#D6C7B2]">
              <h4 className="font-semibold text-white uppercase tracking-wider text-xs">Kontak &amp; Atelier</h4>
              <div className="space-y-1.5 text-[#C5B29B]">
                <p className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#E5B582] flex-shrink-0" />
                  <span>Pekunden, Semarang Tengah</span>
                </p>
                <a
                  href="https://wa.me/628818587736"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-[#E5B582] transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-[#E5B582] flex-shrink-0" />
                  <span>WhatsApp: +62 881-8587-736</span>
                </a>
                <p className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#E5B582] flex-shrink-0" />
                  <span>septiaaryani123@gmail.com</span>
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#9B897A]">
            <p>&copy; 2026 House of Septia. Hak Cipta Dilindungi Undang-Undang.</p>
            <p className="text-[11px]">Ditenagai SQLite 3 Database &amp; Express Engine</p>
          </div>
        </div>
      </footer>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={handleProceedToCheckout}
        discount={discount}
        onApplyVoucher={handleApplyVoucher}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCartWithSize={handleAddToCartWithSize}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        discount={discount}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Post Checkout Order Confirmation & Proof Upload Modal */}
      {createdOrderData && (
        <OrderConfirmationModal
          isOpen={Boolean(createdOrderData)}
          onClose={() => setCreatedOrderData(null)}
          orderId={createdOrderData.orderId}
          totalAmount={createdOrderData.totalAmount}
          paymentMethod={createdOrderData.paymentMethod}
          onProofUploaded={() => {
            loadData();
          }}
        />
      )}

      {/* Order Tracker Modal */}
      <OrderTrackerModal
        isOpen={isOrderTrackerOpen}
        onClose={() => setIsOrderTrackerOpen(false)}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
