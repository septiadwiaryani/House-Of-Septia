import React, { useState } from 'react';
import { Search, RefreshCw, Users, Mail, Phone, MapPin, ShoppingBag } from 'lucide-react';
import { Customer } from '../../types/index.ts';
import { formatRupiah, formatDate } from '../../utils/format.ts';

interface CustomerListProps {
  customers: Customer[];
  onRefresh: () => void;
}

export const CustomerList: React.FC<CustomerListProps> = ({
  customers,
  onRefresh,
}) => {
  const [search, setSearch] = useState('');

  const filtered = customers.filter((c) => {
    return (
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-[#FCFAF6] p-4 rounded-lg border border-[#E2D7C7] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
          <input
            type="text"
            placeholder="Cari nama pelanggan, email, HP, atau kota..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F7F3EC] border border-[#D6C7B2] rounded focus:outline-none focus:ring-1 focus:ring-[#A45A38] text-[#382A22]"
          />
        </div>

        <button
          onClick={onRefresh}
          className="p-2 border border-[#D6C7B2] rounded text-[#645347] hover:bg-[#EFE8DC] cursor-pointer self-end sm:self-auto"
          title="Refresh data pelanggan"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Customer Table */}
      <div className="bg-[#FCFAF6] rounded-lg border border-[#E2D7C7] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#EAE3DA] text-stone-600 uppercase tracking-wider text-[11px] font-semibold">
                <th className="py-3 px-4">Nama Pelanggan &amp; ID</th>
                <th className="py-3 px-4">Kontak (Email / HP)</th>
                <th className="py-3 px-4">Lokasi &amp; Alamat</th>
                <th className="py-3 px-4 text-center">Total Order</th>
                <th className="py-3 px-4 text-right">Total Transaksi (LTV)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-stone-500">
                    Tidak ada data pelanggan yang sesuai.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-editorial font-bold text-sm text-[#2C2724]">{c.name}</p>
                      <span className="font-mono text-[10px] text-stone-400">{c.id}</span>
                    </td>

                    <td className="py-3 px-4 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-stone-700">
                        <Mail className="w-3 h-3 text-stone-400" />
                        <span>{c.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-stone-600">
                        <Phone className="w-3 h-3 text-stone-400" />
                        <span>{c.phone}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-start gap-1 text-stone-600">
                        <MapPin className="w-3.5 h-3.5 text-stone-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-stone-800">{c.city}</span>
                          <p className="text-[11px] text-stone-500 line-clamp-1 max-w-xs">{c.address}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-stone-100 text-stone-800 rounded font-semibold text-xs">
                        <ShoppingBag className="w-3 h-3 text-[#8D6444]" />
                        <span>{c.total_orders} kali</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <span className="font-bold text-sm text-[#B45309]">
                        {formatRupiah(c.total_spent)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
