import React, { useState } from 'react';
import { CheckCircle2, XCircle, Eye, AlertCircle, Clock, Check, X, RefreshCw, ZoomIn, FileText, ExternalLink } from 'lucide-react';
import { Order } from '../../types/index.ts';
import { formatRupiah, formatDate, getPaymentStatusLabel } from '../../utils/format.ts';
import { approvePayment } from '../../services/api.ts';

interface PaymentApprovalProps {
  orders: Order[];
  onRefresh: () => void;
}

export const PaymentApproval: React.FC<PaymentApprovalProps> = ({
  orders,
  onRefresh,
}) => {
  const [filterTab, setFilterTab] = useState<'pending' | 'history'>('pending');
  const [selectedProofOrder, setSelectedProofOrder] = useState<Order | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; error?: boolean } | null>(null);
  const [zoomReceipt, setZoomReceipt] = useState<string | null>(null);

  // Filter orders:
  // Pending verification queue: payment_status === 'menunggu_verifikasi'
  const pendingQueue = orders.filter((o) => o.payment_status === 'menunggu_verifikasi');
  // History: orders that have payment_proof_url and are either 'lunas' or 'ditolak'
  const historyQueue = orders.filter((o) => o.payment_proof_url && (o.payment_status === 'lunas' || o.payment_status === 'ditolak'));

  const currentList = filterTab === 'pending' ? pendingQueue : historyQueue;

  const handleApprove = async (order: Order) => {
    try {
      setProcessingId(order.id);
      await approvePayment(order.id, 'lunas', actionNotes || 'Pembayaran disetujui oleh admin.');
      setFeedback({ text: `Pembayaran pesanan ${order.id} berhasil DISETUJUI (Lunas) di database.` });
      setSelectedProofOrder(null);
      setActionNotes('');
      onRefresh();
    } catch (err: any) {
      setFeedback({ text: err.message || 'Gagal menyetujui pembayaran', error: true });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (order: Order) => {
    const reason = prompt('Masukkan alasan penolakan bukti pembayaran:', 'Bukti transfer tidak terbaca / mutasi belum masuk');
    if (reason === null) return;

    try {
      setProcessingId(order.id);
      await approvePayment(order.id, 'ditolak', reason);
      setFeedback({ text: `Pembayaran pesanan ${order.id} telah DITOLAK di database.` });
      setSelectedProofOrder(null);
      setActionNotes('');
      onRefresh();
    } catch (err: any) {
      setFeedback({ text: err.message || 'Gagal menolak pembayaran', error: true });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Tabs */}
      <div className="bg-[#FCFAF6] p-4 rounded-lg border border-[#E2D7C7] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-editorial text-xl font-bold text-[#382A22]">
            Approval &amp; Verifikasi Bukti Pembayaran
          </h3>
          <p className="text-xs text-[#7E6E63]">
            Pemeriksaan manual bukti transfer m-banking / ATM dari pelanggan untuk validasi mutasi kas
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-[#F7F3EC] p-1 rounded-lg border border-[#D6C7B2]">
            <button
              onClick={() => setFilterTab('pending')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                filterTab === 'pending'
                  ? 'bg-[#382A22] text-[#F7F3EC] shadow-2xs'
                  : 'text-[#645347] hover:text-[#382A22]'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-[#E5B582]" />
              <span>Antrean Menunggu</span>
              <span className="ml-1 px-1.5 py-0.2 bg-[#A45A38] text-white rounded-full text-[10px]">
                {pendingQueue.length}
              </span>
            </button>
            <button
              onClick={() => setFilterTab('history')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                filterTab === 'history'
                  ? 'bg-[#382A22] text-[#F7F3EC] shadow-2xs'
                  : 'text-[#645347] hover:text-[#382A22]'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#5E694A]" />
              <span>Riwayat Verifikasi ({historyQueue.length})</span>
            </button>
          </div>

          <button
            onClick={onRefresh}
            className="p-2 border border-[#D6C7B2] rounded text-[#645347] hover:bg-[#EFE8DC] cursor-pointer"
            title="Refresh database"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-md text-xs flex items-center justify-between ${
            feedback.error
              ? 'bg-rose-50 text-rose-800 border border-rose-200'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}
        >
          <span>{feedback.text}</span>
          <button onClick={() => setFeedback(null)} className="p-1 text-stone-400 hover:text-stone-700">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Orders Grid with Proofs */}
      {currentList.length === 0 ? (
        <div className="bg-white rounded-lg border border-[#EAE3DA] p-12 text-center text-stone-500">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2 opacity-60" />
          <p className="font-editorial text-lg font-bold text-stone-800">
            {filterTab === 'pending'
              ? 'Tidak Ada Antrean Bukti Pembayaran Baru'
              : 'Belum Ada Riwayat Bukti Pembayaran'}
          </p>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
            {filterTab === 'pending'
              ? 'Semua bukti transfer dari pelanggan telah diproses atau belum ada unggahan baru.'
              : 'Seluruh riwayat persetujuan atau penolakan bukti bayar akan tercatat di sini.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentList.map((order) => {
            const isProcessing = processingId === order.id;
            return (
              <div
                key={order.id}
                className="bg-white rounded-lg border border-[#EAE3DA] overflow-hidden shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  {/* Card Header */}
                  <div className="p-4 bg-[#FAF8F5] border-b border-[#EAE3DA] flex items-start justify-between">
                    <div>
                      <span className="font-mono text-[11px] font-bold text-stone-700 block">
                        {order.id}
                      </span>
                      <span className="text-[10px] text-stone-400">
                        {formatDate(order.created_at)}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${getPaymentStatusLabel(order.payment_status).colorClass}`}>
                      {getPaymentStatusLabel(order.payment_status).label}
                    </span>
                  </div>

                  {/* Payment Proof Image Preview */}
                  <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden group">
                    {order.payment_proof_url ? (
                      <>
                        <img
                          src={order.payment_proof_url}
                          alt="Bukti Transfer"
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            onClick={() => setZoomReceipt(order.payment_proof_url!)}
                            className="px-3 py-1.5 bg-white text-stone-800 rounded text-xs font-semibold flex items-center gap-1 shadow cursor-pointer"
                          >
                            <ZoomIn className="w-3.5 h-3.5" />
                            <span>Perbesar Struk</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 text-xs">
                        <FileText className="w-8 h-8 mb-1" />
                        <span>Belum Ada File Bukti</span>
                      </div>
                    )}
                  </div>

                  {/* Customer & Transaction Info */}
                  <div className="p-4 space-y-2.5 text-xs">
                    <div>
                      <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Pelanggan</span>
                      <p className="font-bold text-[#2C2724]">{order.customer_name}</p>
                      <p className="text-stone-500 text-[11px]">{order.customer_phone} · {order.customer_email}</p>
                    </div>

                    <div className="flex justify-between items-baseline pt-1 border-t border-stone-100">
                      <div>
                        <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Metode</span>
                        <span className="font-medium text-stone-700">{order.payment_method}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Total Tagihan</span>
                        <span className="font-bold text-sm text-[#B45309]">{formatRupiah(order.total_amount)}</span>
                      </div>
                    </div>

                    {order.notes && (
                      <div className="p-2 bg-stone-50 rounded text-[11px] text-stone-600 border border-stone-100">
                        <span className="font-semibold text-stone-700">Catatan Pembeli: </span>
                        {order.notes}
                      </div>
                    )}

                    {order.admin_notes && (
                      <div className="p-2 bg-amber-50/70 rounded text-[11px] text-amber-900 border border-amber-200">
                        <span className="font-semibold">Catatan Admin: </span>
                        {order.admin_notes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                {order.payment_status === 'menunggu_verifikasi' && (
                  <div className="p-4 bg-[#FAF8F5] border-t border-[#EAE3DA] flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleReject(order)}
                      className="flex-1 py-2 bg-white text-rose-700 border border-rose-300 rounded text-xs font-semibold hover:bg-rose-50 flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Tolak Bukti</span>
                    </button>
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleApprove(order)}
                      className="flex-1 py-2 bg-emerald-700 text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-emerald-800 flex items-center justify-center gap-1 shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Setujui (Lunas)</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Zoom Modal for Receipt */}
      {zoomReceipt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs cursor-zoom-out"
          onClick={() => setZoomReceipt(null)}
        >
          <div className="relative max-w-2xl max-h-[90vh] bg-white p-2 rounded-lg overflow-hidden shadow-2xl">
            <button
              onClick={() => setZoomReceipt(null)}
              className="absolute top-3 right-3 p-1.5 bg-black/60 text-white rounded-full hover:bg-black"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={zoomReceipt}
              alt="Detail Bukti Transfer"
              className="max-h-[85vh] w-auto mx-auto object-contain rounded"
            />
          </div>
        </div>
      )}
    </div>
  );
};
