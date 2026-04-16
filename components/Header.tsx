'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

import { useSession } from '@/hooks/useSession';

interface User {
  username: string;
  role: string;
}

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { itemCount } = useCart();
  const { sid, sessionUrl } = useSession();

  useEffect(() => {
    // Check session on mount
    const checkSession = async () => {
      try {
        const url = sid ? `/api/auth/session?sid=${sid}` : '/api/auth/session';
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (err) {
        console.error('Session check failed');
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, [sid]);

  const handleLogout = async () => {
    await fetch(`/api/auth/logout${sid ? `?sid=${sid}` : ''}`, { method: 'POST' });
    setUser(null);
    window.location.href = sessionUrl('/login');
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        <Link href={sessionUrl("/")} className="text-2xl font-serif font-bold text-[#800020] tracking-widest">
          ÁO DÀI SHOP
        </Link>

        <nav className="hidden md:flex items-center space-x-8">
          <Link href={sessionUrl("/")} className="text-gray-700 hover:text-[#800020] transition-colors">Trang Chủ</Link>
          <Link href={sessionUrl("/products")} className="text-gray-700 hover:text-[#800020] transition-colors">Sản Phẩm</Link>
          
          {user && (user.role === 'admin' || user.role === 'manager') && (
            <Link href={sessionUrl("/admin")} className="text-white bg-[#D4AF37] px-4 py-2 rounded-lg font-semibold hover:bg-[#800020] transition-all">
              TRANG QUẢN TRỊ
            </Link>
          )}
        </nav>

        <div className="flex items-center space-x-6">
          <Link href={sessionUrl("/cart")} className="relative group p-2">
            <span className="text-2xl">🛒</span>
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#800020] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white group-hover:scale-110 transition-transform">
                {itemCount}
              </span>
            )}
          </Link>

          {!loading && (
            user ? (
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-[#800020] text-[#D4AF37] flex items-center justify-center font-bold text-lg border-2 border-[#D4AF37]">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-sm font-semibold text-gray-800">{user.username}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 border-l pl-6">
                  <Link href={sessionUrl("/profile")} className="text-sm text-gray-600 hover:text-[#800020]">Thông tin</Link>
                  <Link href={sessionUrl("/orders/history")} className="text-sm text-gray-600 hover:text-[#800020]">Lịch sử</Link>
                  <button onClick={handleLogout} className="text-sm font-bold text-red-600 hover:underline">ĐĂNG XUẤT</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href={sessionUrl("/login")} className="text-gray-700 font-semibold hover:text-[#800020]">Đăng nhập</Link>
                <Link href={sessionUrl("/register")} className="bg-[#800020] text-[#D4AF37] px-6 py-2 rounded-full font-bold hover:shadow-lg transition-all">
                  ĐĂNG KÝ
                </Link>
              </div>
            )
          )}
        </div>
      </div>
    </header>
  );
}
