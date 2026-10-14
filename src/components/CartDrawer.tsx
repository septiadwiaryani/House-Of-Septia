import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, Truck } from 'lucide-react';
import { CartItem } from '../types/index.ts';
import { formatRupiah } from '../utils/format.ts';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  onProceedToCheckout: () => void;
  discount: number;
  onApplyVoucher: (code: string) => boolean;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  discount,
  onApplyVoucher,
}) => {
  const [voucherInput, setVoucherInput] = useState('');
  const [voucherMsg, setVoucherMsg] = useState<{ text: string; error: boolean } | null>(null);

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const FREE_SHIPPING_THRESHOLD = 500000;
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const shippingFee = items.length === 0 ? 0 : (isFreeShipping ? 0 : 25000);
  const finalTotal = Math.max(0, subtotal + shippingFee - discount);

  const handleVoucherApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherInput.trim()) return;
    const success = onApplyVoucher(voucherInput.trim().toUpperCase());
    if (success) {
      setVoucherMsg({ text: 'Voucher berhasil digunakan! Diskon telah dipotong.', error: false });
    } else {
      setVoucherMsg({ text: 'Kode voucher tidak valid atau kedaluwarsa.', error: true });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#2A1F18]/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#F7F3EC] shadow-2xl flex flex-col border-l border-[#E2D7C7]">
          {/* Header */}
          <div className="p-6 bg-[#FCFAF6] border-b border-[#E2D7C7] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#A45A38]" />
              <h2 className="font-editorial text-xl font-bold text-[#382A22]">
                Keranjang Belanja ({items.reduce((acc, it) => acc + it.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-500 hover:text-[#382A22] rounded hover:bg-[#EFE8DC] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress */}
          <div className="bg-[#EFE8DC] px-6 py-2.5 border-b border-[#E2D7C7] text-xs">
            <div className="flex items-center gap-1.5 text-[#645347] font-medium">
              <Truck className="w-3.5 h-3.5 text-[#A45A38]" />
              {isFreeShipping ? (
                <span className="text-[#5E694A] font-semibold">Selamat! Anda berhak mendapatkan Gratis Ongkir</span>
              ) : (
                <span>
                  Belanja lagi <strong>{formatRupiah(remainingForFreeShipping)}</strong> untuk Gratis Ongkir
                </span>
              )}
            </div>
            <div className="w-full bg-[#D6C7B2] h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div
                className="bg-[#A45A38] h-full transition-all duration-300"
                style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-stone-500 py-12">
                <ShoppingBag className="w-12 h-12 text-[#D6C7B2] mb-3" />
                <p className="font-editorial text-lg text-[#382A22] font-medium">Keranjang Belanja Masih Kosong</p>
                <p className="text-xs text-[#7E6E63] max-w-xs mt-1">
                  Jelajahi 12 koleksi fashion cewek House of Septia dan temukan busana favorit Anda.
                </p>
                <button
                  onClick={onClose}
                  className="mt-5 px-4 py-2 bg-[#382A22] text-[#F7F3EC] text-xs font-semibold uppercase tracking-wider rounded hover:bg-[#4E3B30] cursor-pointer"
                >
                  Mulai Belanja
                </button>
              </div>
            ) : (
              items.map((item, index) => (
                <div
                  key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}-${index}`}
                  className="bg-[#FCFAF6] p-3 rounded-lg border border-[#E2D7C7] flex gap-3 shadow-2xs"
                >
                  <img
                    src={item.product.image_url}
                    alt={item.product.name}
                    className="w-20 h-24 object-cover object-top rounded bg-[#EFE8DC] flex-shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-editorial font-bold text-sm text-[#382A22] line-clamp-1">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(index)}
                          className="text-stone-400 hover:text-rose-600 p-0.5 cursor-pointer transition-colors"
                          title="Hapus barang"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-[#7E6E63] mt-0.5">
                        <span>Ukuran: <strong>{item.selectedSize}</strong></span>
                        <span aria-hidden="true">·</span>
                        <span>Warna: <strong>{item.selectedColor}</strong></span>
                      </div>

                      <p className="text-xs font-bold text-[#A45A38] mt-1">
                        {formatRupiah(item.product.price)}
                      </p>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#EFE8DC]">
                      <div className="flex items-center border border-[#D6C7B2] rounded bg-[#F7F3EC]">
                        <button
                          onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                          className="px-2 py-0.5 text-xs text-[#382A22] hover:bg-[#E2D7C7] cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-2 py-0.5 text-xs font-bold text-[#382A22]">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                          className="px-2 py-0.5 text-xs text-[#382A22] hover:bg-[#E2D7C7] disabled:opacity-40 cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-xs font-semibold text-[#382A22]">
                        {formatRupiah(item.product.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bottom Summary & Checkout */}
          {items.length > 0 && (
            <div className="p-6 bg-[#FCFAF6] border-t border-[#E2D7C7] space-y-4">
              {/* Voucher Form */}
              <form onSubmit={handleVoucherApply} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Kode Promo (coba: SEPTIA10)"
                    value={voucherInput}
                    onChange={(e) => setVoucherInput(e.target.value)}
                    className="w-full pl-8 pr-2 py-1.5 text-xs uppercase border border-[#D6C7B2] rounded focus:outline-none focus:ring-1 focus:ring-[#A45A38] bg-[#F7F3EC]"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-[#A45A38] text-white text-xs font-semibold rounded hover:bg-[#8F4628] cursor-pointer"
                >
                  Terapkan
                </button>
              </form>
              {voucherMsg && (
                <p className={`text-[11px] ${voucherMsg.error ? 'text-rose-700' : 'text-[#5E694A] font-semibold'}`}>
                  {voucherMsg.text}
                </p>
              )}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-[#645347] border-t border-[#EFE8DC] pt-3">
                <div className="flex justify-between">
                  <span>Subtotal Produk</span>
                  <span className="font-medium text-[#382A22]">{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimasi Ongkir</span>
                  <span>{isFreeShipping ? <strong className="text-[#5E694A]">GRATIS</strong> : formatRupiah(shippingFee)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-[#5E694A] font-medium">
                    <span>Diskon Voucher</span>
                    <span>-{formatRupiah(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-[#382A22] border-t border-[#E2D7C7] pt-2">
                  <span>Total Tagihan</span>
                  <span className="text-base text-[#A45A38]">{formatRupiah(finalTotal)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={onProceedToCheckout}
                className="w-full py-3 bg-[#382A22] text-[#F7F3EC] text-xs font-bold uppercase tracking-wider rounded hover:bg-[#4E3B30] transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <span>Lanjut ke Pembayaran</span>
                <ArrowRight className="w-4 h-4 text-[#E5B582]" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
