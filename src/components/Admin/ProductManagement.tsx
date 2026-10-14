import React, { useState } from 'react';
import { Plus, Edit3, Trash2, AlertCircle, RefreshCw, Check, X, Search, Image as ImageIcon } from 'lucide-react';
import { Product } from '../../types/index.ts';
import { formatRupiah } from '../../utils/format.ts';
import { createProduct, updateProduct, deleteProduct } from '../../services/api.ts';

interface ProductManagementProps {
  products: Product[];
  onRefresh: () => void;
}

export const ProductManagement: React.FC<ProductManagementProps> = ({
  products,
  onRefresh,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [quickStockLoadingId, setQuickStockLoadingId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; error?: boolean } | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Dress & Kebaya Modern');
  const [formPrice, setFormPrice] = useState<number>(350000);
  const [formStock, setFormStock] = useState<number>(20);
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formMaterial, setFormMaterial] = useState('Katun Poplin Silky');
  const [formSizes, setFormSizes] = useState('S, M, L, XL');
  const [formColors, setFormColors] = useState('Sage Green, Broken White, Terracotta');

  const categories = [
    'Semua',
    'Dress & Kebaya Modern',
    'Atasan & Blouse Chic',
    'Bawahan & Rok Kasual',
  ];

  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCategory === 'Semua' || p.category === selectedCategory;
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.material.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCategory('Dress & Kebaya Modern');
    setFormPrice(350000);
    setFormStock(20);
    setFormDescription('Busana wanita elegan dengan siluet anggun dan jahitan butik presisi.');
    setFormImageUrl('https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80');
    setFormMaterial('Katun Silky Jacquard');
    setFormSizes('S, M, L, XL');
    setFormColors('Sage, Cream, Mocha');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormCategory(p.category);
    setFormPrice(p.price);
    setFormStock(p.stock);
    setFormDescription(p.description);
    setFormImageUrl(p.image_url);
    setFormMaterial(p.material);
    setFormSizes(p.sizes.join(', '));
    setFormColors(p.colors.join(', '));
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formCategory) return;

    try {
      setLoading(true);
      const parsedSizes = formSizes.split(',').map((s) => s.trim()).filter(Boolean);
      const parsedColors = formColors.split(',').map((c) => c.trim()).filter(Boolean);

      const payload = {
        name: formName,
        category: formCategory,
        price: Number(formPrice),
        stock: Number(formStock),
        description: formDescription,
        image_url: formImageUrl,
        material: formMaterial,
        sizes: parsedSizes,
        colors: parsedColors,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
        setFeedbackMsg({ text: `Produk "${formName}" berhasil diperbarui di database.` });
      } else {
        await createProduct(payload);
        setFeedbackMsg({ text: `Produk baru "${formName}" berhasil ditambahkan ke database.` });
      }

      setIsModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setFeedbackMsg({ text: err.message || 'Gagal menyimpan produk', error: true });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickStock = async (p: Product, delta: number) => {
    const newStock = Math.max(0, p.stock + delta);
    try {
      setQuickStockLoadingId(p.id);
      await updateProduct(p.id, { stock: newStock });
      onRefresh();
    } catch (err: any) {
      setFeedbackMsg({ text: 'Gagal memperbarui stok', error: true });
    } finally {
      setQuickStockLoadingId(null);
    }
  };

  const handleDelete = async (p: Product) => {
    if (!confirm(`Yakin ingin menghapus produk "${p.name}" (${p.id}) dari database?`)) return;

    try {
      await deleteProduct(p.id);
      setFeedbackMsg({ text: `Produk "${p.name}" berhasil dihapus dari database.` });
      onRefresh();
    } catch (err: any) {
      setFeedbackMsg({ text: err.message || 'Gagal menghapus produk', error: true });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-lg border border-[#EAE3DA]">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
            <input
              type="text"
              placeholder="Cari nama produk, SKU, atau bahan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F7F3EC] border border-[#D6C7B2] rounded focus:outline-none focus:ring-1 focus:ring-[#A45A38] text-[#382A22]"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 text-xs bg-[#F7F3EC] border border-[#D6C7B2] rounded focus:outline-none focus:ring-1 focus:ring-[#A45A38] text-[#382A22]"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="p-2 border border-[#D6C7B2] rounded text-[#645347] hover:bg-[#EFE8DC] cursor-pointer"
            title="Refresh database produk"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-[#382A22] text-[#F7F3EC] text-xs font-bold uppercase tracking-wider rounded flex items-center gap-1.5 hover:bg-[#4E3B30] cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Produk Baru</span>
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div
          className={`p-3 rounded-md text-xs flex items-center justify-between ${
            feedbackMsg.error
              ? 'bg-rose-50 text-rose-800 border border-rose-200'
              : 'bg-[#EFE8DC] text-[#382A22] border border-[#D6C7B2]'
          }`}
        >
          <span>{feedbackMsg.text}</span>
          <button onClick={() => setFeedbackMsg(null)} className="p-1 text-stone-400 hover:text-stone-700">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-[#FCFAF6] rounded-lg border border-[#E2D7C7] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F7F3EC] border-b border-[#E2D7C7] text-[#645347] uppercase tracking-wider text-[11px] font-semibold">
                <th className="py-3 px-4">Produk &amp; Gambar</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Harga Satuan</th>
                <th className="py-3 px-4">Stok Gudang</th>
                <th className="py-3 px-4">Bahan / Material</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE8DC]">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#7E6E63]">
                    Tidak ada produk yang sesuai dengan pencarian atau kategori.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isOutOfStock = p.stock <= 0;
                  const isLowStock = p.stock > 0 && p.stock <= 5;
                  const isUpdatingStock = quickStockLoadingId === p.id;

                  return (
                    <tr key={p.id} className="hover:bg-[#F7F3EC]/70 transition-colors">
                      {/* Product Thumbnail & Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image_url}
                            alt={p.name}
                            className="w-12 h-14 object-cover object-top rounded border border-[#E2D7C7] bg-[#EFE8DC] flex-shrink-0"
                          />
                          <div>
                            <span className="font-mono text-[10px] text-stone-400">{p.id}</span>
                            <p className="font-editorial font-bold text-sm text-[#382A22] leading-tight">
                              {p.name}
                            </p>
                            <span className="text-[11px] text-[#7E6E63] line-clamp-1 max-w-xs">
                              {p.description}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 text-stone-700 font-medium">
                        {p.category}
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 font-bold text-[#B45309]">
                        {formatRupiah(p.price)}
                      </td>

                      {/* Stock with quick buttons */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center border border-[#D8CABE] rounded bg-[#FAF8F5]">
                            <button
                              type="button"
                              onClick={() => handleQuickStock(p, -1)}
                              disabled={isUpdatingStock || p.stock <= 0}
                              className="px-2 py-0.5 text-stone-600 hover:bg-stone-200 disabled:opacity-40 cursor-pointer font-bold"
                            >
                              -
                            </button>
                            <span className="px-2.5 py-0.5 font-bold font-mono text-stone-900 text-xs min-w-8 text-center">
                              {p.stock}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQuickStock(p, 1)}
                              disabled={isUpdatingStock}
                              className="px-2 py-0.5 text-stone-600 hover:bg-stone-200 cursor-pointer font-bold"
                            >
                              +
                            </button>
                          </div>

                          {isOutOfStock ? (
                            <span className="text-[10px] text-rose-700 font-bold bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                              Habis
                            </span>
                          ) : isLowStock ? (
                            <span className="text-[10px] text-amber-800 font-bold bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                              <AlertCircle className="w-3 h-3" />
                              <span>Menipis</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                              Aman
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Material */}
                      <td className="py-3 px-4 text-stone-600 text-[11px]">
                        {p.material}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 text-stone-600 hover:text-stone-900 border border-stone-200 rounded hover:bg-stone-100 cursor-pointer"
                            title="Edit data produk"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(p)}
                            className="p-1.5 text-rose-600 hover:text-rose-800 border border-rose-200 rounded hover:bg-rose-50 cursor-pointer"
                            title="Hapus produk dari database"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl bg-[#FAF8F5] rounded-xl shadow-2xl border border-[#EAE3DA] overflow-hidden my-6">
            <div className="p-5 bg-white border-b border-[#EAE3DA] flex items-center justify-between">
              <h3 className="font-editorial text-xl font-bold text-[#2C2724]">
                {editingProduct ? 'Edit Data Produk & Stok' : 'Tambah Produk Fashion Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Nama Produk Busana *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#D8CABE] rounded focus:outline-none focus:ring-1 focus:ring-[#8D6444]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Kategori Fashion *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#D8CABE] rounded focus:outline-none focus:ring-1 focus:ring-[#8D6444]"
                  >
                    <option value="Dress & Kebaya Modern">Dress &amp; Kebaya Modern</option>
                    <option value="Atasan & Blouse Chic">Atasan &amp; Blouse Chic</option>
                    <option value="Bawahan & Rok Kasual">Bawahan &amp; Rok Kasual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Bahan / Material Kain *
                  </label>
                  <input
                    type="text"
                    required
                    value={formMaterial}
                    onChange={(e) => setFormMaterial(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#D8CABE] rounded focus:outline-none focus:ring-1 focus:ring-[#8D6444]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Harga Jual (IDR) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={1000}
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#D8CABE] rounded focus:outline-none focus:ring-1 focus:ring-[#8D6444]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Stok Gudang (Pcs) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formStock}
                    onChange={(e) => setFormStock(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#D8CABE] rounded focus:outline-none focus:ring-1 focus:ring-[#8D6444]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  URL Foto Produk *
                </label>
                <input
                  type="url"
                  required
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#D8CABE] rounded focus:outline-none focus:ring-1 focus:ring-[#8D6444]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Pilihan Ukuran (Pisahkan Koma)
                  </label>
                  <input
                    type="text"
                    value={formSizes}
                    onChange={(e) => setFormSizes(e.target.value)}
                    placeholder="S, M, L, XL"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#D8CABE] rounded focus:outline-none focus:ring-1 focus:ring-[#8D6444]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Pilihan Warna (Pisahkan Koma)
                  </label>
                  <input
                    type="text"
                    value={formColors}
                    onChange={(e) => setFormColors(e.target.value)}
                    placeholder="Sage Green, Rose Gold, Oatmeal"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#D8CABE] rounded focus:outline-none focus:ring-1 focus:ring-[#8D6444]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Deskripsi Lengkap Busana
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#D8CABE] rounded focus:outline-none focus:ring-1 focus:ring-[#8D6444]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#EAE3DA]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#D8CABE] rounded text-xs font-semibold text-stone-700 hover:bg-stone-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-[#2C2724] text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-[#403834] cursor-pointer shadow-sm disabled:opacity-60"
                >
                  {loading ? 'Menyimpan ke DB...' : editingProduct ? 'Simpan Perubahan' : 'Tambah ke Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
