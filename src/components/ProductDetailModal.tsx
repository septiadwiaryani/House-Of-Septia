import React, { useState } from 'react';
import { X, ShoppingBag, Check, Shield, Truck, RotateCcw } from 'lucide-react';
import { Product } from '../types/index.ts';
import { formatRupiah } from '../utils/format.ts';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCartWithSize: (product: Product, size: string, color: string, qty: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCartWithSize,
}) => {
  if (!product) return null;

  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || 'M');
  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0] || 'Standard');
  const [quantity, setQuantity] = useState<number>(1);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const isOutOfStock = product.stock <= 0;

  const handleAdd = () => {
    onAddToCartWithSize(product, selectedSize, selectedColor, quantity);
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#FCFAF6] rounded-xl shadow-2xl border border-[#E2D7C7] overflow-hidden my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-[#FCFAF6]/90 hover:bg-white text-[#382A22] rounded-full shadow-sm cursor-pointer transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-[3/4] md:aspect-auto bg-[#EFE8DC]">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover object-top"
            />
          </div>

          {/* Details */}
          <div className="p-6 md:p-8 flex flex-col justify-between space-y-6">
            <div>
              {/* Category & Code */}
              <div className="flex items-center gap-2 text-xs text-[#7E6E63] tracking-wider">
                <span>{product.category}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-[11px]">{product.id}</span>
              </div>

              <h2 className="font-editorial text-2xl md:text-3xl font-bold text-[#382A22] mt-1.5 leading-snug">
                {product.name}
              </h2>

              <p className="text-xl font-bold text-[#A45A38] mt-2">
                {formatRupiah(product.price)}
              </p>

              <p className="text-xs text-[#645347] mt-3 leading-relaxed">
                {product.description}
              </p>

              {/* Material Spec */}
              <div className="mt-4 p-3 bg-[#EFE8DC]/60 rounded border border-[#E2D7C7] text-xs">
                <span className="font-semibold text-[#382A22]">Material &amp; Kain: </span>
                <span className="text-[#645347]">{product.material}</span>
              </div>

              {/* Size Selector */}
              <div className="mt-5">
                <label className="block text-xs font-semibold text-[#382A22] uppercase tracking-wider mb-2">
                  Pilih Ukuran (Size)
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded border transition-all cursor-pointer ${
                        selectedSize === size
                          ? 'bg-[#382A22] text-[#F7F3EC] border-[#382A22]'
                          : 'bg-white text-[#645347] border-[#D6C7B2] hover:border-[#A45A38]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selector */}
              <div className="mt-4">
                <label className="block text-xs font-semibold text-[#382A22] uppercase tracking-wider mb-2">
                  Pilihan Warna
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`px-3 py-1.5 text-xs font-medium rounded border transition-all cursor-pointer ${
                        selectedColor === color
                          ? 'bg-[#A45A38] text-white border-[#A45A38]'
                          : 'bg-white text-[#645347] border-[#D6C7B2] hover:border-[#A45A38]'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="mt-4 flex items-center gap-4">
                <label className="text-xs font-semibold text-[#382A22] uppercase tracking-wider">
                  Jumlah:
                </label>
                <div className="flex items-center border border-[#D6C7B2] rounded bg-white">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 text-stone-600 hover:bg-[#EFE8DC] cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-xs font-bold text-[#382A22]">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    className="px-3 py-1 text-stone-600 hover:bg-[#EFE8DC] disabled:opacity-40 cursor-pointer"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-[#7E6E63]">
                  Tersisa {product.stock} pcs di database
                </span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="space-y-3 pt-3 border-t border-[#E2D7C7]">
              <button
                type="button"
                onClick={handleAdd}
                disabled={isOutOfStock || addedSuccess}
                className={`w-full py-3 px-4 rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  addedSuccess
                    ? 'bg-[#5E694A] text-white'
                    : isOutOfStock
                    ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                    : 'bg-[#382A22] text-[#F7F3EC] hover:bg-[#4E3B30] shadow-md'
                }`}
              >
                {addedSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Berhasil Masuk Keranjang!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-[#E5B582]" />
                    <span>{isOutOfStock ? 'Stok Habis' : 'Tambahkan ke Keranjang'}</span>
                  </>
                )}
              </button>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-[10px] text-[#7E6E63] text-center">
                <div className="flex flex-col items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-[#A45A38]" />
                  <span>100% Jahitan Butik</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-[#A45A38]" />
                  <span>Kirim Cepat Aman</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <RotateCcw className="w-3.5 h-3.5 text-[#A45A38]" />
                  <span>Garansi Ukuran Pas</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
