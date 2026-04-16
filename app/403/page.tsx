'use client';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfaf1] p-6 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#800020]/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl animate-pulse" />
      
      <div className="max-w-2xl w-full text-center relative z-10">
        <div className="mb-12 inline-flex items-center justify-center w-32 h-32 rounded-full bg-white shadow-2xl border-4 border-[#800020]/10 text-[#800020] animate-bounce duration-[3000ms]">
          <ShieldAlert size={64} strokeWidth={1.5} />
        </div>
        
        <h1 className="text-[120px] font-serif font-black leading-none text-transparent bg-clip-text bg-gradient-to-b from-[#800020] to-[#600018] mb-4 select-none drop-shadow-sm">
          403
        </h1>
        
        <div className="space-y-4 mb-12">
            <h2 className="text-4xl md:text-5xl font-serif text-gray-900 italic font-bold">Quyền truy cập bị giới hạn</h2>
            <div className="h-1 w-24 bg-[#D4AF37] mx-auto rounded-full" />
            <p className="text-gray-500 max-w-md mx-auto leading-relaxed font-serif italic text-lg lg:text-xl">
              "Xin lỗi, tài khoản của bạn không có đủ thẩm quyền để bước vào gian hàng này. Vui lòng liên hệ Quản trị viên nếu đây là một nhầm lẫn."
            </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link 
            href="/" 
            className="group flex items-center gap-3 bg-[#800020] text-[#D4AF37] px-10 py-5 rounded-full font-bold text-sm tracking-[0.2em] shadow-[0_20px_40px_rgba(128,0,32,0.2)] hover:shadow-[0_25px_50px_rgba(128,0,32,0.3)] hover:-translate-y-1 active:scale-95 transition-all duration-500 uppercase"
          >
            <Home size={18} className="transition-transform group-hover:rotate-12" />
            Về trang chủ
          </Link>
          
          <button 
            onClick={() => window.history.back()}
            className="flex items-center gap-3 bg-white text-gray-600 px-10 py-5 rounded-full font-bold text-sm tracking-[0.2em] border border-gray-100 shadow-xl hover:bg-gray-50 hover:-translate-y-1 active:scale-95 transition-all duration-500 uppercase"
          >
            <ArrowLeft size={18} />
            Quay lại
          </button>
        </div>

        <div className="mt-20 pt-10 border-t border-gray-100/50">
            <p className="text-[10px] uppercase tracking-[0.4em] text-gray-400 font-bold">
                Ao Dai Boutique Management System • Signature Edition
            </p>
        </div>
      </div>
    </div>
  );
}

