import React, { useState } from 'react';
import { ShoppingBag, Search, ShieldCheck, Database, FileText, X } from 'lucide-react';
import { AdminUser } from '../types/index.ts';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenAdmin: () => void;
  onOpenOrderTracker: () => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  adminUser: AdminUser | null;
  onAdminLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  onOpenAdmin,
  onOpenOrderTracker,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  adminUser,
  onAdminLogout,
}) => {
  const [showSearchInput, setShowSearchInput] = useState(false);

  const categories = [
    'Semua',
    'Dress & Kebaya Modern',
    'Atasan & Blouse Chic',
    'Bawahan & Rok Kasual',
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#F7F3EC]/95 backdrop-blur-md border-b border-[#E2D7C7]">
      {/* Top Announcement Bar - Earth Tone */}
      <div className="bg-[#382A22] text-[#F7F3EC] text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 text-[#D6C7B2]">
            <span className="flex items-center gap-1.5 text-[#EFE8DC]">
              <Database className="w-3.5 h-3.5 text-[#7E9665]" />
              <span className="font-medium">Real DB Connected: SQLite 3</span>
            </span>
            <span className="hidden md:inline text-stone-500" aria-hidden="true">·</span>
            <span className="hidden md:inline text-[#D6C7B2]">Gratis Ongkir se-Indonesia Min. Belanja Rp 500.000</span>
          </div>

          <div className="flex items-center gap-4 text-[#D6C7B2]">
            <button
              onClick={onOpenOrderTracker}
              className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer text-xs"
            >
              <FileText className="w-3.5 h-3.5 text-[#C8925E]" />
              <span>Lacak Pesanan &amp; Bukti Bayar</span>
            </button>

            {adminUser ? (
              <div className="flex items-center gap-2">
                <span className="text-[#E5B582] font-medium">Hai, {adminUser.name}</span>
                <button
                  onClick={onOpenAdmin}
                  className="px-2 py-0.5 bg-[#543E32] text-[#F7F3EC] border border-[#6E5343] rounded text-xs hover:bg-[#63493A] cursor-pointer"
                >
                  Dashboard Admin
                </button>
                <button
                  onClick={onAdminLogout}
                  className="text-stone-400 hover:text-white text-xs underline cursor-pointer"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAdmin}
                className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer text-xs"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#C8925E]" />
                <span>Admin Login</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Header Bar - Clean Horizontally Aligned (Sejajar) Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Brand Identity - Aligned Horizontally (Sejajar) */}
          <div className="flex items-center">
            <button
              onClick={() => {
                onSelectCategory('Semua');
                onSearchChange('');
              }}
              className="flex items-center gap-3 text-left group cursor-pointer"
            >
              <img
                src="/logo.jpg"
                alt="House of Septia Emblem"
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border border-[#D6C7B2] shadow-2xs group-hover:scale-105 transition-transform flex-shrink-0"
              />
              <div className="flex items-baseline gap-2.5">
                <h1 className="font-editorial text-2xl sm:text-3xl font-bold tracking-[0.14em] text-[#382A22] uppercase group-hover:text-[#A45A38] transition-colors">
                  House of Septia
                </h1>
                <span className="hidden sm:inline-block w-px h-4 bg-[#D6C7B2] self-center" aria-hidden="true" />
                <span className="hidden sm:inline-block text-[11px] font-semibold tracking-[0.2em] uppercase text-[#A45A38] font-sans">
                  Atelier &amp; Boutique
                </span>
              </div>
            </button>
          </div>

          {/* Center Category Navigation (Inline & Sejajar) */}
          <nav className="hidden lg:flex items-center gap-1.5" aria-label="Kategori Koleksi">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => onSelectCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-semibold tracking-wider uppercase transition-all rounded cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-[#382A22] text-[#F7F3EC] shadow-2xs'
                      : 'text-[#645347] hover:text-[#382A22] hover:bg-[#EFE8DC]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons (Search & Cart) - Perfectly Aligned */}
          <div className="flex items-center gap-3">
            {/* Search Toggle / Input */}
            <div className="relative">
              {showSearchInput ? (
                <div className="relative w-56 sm:w-64">
                  <input
                    type="text"
                    placeholder="Cari dress, kebaya, blouse..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    autoFocus
                    className="w-full bg-[#FCFAF6] border border-[#D6C7B2] rounded px-3 py-1.5 text-xs text-[#382A22] placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#A45A38]"
                  />
                  <button
                    onClick={() => {
                      setShowSearchInput(false);
                      onSearchChange('');
                    }}
                    className="absolute right-2 top-2 text-stone-400 hover:text-stone-700 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowSearchInput(true)}
                  className="flex items-center gap-1.5 text-[#645347] hover:text-[#382A22] p-2 text-xs font-semibold transition-colors rounded hover:bg-[#EFE8DC] cursor-pointer"
                  title="Cari koleksi busana"
                >
                  <Search className="w-4 h-4 text-[#A45A38]" />
                  <span className="hidden sm:inline uppercase tracking-wider text-[11px]">Cari</span>
                </button>
              )}
            </div>

            {/* Shopping Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-3.5 py-2 bg-[#382A22] text-[#F7F3EC] rounded hover:bg-[#4E3B30] transition-all shadow-xs cursor-pointer"
              aria-label="Keranjang Belanja"
            >
              <ShoppingBag className="w-4 h-4 text-[#E5B582]" />
              <span className="text-xs font-semibold tracking-wider uppercase hidden sm:inline">
                Keranjang
              </span>
              <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-[11px] font-bold bg-[#A45A38] text-white rounded-full">
                {cartCount}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Category Scrollbar (Only for small screens when nav is hidden above) */}
        <div className="lg:hidden flex items-center gap-1.5 pb-3 overflow-x-auto no-scrollbar pt-1">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`px-3 py-1.5 text-xs font-semibold tracking-wider uppercase transition-all rounded whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#382A22] text-[#F7F3EC]'
                    : 'text-[#645347] hover:text-[#382A22] hover:bg-[#EFE8DC]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
