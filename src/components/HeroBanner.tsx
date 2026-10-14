import React from 'react';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

interface HeroBannerProps {
  onExplore: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onExplore }) => {
  return (
    <section className="relative overflow-hidden bg-[#EFE8DC] border-b border-[#E2D7C7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-[#A45A38]">
              <Sparkles className="w-3.5 h-3.5 text-[#BD6B46]" />
              <span>Koleksi Eksklusif Wanita 2026</span>
            </div>

            <h2 className="font-editorial text-4xl sm:text-5xl lg:text-6xl text-[#382A22] leading-[1.15] font-normal">
              Kemewahan Siluet &amp; <br />
              <span className="italic font-serif text-[#A45A38]">Elegansi Modern</span>
            </h2>

            <p className="text-[#645347] text-sm sm:text-base max-w-xl leading-relaxed">
              Selamat datang di <strong>House of Septia</strong>. Menghadirkan 12 rancangan busana wanita pilihan 
              dalam 3 kategori utama: Dress &amp; Kebaya Modern, Atasan &amp; Blouse Chic, serta Bawahan &amp; Rok Kasual. 
              Ditenun dari sutra, organza, poplin, dan linen premium bersertifikasi keaslian.
            </p>

            {/* Feature Highlights - Zero Pill, Earth Tone */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 pt-1 text-xs text-[#645347] font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#A45A38]" />
                <span>12 Koleksi Kurasi Desainer</span>
              </span>
              <span aria-hidden="true" className="text-[#D6C7B2]">/</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#5E694A]" />
                <span>Real-Time Stock Synchronized</span>
              </span>
              <span aria-hidden="true" className="text-[#D6C7B2]">/</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#A45A38]" />
                <span>Verifikasi Bukti Transfer Cepat</span>
              </span>
            </div>

            <div className="pt-3 flex items-center gap-4">
              <button
                onClick={onExplore}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#382A22] text-[#F7F3EC] text-xs font-semibold tracking-wider uppercase rounded hover:bg-[#4E3B30] transition-all shadow-md group cursor-pointer"
              >
                <span>Lihat 12 Koleksi Busana</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#E5B582]" />
              </button>
            </div>
          </div>

          {/* Right Visual Collage */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="aspect-[4/5] rounded-xl overflow-hidden shadow-xl border-4 border-[#FCFAF6] bg-[#E2D7C7]">
                <img
                  src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=900&auto=format&fit=crop&q=85"
                  alt="House of Septia Signature Dress"
                  className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700"
                />
              </div>

              {/* Floating aesthetic label */}
              <div className="absolute -bottom-4 -left-4 sm:left-4 bg-[#FCFAF6]/95 backdrop-blur-md p-4 rounded-lg shadow-lg border border-[#E2D7C7] max-w-xs">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-10 bg-[#A45A38] rounded-full" />
                  <div>
                    <p className="text-[10px] tracking-wider uppercase font-semibold text-[#7E6E63]">Koleksi Terfavorit</p>
                    <p className="text-xs font-bold text-[#382A22]">Septia Signature Kebaya &amp; Dress</p>
                    <p className="text-[11px] text-[#A45A38] font-medium">Brocade &amp; Organza Premium</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
