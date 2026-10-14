export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date) + ' WIB';
  } catch {
    return dateString;
  }
}

export function getPaymentStatusLabel(status: string): { label: string; colorClass: string } {
  switch (status) {
    case 'lunas':
      return { label: 'Lunas / Terverifikasi', colorClass: 'text-emerald-700 bg-emerald-50 border border-emerald-200' };
    case 'menunggu_verifikasi':
      return { label: 'Menunggu Verifikasi', colorClass: 'text-amber-800 bg-amber-50 border border-amber-200' };
    case 'menunggu_pembayaran':
      return { label: 'Menunggu Pembayaran', colorClass: 'text-sky-800 bg-sky-50 border border-sky-200' };
    case 'ditolak':
      return { label: 'Ditolak / Tidak Valid', colorClass: 'text-rose-800 bg-rose-50 border border-rose-200' };
    default:
      return { label: status, colorClass: 'text-stone-700 bg-stone-100' };
  }
}

export function getOrderStatusLabel(status: string): { label: string; colorClass: string } {
  switch (status) {
    case 'pending':
      return { label: 'Pending', colorClass: 'text-stone-700 bg-stone-100' };
    case 'diproses':
      return { label: 'Diproses / Dikemas', colorClass: 'text-amber-800 bg-amber-50 border border-amber-200' };
    case 'dikirim':
      return { label: 'Dalam Pengiriman', colorClass: 'text-blue-800 bg-blue-50 border border-blue-200' };
    case 'selesai':
      return { label: 'Pesanan Selesai', colorClass: 'text-emerald-800 bg-emerald-50 border border-emerald-200' };
    case 'dibatalkan':
      return { label: 'Dibatalkan', colorClass: 'text-rose-800 bg-rose-50 border border-rose-200' };
    default:
      return { label: status, colorClass: 'text-stone-700 bg-stone-100' };
  }
}
