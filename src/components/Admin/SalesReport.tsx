import React, { useState } from 'react';
import { DollarSign, ShoppingBag, Users, TrendingUp, Download, RefreshCw, AlertCircle, Award } from 'lucide-react';
import { SalesReport as ISalesReport } from '../../types/index.ts';
import { formatRupiah } from '../../utils/format.ts';
import { resetDemoDatabase } from '../../services/api.ts';

interface SalesReportProps {
  report: ISalesReport | null;
  onRefresh: () => void;
}

export const SalesReport: React.FC<SalesReportProps> = ({
  report,
  onRefresh,
}) => {
  const [resetting, setResetting] = useState(false);

  if (!report) {
    return (
      <div className="p-8 text-center text-stone-500 bg-white rounded-lg border border-[#EAE3DA]">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-stone-400 mb-2" />
        <p className="text-xs">Memuat data agregat laporan dari SQLite database...</p>
      </div>
    );
  }

  const handleExportCSV = () => {
    let csv = 'Laporan Penjualan House of Septia\n';
    csv += `Total Omset Lunas,${report.totalRevenue}\n`;
    csv += `Total Pesanan Lunas,${report.paidOrdersCount}\n`;
    csv += `Total Transaksi Masuk,${report.totalOrdersCount}\n`;
    csv += `Total Pelanggan Terdaftar,${report.totalCustomers}\n`;
    csv += `Total Produk Terjual (Pcs),${report.totalItemsSold}\n\n`;

    csv += 'Kategori,Total Omset,Jumlah Terjual (Pcs)\n';
    Object.entries(report.categoryStats).forEach(([cat, data]) => {
      csv += `"${cat}",${data.revenue},${data.itemsSold}\n`;
    });

    csv += '\nTop Produk Terlaris,Jumlah Terjual (Pcs),Total Revenue\n';
    report.topSellingProducts.forEach((p) => {
      csv += `"${p.name}",${p.qty},${p.revenue}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `house_of_septia_sales_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetDemo = async () => {
    if (!confirm('Reset database ke 12 produk awal dan sample pesanan demo?')) return;
    try {
      setResetting(true);
      await resetDemoDatabase();
      alert('Database berhasil direset!');
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Gagal mereset database');
    } finally {
      setResetting(false);
    }
  };

  const totalCatRevenue = Object.values(report.categoryStats).reduce((sum, c) => sum + c.revenue, 0) || 1;

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="bg-[#FCFAF6] p-4 rounded-lg border border-[#E2D7C7] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-editorial text-xl font-bold text-[#382A22]">
            Laporan Finansial &amp; Analisis Penjualan
          </h3>
          <p className="text-xs text-[#7E6E63]">
            Sumber tunggal kebenaran langsung dari database SQLite real-time
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-[#F7F3EC] border border-[#D6C7B2] rounded text-[#382A22] text-xs font-semibold hover:bg-[#EFE8DC] flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#A45A38]" />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={onRefresh}
            className="p-2 border border-[#D6C7B2] rounded text-[#645347] hover:bg-[#EFE8DC] cursor-pointer"
            title="Refresh Laporan"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Revenue */}
        <div className="bg-[#FCFAF6] p-5 rounded-lg border border-[#E2D7C7] shadow-xs flex items-center gap-4">
          <div className="p-3 bg-[#EFE8DC] rounded-lg text-[#A45A38] border border-[#D6C7B2]">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-[#7E6E63] uppercase font-bold tracking-wider block">
              Total Omset Lunas
            </span>
            <p className="font-editorial text-2xl font-bold text-[#382A22]">
              {formatRupiah(report.totalRevenue)}
            </p>
            <p className="text-[11px] text-[#5E694A] font-semibold mt-0.5">
              Dari {report.paidOrdersCount} order terverifikasi
            </p>
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div className="bg-[#FCFAF6] p-5 rounded-lg border border-[#E2D7C7] shadow-xs flex items-center gap-4">
          <div className="p-3 bg-[#EFE8DC] rounded-lg text-[#382A22] border border-[#D6C7B2]">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-[#7E6E63] uppercase font-bold tracking-wider block">
              Total Transaksi Masuk
            </span>
            <p className="font-editorial text-2xl font-bold text-[#382A22]">
              {report.totalOrdersCount} Pesanan
            </p>
            <p className="text-[11px] text-[#A45A38] font-semibold mt-0.5">
              {report.pendingApprovals} menunggu bukti disetujui
            </p>
          </div>
        </div>

        {/* Card 3: Items Sold */}
        <div className="bg-white p-5 rounded-lg border border-[#EAE3DA] shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-800 border border-emerald-200">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block">
              Produk Busana Terjual
            </span>
            <p className="font-editorial text-2xl font-bold text-[#2C2724]">
              {report.totalItemsSold} Pcs
            </p>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Rata-rata order: {formatRupiah(report.averageOrderValue)}
            </p>
          </div>
        </div>

        {/* Card 4: Customers */}
        <div className="bg-white p-5 rounded-lg border border-[#EAE3DA] shadow-xs flex items-center gap-4">
          <div className="p-3 bg-stone-100 rounded-lg text-[#8D6444] border border-stone-200">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block">
              Total Pelanggan
            </span>
            <p className="font-editorial text-2xl font-bold text-[#2C2724]">
              {report.totalCustomers} Pembeli
            </p>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Tercatat di tabel customers
            </p>
          </div>
        </div>
      </div>

      {/* Category Performance & Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-lg border border-[#EAE3DA] shadow-xs space-y-4">
          <h4 className="font-editorial text-lg font-bold text-[#2C2724]">
            Performa 3 Kategori Fashion Wanita
          </h4>
          <p className="text-xs text-stone-500">
            Kontribusi omset dan kuantitas produk berdasarkan kategori
          </p>

          <div className="space-y-4 pt-2">
            {Object.entries(report.categoryStats).map(([catName, stats]) => {
              const pct = Math.round((stats.revenue / totalCatRevenue) * 100);
              return (
                <div key={catName} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-[#2C2724]">{catName}</span>
                    <span className="font-bold text-[#B45309]">
                      {formatRupiah(stats.revenue)} ({stats.itemsSold} pcs)
                    </span>
                  </div>
                  <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#8D6444] h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-stone-400">
                    <span>Pangsa pasar penjualan</span>
                    <span>{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white p-6 rounded-lg border border-[#EAE3DA] shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#B45309]" />
            <h4 className="font-editorial text-lg font-bold text-[#2C2724]">
              Top 5 Produk Terlaris
            </h4>
          </div>
          <p className="text-xs text-stone-500">
            Peringkat produk terfavorit pelanggan House of Septia
          </p>

          <div className="divide-y divide-stone-100 pt-1">
            {report.topSellingProducts.length === 0 ? (
              <p className="text-xs text-stone-400 py-4 text-center">Belum ada data penjualan.</p>
            ) : (
              report.topSellingProducts.map((p, idx) => (
                <div key={p.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 flex items-center justify-center font-bold text-xs bg-[#FAF8F5] border border-stone-200 text-stone-700 rounded-full">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-bold text-[#2C2724]">{p.name}</p>
                      <span className="text-[11px] text-stone-500">Terjual {p.qty} pcs</span>
                    </div>
                  </div>
                  <span className="font-bold text-[#B45309]">
                    {formatRupiah(p.revenue)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Database Maintenance Card */}
      <div className="p-4 bg-[#FAF8F5] rounded-lg border border-[#EAE3DA] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-600">
        <div>
          <span className="font-bold text-[#2C2724]">Pemeliharaan Database SQLite:</span>
          <p className="text-[11px] text-stone-500">
            Database file tersimpan di <code className="bg-stone-200 px-1 rounded">data/house_of_septia.db</code> dengan mode WAL. Anda dapat mereset data demo kapan saja.
          </p>
        </div>
        <button
          onClick={handleResetDemo}
          disabled={resetting}
          className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded font-semibold text-xs whitespace-nowrap cursor-pointer"
        >
          {resetting ? 'Mereset...' : 'Reset Data Demo 12 Produk'}
        </button>
      </div>
    </div>
  );
};
