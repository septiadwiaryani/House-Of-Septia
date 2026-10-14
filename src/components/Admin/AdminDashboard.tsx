import React, { useState } from 'react';
import { Package, ShoppingBag, CheckSquare, Users, BarChart3, Database, LogOut, ArrowLeft } from 'lucide-react';
import { AdminUser, Product, Order, Customer, SalesReport as ISalesReport } from '../../types/index.ts';
import { ProductManagement } from './ProductManagement.tsx';
import { OrderManagement } from './OrderManagement.tsx';
import { PaymentApproval } from './PaymentApproval.tsx';
import { CustomerList } from './CustomerList.tsx';
import { SalesReport } from './SalesReport.tsx';

interface AdminDashboardProps {
  adminUser: AdminUser;
  onLogout: () => void;
  onBackToStore: () => void;
  products: Product[];
  orders: Order[];
  customers: Customer[];
  salesReport: ISalesReport | null;
  onRefreshAll: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  adminUser,
  onLogout,
  onBackToStore,
  products,
  orders,
  customers,
  salesReport,
  onRefreshAll,
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'approval' | 'customers' | 'reports'>('products');

  const pendingApprovalCount = orders.filter((o) => o.payment_status === 'menunggu_verifikasi').length;

  const tabs = [
    {
      id: 'products' as const,
      label: 'Produk & Stok',
      icon: Package,
      count: products.length,
    },
    {
      id: 'orders' as const,
      label: 'Data Order & Riwayat',
      icon: ShoppingBag,
      count: orders.length,
    },
    {
      id: 'approval' as const,
      label: 'Approval Bukti Bayar',
      icon: CheckSquare,
      badge: pendingApprovalCount > 0 ? pendingApprovalCount : undefined,
    },
    {
      id: 'customers' as const,
      label: 'Data Pelanggan',
      icon: Users,
      count: customers.length,
    },
    {
      id: 'reports' as const,
      label: 'Laporan Sales',
      icon: BarChart3,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F3EC] flex flex-col font-sans">
      {/* Admin Top Navigation - Earth Tone */}
      <header className="bg-[#382A22] text-[#F7F3EC] border-b border-[#4E3B30] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToStore}
              className="p-1.5 text-stone-300 hover:text-white rounded hover:bg-[#4E3B30] cursor-pointer flex items-center gap-1 text-xs"
              title="Kembali ke tampilan toko"
            >
              <ArrowLeft className="w-4 h-4 text-[#E5B582]" />
              <span className="hidden sm:inline">Ke Toko</span>
            </button>
            <div className="h-4 w-px bg-stone-700" />
            <div className="flex items-center gap-2.5">
              <img
                src="/logo.jpg"
                alt="House of Septia"
                className="w-8 h-8 rounded-full object-cover border border-[#634C3E] flex-shrink-0"
              />
              <div className="flex items-baseline gap-2">
                <h1 className="font-editorial text-lg font-bold tracking-wider uppercase text-[#E5B582]">
                  House of Septia Admin Panel
                </h1>
                <span className="hidden sm:inline text-[11px] text-[#D6C7B2]">
                  · Pusat Manajemen &amp; Approval
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            {/* Live DB Pill */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-[#4E3B30] rounded border border-[#634C3E] text-[#D6C7B2]">
              <Database className="w-3.5 h-3.5 text-[#7E9665]" />
              <span>SQLite Real DB (WAL)</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <p className="font-semibold text-white leading-tight">{adminUser.name}</p>
                <p className="text-[10px] text-[#E5B582] font-mono">{adminUser.role}</p>
              </div>
              <button
                onClick={onLogout}
                className="p-2 text-stone-300 hover:text-rose-300 hover:bg-[#4E3B30] rounded cursor-pointer transition-colors"
                title="Keluar Admin"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Tabs Bar - Earth Tone */}
      <div className="bg-[#FCFAF6] border-b border-[#E2D7C7] shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 py-2 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-2 text-xs font-semibold rounded flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#382A22] text-[#F7F3EC] shadow-2xs'
                      : 'text-[#645347] hover:text-[#382A22] hover:bg-[#EFE8DC]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-[#543E32] text-[#F7F3EC]' : 'bg-[#EFE8DC] text-[#645347]'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                  {tab.badge !== undefined && (
                    <span className="px-1.5 py-0.2 bg-[#A45A38] text-white rounded-full text-[10px] font-bold animate-pulse">
                      {tab.badge} Baru
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'products' && (
          <ProductManagement products={products} onRefresh={onRefreshAll} />
        )}
        {activeTab === 'orders' && (
          <OrderManagement orders={orders} onRefresh={onRefreshAll} />
        )}
        {activeTab === 'approval' && (
          <PaymentApproval orders={orders} onRefresh={onRefreshAll} />
        )}
        {activeTab === 'customers' && (
          <CustomerList customers={customers} onRefresh={onRefreshAll} />
        )}
        {activeTab === 'reports' && (
          <SalesReport report={salesReport} onRefresh={onRefreshAll} />
        )}
      </main>
    </div>
  );
};
