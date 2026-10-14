import React, { useState } from 'react';
import { X, CreditCard, ShieldCheck, Loader2 } from 'lucide-react';
import { CartItem } from '../types/index.ts';
import { formatRupiah } from '../utils/format.ts';
import { createOrder } from '../services/api.ts';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  discount: number;
  onOrderSuccess: (orderId: string, totalAmount: number, paymentMethod: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  discount,
  onOrderSuccess,
}) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: 'Semarang',
    postalCode: '50241',
    paymentMethod: 'Transfer Bank BCA',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const isFreeShipping = subtotal >= 500000;
  const shippingFee = isFreeShipping ? 0 : 25000;
  const totalAmount = Math.max(0, subtotal + shippingFee - discount);

  const paymentMethods = [
    {
      id: 'Transfer Bank BCA',
      title: 'BCA Virtual Account / Transfer',
      desc: 'No. Rek: 873-0918-291 a.n House of Septia',
    },
    {
      id: 'Transfer Bank Mandiri',
      title: 'Bank Mandiri Transfer',
      desc: 'No. Rek: 137-00-19283-91 a.n House of Septia',
    },
    {
      id: 'QRIS Realtime',
      title: 'QRIS (Gopay / OVO / ShopeePay / BCA Mobile)',
      desc: 'Scan barcode instan saat konfirmasi pesanan',
    },
    {
      id: 'Bank Syariah Indonesia (BSI)',
      title: 'BSI Syariah Transfer',
      desc: 'No. Rek: 719-281-9011 a.n House of Septia',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.address.trim()) {
      setErrorMsg('Mohon lengkapi seluruh formulir data pengiriman.');
      return;
    }

    try {
      setLoading(true);

      const orderPayload = {
        customer_name: formData.name.trim(),
        customer_email: formData.email.trim(),
        customer_phone: formData.phone.trim(),
        customer_address: formData.address.trim(),
        city: formData.city,
        postal_code: formData.postalCode,
        shipping_fee: shippingFee,
        discount: discount,
        payment_method: formData.paymentMethod,
        notes: formData.notes.trim(),
        items: items.map((it) => ({
          id: it.product.id,
          name: it.product.name,
          price: it.product.price,
          quantity: it.quantity,
          size: it.selectedSize,
          color: it.selectedColor,
          image_url: it.product.image_url,
        })),
      };

      const result = await createOrder(orderPayload);
      onOrderSuccess(result.order_id, result.total_amount, formData.paymentMethod);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memproses pesanan. Periksa stok produk.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2A1F18]/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#FCFAF6] rounded-xl shadow-2xl border border-[#E2D7C7] overflow-hidden my-6">
        {/* Header */}
        <div className="p-5 bg-[#FCFAF6] border-b border-[#E2D7C7] flex items-center justify-between">
          <div>
            <h3 className="font-editorial text-2xl font-bold text-[#382A22]">
              Checkout &amp; Pengiriman
            </h3>
            <p className="text-xs text-[#7E6E63]">
              Data transaksi akan tersimpan langsung di real database House of Septia
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-[#382A22] rounded hover:bg-[#EFE8DC] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-md">
            {errorMsg}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Customer & Address Form */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#A45A38]">
              1. Informasi Kontak &amp; Alamat Pembeli
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#382A22] mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Amanda Putri"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#D6C7B2] rounded focus:outline-none focus:ring-1 focus:ring-[#A45A38]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#382A22] mb-1">
                  Email Aktif *
                </label>
                <input
                  type="email"
                  required
                  placeholder="amanda@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#D6C7B2] rounded focus:outline-none focus:ring-1 focus:ring-[#A45A38]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-xs font-medium text-[#382A22] mb-1">
                  Nomor WhatsApp / HP *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="081234567890"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#D6C7B2] rounded focus:outline-none focus:ring-1 focus:ring-[#A45A38]"
                />
              </div>

              <div className="sm:col-span-1">
                <label className="block text-xs font-medium text-[#382A22] mb-1">
                  Kota / Kabupaten *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Jakarta Selatan"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#D6C7B2] rounded focus:outline-none focus:ring-1 focus:ring-[#A45A38]"
                />
              </div>

              <div className="sm:col-span-1">
                <label className="block text-xs font-medium text-[#382A22] mb-1">
                  Kode Pos
                </label>
                <input
                  type="text"
                  placeholder="12190"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#D6C7B2] rounded focus:outline-none focus:ring-1 focus:ring-[#A45A38]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#382A22] mb-1">
                Alamat Lengkap Pengiriman *
              </label>
              <textarea
                required
                rows={2}
                placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, patokan lokasi..."
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white border border-[#D6C7B2] rounded focus:outline-none focus:ring-1 focus:ring-[#A45A38]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#382A22] mb-1">
                Catatan Khusus Pesanan (Opsional)
              </label>
              <input
                type="text"
                placeholder="Misal: Mohon kirim sebelum jam 3 sore, kartu ucapan, dsb."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white border border-[#D6C7B2] rounded focus:outline-none focus:ring-1 focus:ring-[#A45A38]"
              />
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-3 pt-2 border-t border-[#E2D7C7]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#A45A38]">
              2. Metode Pembayaran Transfer &amp; QRIS
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {paymentMethods.map((pm) => (
                <label
                  key={pm.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    formData.paymentMethod === pm.id
                      ? 'border-[#A45A38] bg-[#EFE8DC] ring-1 ring-[#A45A38]'
                      : 'border-[#D6C7B2] bg-white hover:border-[#A45A38]'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={pm.id}
                    checked={formData.paymentMethod === pm.id}
                    onChange={() => setFormData({ ...formData, paymentMethod: pm.id })}
                    className="mt-0.5 text-[#A45A38] focus:ring-[#A45A38]"
                  />
                  <div>
                    <p className="text-xs font-bold text-[#382A22]">{pm.title}</p>
                    <p className="text-[11px] text-[#7E6E63] mt-0.5">{pm.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Order Summary Recap */}
          <div className="p-4 bg-white rounded-lg border border-[#E2D7C7] space-y-2 text-xs">
            <div className="flex justify-between text-[#645347]">
              <span>Item Dipesan ({items.reduce((s, it) => s + it.quantity, 0)} pcs)</span>
              <span>{formatRupiah(subtotal)}</span>
            </div>
            <div className="flex justify-between text-[#645347]">
              <span>Ongkos Kirim</span>
              <span>{isFreeShipping ? <strong className="text-[#5E694A]">GRATIS</strong> : formatRupiah(shippingFee)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-[#5E694A] font-medium">
                <span>Diskon Promo</span>
                <span>-{formatRupiah(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-[#382A22] border-t border-[#E2D7C7] pt-2">
              <span>Total yang Harus Dibayar:</span>
              <span className="text-base text-[#A45A38]">{formatRupiah(totalAmount)}</span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 text-[11px] text-[#7E6E63]">
              <ShieldCheck className="w-4 h-4 text-[#5E694A]" />
              <span>Transaksi Aman &amp; Tercatat di Real Database</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-[#382A22] text-[#F7F3EC] text-xs font-bold uppercase tracking-wider rounded hover:bg-[#4E3B30] transition-all flex items-center gap-2 shadow-md disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#E5B582]" />
                  <span>Memproses Pesanan...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 text-[#E5B582]" />
                  <span>Buat Pesanan &amp; Bayar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
