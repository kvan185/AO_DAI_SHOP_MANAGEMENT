import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Star, Heart, Award, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Câu chuyện thương hiệu - Shop Áo Dài Cao Cấp',
  description: 'Hành trình tôn vinh vẻ đẹp truyền thống Việt Nam qua từng đường kim mũi chỉ.',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="/ao_dai_artisan_1776791220088.png" 
            alt="Nghệ nhân Áo Dài" 
            className="w-full h-full object-cover transform scale-105 animate-slow-zoom"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
            <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-left-10 duration-1000">
                <span className="text-[#D4AF37] text-xs font-black uppercase tracking-[0.5em]">Di sản Á Đông</span>
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-white leading-none italic">
                    Nét đẹp vĩnh cửu <br />
                    <span className="text-[#D4AF37] not-italic">trong từng hơi thở</span>
                </h1>
                <p className="text-lg text-gray-300 font-light leading-relaxed max-w-lg">
                    Chúng tôi không chỉ may áo, chúng tôi dệt nên những câu chuyện về tâm hồn Việt, 
                    nơi truyền thống và hiện đại giao thoa trong sự sang trọng tuyệt đối.
                </p>
            </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-12">
                <div className="space-y-6">
                    <h2 className="text-4xl md:text-5xl font-serif italic text-[#800020]">Triết lý thiết kế</h2>
                    <div className="w-20 h-1 bg-[#D4AF37]" />
                </div>
                <p className="text-xl text-gray-600 leading-relaxed font-light">
                    Mỗi bộ Áo Dài tại cửa hàng là kết quả của hàng trăm giờ làm việc tỉ mỉ. 
                    Từ khâu chọn lụa tơ tằm Bảo Lộc thượng hạng đến kỹ thuật thêu tay thủ công tinh xảo, 
                    mọi chi tiết đều hướng đến sự hoàn mỹ.
                </p>
                <div className="grid grid-cols-2 gap-10 pt-6">
                    <div className="space-y-4">
                        <div className="w-12 h-12 bg-[#800020]/5 rounded-2xl flex items-center justify-center text-[#800020]">
                            <Award size={24} />
                        </div>
                        <h3 className="font-black text-[10px] uppercase tracking-widest text-gray-400">Chất lượng</h3>
                        <p className="text-sm text-gray-500">Cam kết sử dụng chất liệu 100% tự nhiên cao cấp nhất.</p>
                    </div>
                    <div className="space-y-4">
                        <div className="w-12 h-12 bg-[#800020]/5 rounded-2xl flex items-center justify-center text-[#800020]">
                            <Sparkles size={24} />
                        </div>
                        <h3 className="font-black text-[10px] uppercase tracking-widest text-gray-400">Độc bản</h3>
                        <p className="text-sm text-gray-500">Mỗi thiết kế là một tác phẩm duy nhất dành riêng cho bạn.</p>
                    </div>
                </div>
            </div>
            <div className="relative group">
                <div className="absolute -inset-4 border border-[#D4AF37]/20 rounded-[3rem] group-hover:inset-0 transition-all duration-700" />
                <img 
                    src="https://images.unsplash.com/photo-1591123120675-6f7f1aae0e5b?auto=format&fit=crop&q=80&w=1200" 
                    alt="Process" 
                    className="rounded-[2.5rem] shadow-2xl grayscale group-hover:grayscale-0 transition-all duration-1000"
                />
            </div>
        </div>
      </section>

      {/* Values Banner */}
      <section className="bg-[#800020] py-24">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
            <div className="space-y-4">
                <span className="text-5xl font-serif text-[#D4AF37] block">15+</span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">Năm kinh nghiệm</span>
            </div>
            <div className="space-y-4">
                <span className="text-5xl font-serif text-[#D4AF37] block">5000+</span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">Khách hàng hài lòng</span>
            </div>
            <div className="space-y-4">
                <span className="text-5xl font-serif text-[#D4AF37] block">100%</span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">Thủ công mỹ nghệ</span>
            </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 bg-[#F9F6F0] text-center px-6">
        <h2 className="text-4xl md:text-6xl font-serif italic text-gray-900 mb-12">Khám phá thế giới Áo Dài của chúng tôi</h2>
        <Link href="/" className="inline-block px-12 py-5 bg-[#800020] text-[#D4AF37] rounded-full font-black uppercase tracking-widest hover:scale-110 active:scale-95 transition-all shadow-2xl">
            Săn ngay tuyệt phẩm
        </Link>
      </section>
    </main>
  );
}
