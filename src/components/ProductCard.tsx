import React from 'react';
import { Eye, ShoppingBag, AlertCircle } from 'lucide-react';
import { Product } from '../types/index.ts';
import { formatRupiah } from '../utils/format.ts';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onQuickView,
  onAddToCart,
}) => {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <article className="group bg-[#FCFAF6] rounded-lg border border-[#E2D7C7] overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col h-full">
      {/* Image Container */}
      <div className="relative aspect-[3/4] bg-[#EFE8DC] overflow-hidden">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Quick View Button Hover Overlay */}
        <div className="absolute inset-0 bg-[#382A22]/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
          <button
            onClick={() => onQuickView(product)}
            className="px-3.5 py-2 bg-[#FCFAF6]/95 text-[#382A22] text-xs font-semibold uppercase tracking-wider rounded shadow hover:bg-white flex items-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-[#A45A38]" />
            <span>Lihat Detail</span>
          </button>
        </div>

        {/* Stock Badge Overlay */}
        {isOutOfStock ? (
          <div className="absolute top-3 left-3 bg-[#382A22]/90 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded">
            Stok Habis
          </div>
        ) : isLowStock ? (
          <div className="absolute top-3 left-3 bg-[#A45A38]/90 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-[#E5B582]" />
            <span>Sisa {product.stock} pcs</span>
          </div>
        ) : null}
      </div>

      {/* Product Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Category & Material - Clean Unboxed Metadata */}
          <div className="flex items-center gap-1.5 text-[11px] text-[#7E6E63] tracking-wider">
            <span>{product.category}</span>
            <span aria-hidden="true">·</span>
            <span className="truncate max-w-[130px]">{product.material}</span>
          </div>

          <h3 className="font-editorial text-lg font-bold text-[#382A22] group-hover:text-[#A45A38] transition-colors mt-1 line-clamp-1">
            {product.name}
          </h3>

          <p className="text-xs text-[#645347] line-clamp-2 mt-1 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Bottom Section: Price & Action */}
        <div className="pt-2 border-t border-[#EFE8DC]">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-[10px] text-[#7E6E63] uppercase tracking-wider block">Harga Resmi</span>
              <span className="text-base font-bold text-[#382A22]">
                {formatRupiah(product.price)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#7E6E63] block">Stok Real DB</span>
              <span className={`text-xs font-semibold ${isOutOfStock ? 'text-rose-700' : 'text-[#5E694A]'}`}>
                {isOutOfStock ? '0 Tersedia' : `${product.stock} pcs`}
              </span>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={() => onAddToCart(product)}
            disabled={isOutOfStock}
            className={`w-full py-2.5 px-3 rounded text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              isOutOfStock
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                : 'bg-[#382A22] text-[#F7F3EC] hover:bg-[#A45A38] shadow-xs'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#E5B582]" />
            <span>{isOutOfStock ? 'Stok Habis' : 'Tambah ke Keranjang'}</span>
          </button>
        </div>
      </div>
    </article>
  );
};
