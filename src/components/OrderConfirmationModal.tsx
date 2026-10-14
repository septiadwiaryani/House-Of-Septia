import React, { useState } from 'react';
import { CheckCircle2, Copy, Check, Upload, Image, Loader2, X } from 'lucide-react';
import { formatRupiah } from '../utils/format.ts';
import { uploadPaymentProof } from '../services/api.ts';

interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  totalAmount: number;
  paymentMethod: string;
  onProofUploaded: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  isOpen,
  onClose,
  orderId,
  totalAmount,
  paymentMethod,
  onProofUploaded,
}) => {
  if (!isOpen) return null;

  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedNominal, setCopiedNominal] = useState(false);
  const [proofImageBase64, setProofImageBase64] = useState<string | null>(null);
  const [customerNotes, setCustomerNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const getBankDetails = () => {
    if (paymentMethod.includes('BCA')) {
      return { bank: 'Bank Central Asia (BCA)', no: '8730918291', name: 'House of Septia Boutique' };
    }
    if (paymentMethod.includes('Mandiri')) {
      return { bank: 'Bank Mandiri', no: '137001928391', name: 'House of Septia Boutique' };
    }
    if (paymentMethod.includes('BSI')) {
      return { bank: 'Bank Syariah Indonesia (BSI)', no: '7192819011', name: 'House of Septia Boutique' };
    }
    return { bank: 'QRIS Realtime', no: 'NMID: ID10203040506', name: 'House of Septia' };
  };

  const bankInfo = getBankDetails();

  const handleCopy = (text: string, type: 'acc' | 'nom') => {
    navigator.clipboard?.writeText(text);
    if (type === 'acc') {
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2000);
    } else {
      setCopiedNominal(true);
      setTimeout(() => setCopiedNominal(false), 2000);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setErrorMsg('Ukuran file maksimal 8MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setProofImageBase64(reader.result as string);
        setErrorMsg('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUseSampleProof = () => {
    setProofImageBase64('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80');
    setErrorMsg('');
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofImageBase64) {
      setErrorMsg('Pilih foto bukti transfer atau gunakan sampel struk untuk mengunggah.');
      return;
    }

    try {
      setUploading(true);
      setErrorMsg('');
      await uploadPaymentProof(orderId, proofImageBase64, customerNotes);
      setUploadSuccess(true);
      onProofUploaded();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengunggah bukti pembayaran.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2A1F18]/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#FCFAF6] rounded-xl shadow-2xl border border-[#E2D7C7] overflow-hidden my-6">
        {/* Header - Earth Dark Bark */}
        <div className="bg-[#382A22] text-[#F7F3EC] p-6 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-stone-400 hover:text-white p-1 rounded cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <CheckCircle2 className="w-12 h-12 text-[#E5B582] mx-auto mb-2" />
          <h3 className="font-editorial text-2xl font-bold tracking-wide">
            Pesanan Berhasil Dibuat!
          </h3>
          <p className="text-xs text-[#D6C7B2] mt-1">
            Nomor Pesanan:{' '}
            <span className="font-mono font-bold text-[#E5B582]">{orderId}</span>
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Instructions box */}
          <div className="p-4 bg-white rounded-lg border border-[#E2D7C7] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#A45A38]">
              Instruksi Transfer Pembayaran
            </h4>

            {/* Total Amount to pay */}
            <div className="flex items-center justify-between p-3 bg-[#F7F3EC] rounded border border-[#E2D7C7]">
              <div>
                <span className="text-[11px] text-[#7E6E63] block">Total Nominal Transfer:</span>
                <span className="text-lg font-bold text-[#A45A38] font-mono">
                  {formatRupiah(totalAmount)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(String(totalAmount), 'nom')}
                className="px-2.5 py-1 text-xs border border-[#D6C7B2] bg-white hover:bg-[#EFE8DC] rounded flex items-center gap-1 text-[#382A22] cursor-pointer"
              >
                {copiedNominal ? <Check className="w-3.5 h-3.5 text-[#5E694A]" /> : <Copy className="w-3.5 h-3.5 text-[#A45A38]" />}
                <span>{copiedNominal ? 'Tersalin' : 'Salin'}</span>
              </button>
            </div>

            {/* Account Details */}
            <div className="flex items-center justify-between p-3 bg-[#F7F3EC] rounded border border-[#E2D7C7]">
              <div>
                <span className="text-[11px] text-[#7E6E63] block">{bankInfo.bank}</span>
                <span className="text-sm font-bold text-[#382A22] font-mono tracking-wider">
                  {bankInfo.no}
                </span>
                <span className="text-[10px] text-[#7E6E63] block">a.n {bankInfo.name}</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(bankInfo.no, 'acc')}
                className="px-2.5 py-1 text-xs border border-[#D6C7B2] bg-white hover:bg-[#EFE8DC] rounded flex items-center gap-1 text-[#382A22] cursor-pointer"
              >
                {copiedAccount ? <Check className="w-3.5 h-3.5 text-[#5E694A]" /> : <Copy className="w-3.5 h-3.5 text-[#A45A38]" />}
                <span>{copiedAccount ? 'Tersalin' : 'Salin No. Rek'}</span>
              </button>
            </div>
          </div>

          {/* Upload Payment Proof Form */}
          <div className="p-5 bg-white rounded-lg border border-[#E2D7C7] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#A45A38]">
                  Unggah Bukti Pembayaran (Transfer Proof)
                </h4>
                <p className="text-[11px] text-[#7E6E63]">
                  Upload screenshot m-banking / foto struk ATM agar admin dapat segera memproses pesanan
                </p>
              </div>
            </div>

            {uploadSuccess ? (
              <div className="p-4 bg-[#EFE8DC] border border-[#D6C7B2] rounded-lg text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[#5E694A] mx-auto" />
                <p className="text-sm font-bold text-[#382A22]">Bukti Pembayaran Berhasil Dikirim!</p>
                <p className="text-xs text-[#645347]">
                  Status pesanan telah diperbarui menjadi <strong>Menunggu Verifikasi</strong>. Admin House of Septia akan segera menyetujui transaksi Anda.
                </p>
                <button
                  onClick={onClose}
                  className="mt-3 px-4 py-2 bg-[#382A22] text-[#F7F3EC] text-xs font-bold uppercase tracking-wider rounded cursor-pointer"
                >
                  Tutup &amp; Selesai
                </button>
              </div>
            ) : (
              <form onSubmit={handleUploadSubmit} className="space-y-4">
                {errorMsg && (
                  <p className="text-xs text-rose-700 p-2 bg-rose-50 border border-rose-200 rounded">
                    {errorMsg}
                  </p>
                )}

                {/* File picker / drop zone */}
                <div className="border-2 border-dashed border-[#D6C7B2] rounded-lg p-4 text-center hover:bg-[#F7F3EC] transition-colors">
                  {proofImageBase64 ? (
                    <div className="space-y-2">
                      <div className="relative max-h-48 overflow-hidden rounded border border-[#E2D7C7] inline-block">
                        <img
                          src={proofImageBase64}
                          alt="Bukti Transfer"
                          className="max-h-48 object-contain mx-auto"
                        />
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() => setProofImageBase64(null)}
                          className="text-xs text-rose-700 underline cursor-pointer"
                        >
                          Ganti foto bukti transfer
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 text-[#A45A38] mx-auto" />
                      <div className="text-xs text-[#645347]">
                        <label className="text-[#A45A38] font-semibold underline cursor-pointer hover:text-[#8F4628]">
                          Pilih file foto dari perangkat
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                        <p className="text-[10px] text-stone-400 mt-1">Format: JPG, PNG, WEBP (Maks 8MB)</p>
                      </div>

                      {/* Demo Quick Pick Button */}
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={handleUseSampleProof}
                          className="px-2.5 py-1 text-[11px] bg-[#EFE8DC] hover:bg-[#E2D7C7] text-[#382A22] rounded border border-[#D6C7B2] inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Image className="w-3 h-3 text-[#A45A38]" />
                          <span>Gunakan Contoh Struk Transfer Otomatis</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#382A22] mb-1">
                    Catatan Tambahan Bukti Bayar (Nama Pengirim / Jam Transfer)
                  </label>
                  <input
                    type="text"
                    placeholder="Misal: Dari rek BCA an Amanda Putri jam 15:30"
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-[#D6C7B2] rounded focus:outline-none focus:ring-1 focus:ring-[#A45A38]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-[#D6C7B2] text-xs font-semibold rounded text-[#645347] hover:bg-[#EFE8DC] cursor-pointer"
                  >
                    Unggah Nanti
                  </button>
                  <button
                    type="submit"
                    disabled={uploading || !proofImageBase64}
                    className="px-5 py-2 bg-[#382A22] text-[#F7F3EC] text-xs font-bold uppercase tracking-wider rounded hover:bg-[#4E3B30] flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#E5B582]" />
                        <span>Mengirim Bukti...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5 text-[#E5B582]" />
                        <span>Kirim Bukti Pembayaran</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
