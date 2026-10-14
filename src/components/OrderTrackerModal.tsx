import React, { useState } from 'react';
import { X, Search, FileText, Upload, Loader2 } from 'lucide-react';
import { Order } from '../types/index.ts';
import { fetchOrderById, uploadPaymentProof } from '../services/api.ts';
import { formatRupiah, formatDate, getPaymentStatusLabel, getOrderStatusLabel } from '../utils/format.ts';

interface OrderTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOrderForAdmin?: (orderId: string) => void;
}

export const OrderTrackerModal: React.FC<OrderTrackerModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const [searchOrderId, setSearchOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [proofImageBase64, setProofImageBase64] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchOrderId.trim()) return;

    try {
      setLoading(true);
      setErrorMsg('');
      setOrder(null);
      const res = await fetchOrderById(searchOrderId.trim().toUpperCase());
      setOrder(res);
    } catch (err: any) {
      setErrorMsg('Pesanan dengan ID tersebut tidak ditemukan di database. Pastikan format benar (contoh: HOS-20261011-0082).');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setProofImageBase64(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUploadProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !proofImageBase64) return;

    try {
      setUploading(true);
      await uploadPaymentProof(order.id, proofImageBase64, notes);
      setUploadSuccess(true);
      const updated = await fetchOrderById(order.id);
      setOrder(updated);
      setTimeout(() => {
        setShowUploadForm(false);
        setUploadSuccess(false);
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengunggah bukti');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2A1F18]/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#FCFAF6] rounded-xl shadow-2xl border border-[#E2D7C7] overflow-hidden my-6">
        {/* Header */}
        <div className="p-5 bg-white border-b border-[#E2D7C7] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#A45A38]" />
            <div>
              <h3 className="font-editorial text-xl font-bold text-[#382A22]">
                Lacak Status Pesanan &amp; Unggah Bukti
              </h3>
              <p className="text-[11px] text-[#7E6E63]">
                Pencarian real-time langsung ke tabel database orders
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-[#382A22] rounded hover:bg-[#EFE8DC] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search bar */}
        <div className="p-6 space-y-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
              <input
                type="text"
                placeholder="Masukkan Nomor Order (misal: HOS-20261011-0082)"
                value={searchOrderId}
                onChange={(e) => setSearchOrderId(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs uppercase bg-white border border-[#D6C7B2] rounded focus:outline-none focus:ring-1 focus:ring-[#A45A38] font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-[#382A22] text-[#F7F3EC] text-xs font-bold uppercase tracking-wider rounded hover:bg-[#4E3B30] flex items-center gap-2 cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin text-[#E5B582]" /> : <Search className="w-4 h-4" />}
              <span>Lacak</span>
            </button>
          </form>

          {/* Quick sample chips */}
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#7E6E63]">
            <span>Coba contoh ID:</span>
            <button
              type="button"
              onClick={() => setSearchOrderId('HOS-20261011-0082')}
              className="px-2 py-0.5 bg-[#EFE8DC] hover:bg-[#E2D7C7] rounded text-[#382A22] font-mono cursor-pointer"
            >
              HOS-20261011-0082
            </button>
            <button
              type="button"
              onClick={() => setSearchOrderId('HOS-20261012-0104')}
              className="px-2 py-0.5 bg-[#EFE8DC] hover:bg-[#E2D7C7] rounded text-[#382A22] font-mono cursor-pointer"
            >
              HOS-20261012-0104
            </button>
            <button
              type="button"
              onClick={() => setSearchOrderId('HOS-20261013-0118')}
              className="px-2 py-0.5 bg-[#EFE8DC] hover:bg-[#E2D7C7] rounded text-[#382A22] font-mono cursor-pointer"
            >
              HOS-20261013-0118
            </button>
          </div>

          {errorMsg && (
            <p className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded">
              {errorMsg}
            </p>
          )}

          {/* Order Details View */}
          {order && (
            <div className="bg-white rounded-lg border border-[#E2D7C7] overflow-hidden space-y-4 p-5">
              <div className="flex flex-wrap items-start justify-between gap-2 border-b border-[#EFE8DC] pb-3">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#A45A38]">
                    Nomor Pesanan
                  </span>
                  <h4 className="font-mono text-base font-bold text-[#382A22]">{order.id}</h4>
                  <p className="text-[11px] text-[#7E6E63]">{formatDate(order.created_at)}</p>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded ${getPaymentStatusLabel(order.payment_status).colorClass}`}>
                    {getPaymentStatusLabel(order.payment_status).label}
                  </span>
                  <span className={`px-2.5 py-0.5 text-[11px] font-medium rounded ${getOrderStatusLabel(order.order_status).colorClass}`}>
                    Status: {getOrderStatusLabel(order.order_status).label}
                  </span>
                </div>
              </div>

              {/* Items in order */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-[#382A22]">Daftar Produk Pesanan:</p>
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2 bg-[#F7F3EC] rounded border border-[#E2D7C7]">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-12 h-14 object-cover object-top rounded bg-[#EFE8DC]"
                    />
                    <div className="flex-1 text-xs">
                      <p className="font-bold text-[#382A22]">{item.name}</p>
                      <p className="text-[11px] text-[#7E6E63]">
                        {item.size} · {item.color} · {item.quantity} pcs
                      </p>
                    </div>
                    <span className="text-xs font-bold text-[#A45A38]">
                      {formatRupiah(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total & Shipping info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2 border-t border-[#EFE8DC]">
                <div>
                  <p className="font-semibold text-[#382A22]">Tujuan Pengiriman:</p>
                  <p className="text-[#645347] font-medium">{order.customer_name} ({order.customer_phone})</p>
                  <p className="text-[#7E6E63] text-[11px] mt-0.5">{order.customer_address}</p>
                </div>
                <div className="text-right sm:text-right space-y-1">
                  <p className="text-[#7E6E63]">Metode: <strong>{order.payment_method}</strong></p>
                  <p className="text-[#7E6E63]">Total Pembayaran:</p>
                  <p className="text-base font-bold text-[#A45A38]">{formatRupiah(order.total_amount)}</p>
                </div>
              </div>

              {/* Admin notes if any */}
              {order.admin_notes && (
                <div className="p-3 bg-[#EFE8DC] border border-[#D6C7B2] rounded text-xs text-[#382A22]">
                  <span className="font-semibold">Catatan dari Admin House of Septia: </span>
                  {order.admin_notes}
                </div>
              )}

              {/* Payment Proof Preview or Upload Trigger */}
              <div className="pt-2 border-t border-[#EFE8DC]">
                {order.payment_proof_url ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#382A22]">Bukti Pembayaran yang Dilampirkan:</span>
                      <button
                        type="button"
                        onClick={() => setShowUploadForm(!showUploadForm)}
                        className="text-xs text-[#A45A38] underline hover:text-[#8F4628] cursor-pointer"
                      >
                        {showUploadForm ? 'Tutup Formulir Unggah' : 'Unggah Ulang Bukti'}
                      </button>
                    </div>
                    <div className="p-2 bg-[#F7F3EC] rounded border border-[#E2D7C7] inline-block">
                      <img
                        src={order.payment_proof_url}
                        alt="Bukti Transfer"
                        className="max-h-40 rounded object-contain"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-[#F7F3EC] rounded border border-[#E2D7C7] flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-[#382A22]">Belum Ada Bukti Pembayaran</p>
                      <p className="text-[11px] text-[#7E6E63]">Silakan unggah struk transfer agar pesanan diproses.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowUploadForm(true)}
                      className="px-3 py-1.5 bg-[#A45A38] text-white text-xs font-bold uppercase tracking-wider rounded cursor-pointer"
                    >
                      Unggah Bukti Sekarang
                    </button>
                  </div>
                )}

                {/* Upload Form inside tracker */}
                {showUploadForm && (
                  <form onSubmit={handleUploadProof} className="mt-3 p-4 bg-[#EFE8DC] rounded border border-[#D6C7B2] space-y-3">
                    <h5 className="text-xs font-bold text-[#A45A38] uppercase tracking-wider">
                      Form Unggah Bukti Transfer
                    </h5>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="block w-full text-xs text-[#645347] file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#382A22] file:text-white hover:file:bg-[#4E3B30]"
                    />

                    {proofImageBase64 && (
                      <div className="max-h-32 overflow-hidden rounded border border-[#D6C7B2]">
                        <img src={proofImageBase64} alt="Preview" className="max-h-32 object-contain" />
                      </div>
                    )}

                    <input
                      type="text"
                      placeholder="Catatan pengirim (rekening pengirim, dsb)"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-[#D6C7B2] rounded"
                    />

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowUploadForm(false)}
                        className="px-3 py-1.5 text-xs text-[#645347] bg-white border border-[#D6C7B2] rounded cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={uploading || !proofImageBase64}
                        className="px-4 py-1.5 bg-[#382A22] text-white text-xs font-bold uppercase rounded flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                        <span>Kirim Bukti</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
