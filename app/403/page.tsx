'use client';
import Link from 'next/link';

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F8FF] p-4 text-center">
      <div className="max-w-md w-full">
        <h1 className="text-9xl font-bold text-[#800020] mb-4">403</h1>
        <h2 className="text-3xl font-serif text-gray-800 mb-6">Truy Cập Bị Từ Chối</h2>
        <p className="text-gray-600 mb-8">
          Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị viên hoặc quay lại trang chủ.
        </p>
        <Link 
          href="/" 
          className="inline-block bg-[#800020] text-[#D4AF37] px-8 py-3 rounded-full font-bold hover:bg-[#600018] transition-all shadow-lg"
        >
          QUAY LẠI TRANG CHỦ
        </Link>
      </div>
    </div>
  );
}
