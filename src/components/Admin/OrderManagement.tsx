import React, { useState } from 'react';
import { Search, RefreshCw, Eye, Package, Truck, CheckCircle2, XCircle, Clock, X } from 'lucide-react';
import { Order, OrderStatus } from '../../types/index.ts';
import { formatRupiah, formatDate, getPaymentStatusLabel, getOrderStatusLabel } from '../../utils/format.ts';
import { updateOrderStatus } from '../../services/api.ts';

interface OrderManagementProps {
  orders: Order[];
  onRefresh: () => void;
}

export const OrderManagement: React.FC<OrderManagementProps> = ({
  orders,
  onRefresh,
}) => {
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('semua');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('semua');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const filteredOrders = orders.filter((o) => {
    const matchStatus = selectedStatus === 'semua' || o.order_status === selectedStatus;
    const matchPay = selectedPaymentStatus === 'semua' || o.payment_status === selectedPaymentStatus;
    const matchSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_email.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchPay && matchSearch;
  });

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      setLoadingId(orderId);
      await updateOrderStatus(orderId, newStatus);
      setFeedback(`Status pesanan ${orderId} berhasil diubah ke "${newStatus}".`);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah status');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Controls */}
      <div className="bg-[#FCFAF6] p-4 rounded-lg border border-[#E2D7C7] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
            <input
              type="text"
              placeholder="Cari ID order, nama, email pembeli..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F7F3EC] border border-[#D6C7B2] rounded focus:outline-none focus:ring-1 focus:ring-[#A45A38] text-[#382A22]"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 text-xs bg-[#F7F3EC] border border-[#D6C7B2] rounded focus:outline-none focus:ring-1 focus:ring-[#A45A38] text-[#382A22]"
          >
            <option value="semua">Semua Status Pesanan</option>
            <option value="pending">Pending</option>
            <option value="diproses">Diproses / Dikemas</option>
            <option value="dikirim">Dalam Pengiriman</option>
            <option value="selesai">Selesai</option>
            <option value="dibatalkan">Dibatalkan</option>
          </select>

          <select
            value={selectedPaymentStatus}
            onChange={(e) => setSelectedPaymentStatus(e.target.value)}
            className="px-3 py-1.5 text-xs bg-[#F7F3EC] border border-[#D6C7B2] rounded focus:outline-none focus:ring-1 focus:ring-[#A45A38] text-[#382A22]"
          >
            <option value="semua">Semua Status Pembayaran</option>
            <option value="menunggu_pembayaran">Menunggu Bayar</option>
            <option value="menunggu_verifikasi">Menunggu Verifikasi</option>
            <option value="lunas">Lunas</option>
            <option value="ditolak">Ditolak</option>
          </select>
        </div>

        <button
          onClick={onRefresh}
          className="p-2 border border-[#D6C7B2] rounded text-[#645347] hover:bg-[#EFE8DC] cursor-pointer self-end md:self-auto"
          title="Refresh database pesanan"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded flex items-center justify-between">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-stone-400 hover:text-stone-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-lg border border-[#EAE3DA] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#EAE3DA] text-stone-600 uppercase tracking-wider text-[11px] font-semibold">
                <th className="py-3 px-4">ID Pesanan &amp; Waktu</th>
                <th className="py-3 px-4">Nama Pelanggan</th>
                <th className="py-3 px-4">Item &amp; Total Tagihan</th>
                <th className="py-3 px-4">Status Pembayaran</th>
                <th className="py-3 px-4">Status Pengiriman</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone-500">
                    Tidak ada data order yang sesuai.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => {
                  const payLabel = getPaymentStatusLabel(o.payment_status);
                  const isUpdating = loadingId === o.id;

                  return (
                    <tr key={o.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-stone-900 block">{o.id}</span>
                        <span className="text-[10px] text-stone-400">{formatDate(o.created_at)}</span>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-bold text-[#2C2724]">{o.customer_name}</p>
                        <p className="text-[11px] text-stone-500">{o.customer_phone}</p>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-sm text-[#B45309] block">
                          {formatRupiah(o.total_amount)}
                        </span>
                        <span className="text-[11px] text-stone-500">
                          {o.items.reduce((acc, it) => acc + it.quantity, 0)} pcs ({o.items.length} jenis)
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${payLabel.colorClass}`}>
                          {payLabel.label}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <select
                          value={o.order_status}
                          disabled={isUpdating}
                          onChange={(e) => handleStatusChange(o.id, e.target.value)}
                          className="px-2 py-1 text-xs border border-stone-300 rounded bg-white text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#8D6444] cursor-pointer"
                        >
                          <option value="pending">Pending</option>
                          <option value="diproses">Diproses</option>
                          <option value="dikirim">Dikirim</option>
                          <option value="selesai">Selesai</option>
                          <option value="dibatalkan">Dibatalkan</option>
                        </select>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(o)}
                          className="px-2.5 py-1.5 border border-[#D8CABE] rounded text-stone-700 hover:bg-stone-100 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Rincian</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#FAF8F5] rounded-xl shadow-2xl border border-[#EAE3DA] overflow-hidden my-6">
            <div className="p-5 bg-white border-b border-[#EAE3DA] flex items-center justify-between">
              <div>
                <h4 className="font-editorial text-xl font-bold text-[#2C2724]">
                  Detail Lengkap Transaksi
                </h4>
                <p className="font-mono text-xs text-stone-500">{selectedOrder.id}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Customer and Shipping Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-white rounded-lg border border-[#EAE3DA] text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
                    Informasi Pembeli
                  </span>
                  <p className="font-bold text-sm text-[#2C2724] mt-1">{selectedOrder.customer_name}</p>
                  <p className="text-stone-600">{selectedOrder.customer_email}</p>
                  <p className="text-stone-600">{selectedOrder.customer_phone}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
                    Alamat Pengiriman
                  </span>
                  <p className="text-stone-700 mt-1 leading-relaxed">{selectedOrder.customer_address}</p>
                  <p className="text-stone-500 mt-1">Metode Bayar: <strong>{selectedOrder.payment_method}</strong></p>
                </div>
              </div>

              {/* Items List */}
              <div className="p-4 bg-white rounded-lg border border-[#EAE3DA] space-y-3">
                <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                  Produk yang Dipesan ({selectedOrder.items.length} item)
                </span>
                <div className="divide-y divide-stone-100">
                  {selectedOrder.items.map((it, idx) => (
                    <div key={idx} className="py-2.5 flex items-center gap-3 text-xs">
                      <img
                        src={it.image_url}
                        alt={it.name}
                        className="w-12 h-14 object-cover object-top rounded border border-stone-200"
                      />
                      <div className="flex-1">
                        <p className="font-bold text-[#2C2724]">{it.name}</p>
                        <p className="text-[11px] text-stone-500">
                          Ukuran: {it.size} · Warna: {it.color} · Qty: {it.quantity} pcs
                        </p>
                      </div>
                      <span className="font-bold text-[#B45309]">
                        {formatRupiah(it.price * it.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-stone-100 space-y-1 text-xs text-stone-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatRupiah(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ongkir</span>
                    <span>{formatRupiah(selectedOrder.shipping_fee)}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Diskon</span>
                      <span>-{formatRupiah(selectedOrder.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold text-[#2C2724] pt-2 border-t border-stone-200">
                    <span>Total Transaksi</span>
                    <span className="text-[#B45309]">{formatRupiah(selectedOrder.total_amount)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Proof Preview if any */}
              {selectedOrder.payment_proof_url && (
                <div className="p-4 bg-white rounded-lg border border-[#EAE3DA] space-y-2">
                  <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                    Foto Bukti Pembayaran dari Pelanggan
                  </span>
                  <img
                    src={selectedOrder.payment_proof_url}
                    alt="Bukti Bayar"
                    className="max-h-56 object-contain rounded border border-stone-200 mx-auto"
                  />
                  {selectedOrder.notes && (
                    <p className="text-xs text-stone-600 mt-2">
                      <span className="font-semibold">Catatan Pembeli:</span> {selectedOrder.notes}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 bg-[#FAF8F5] border-t border-[#EAE3DA] flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-[#2C2724] text-white rounded text-xs font-semibold cursor-pointer"
              >
                Tutup Rincian
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
