'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useSession } from '@/hooks/useSession';
import { ChevronDown, ShoppingBag, User as UserIcon, LogOut, Menu, X } from 'lucide-react';

interface User {
  username: string;
  role: string;
}

interface Category {
  id: number;
  name: string;
}

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { itemCount } = useCart();
  const { sid, sessionUrl } = useSession();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sessionUrl = sid ? `/api/auth/session?sid=${sid}` : '/api/auth/session';
        const [sessionRes, categoriesRes] = await Promise.all([
          fetch(sessionUrl),
          fetch('/api/categories')
        ]);

        if (sessionRes.ok) {
          const data = await sessionRes.json();
          setUser(data.user);
        }

        if (categoriesRes.ok) {
          const data = await categoriesRes.json();
          setCategories(data.categories || []);
        }
      } catch (err) {
        console.error('Fetch header data failed');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [sid]);

  const handleLogout = async () => {
    await fetch(`/api/auth/logout${sid ? `?sid=${sid}` : ''}`, { method: 'POST' });
    setUser(null);
    window.location.href = sessionUrl('/login');
  };

  return (
    <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-[100] border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
        {/* Logo */}
        <Link href={sessionUrl("/")} className="relative z-10">
          <span className="text-3xl font-serif font-black text-[#800020] tracking-tighter italic">
            ÁO DÀI <span className="text-[#D4AF37] not-italic ml-2">SHOP</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-12">
          <Link href={sessionUrl("/")} className="text-[11px] font-black uppercase tracking-[0.3em] text-[#800020] hover:opacity-70 transition-opacity">
            Trang Chủ
          </Link>

          {/* Categories Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.3em] text-gray-800 group-hover:text-[#800020] transition-colors">
              Danh mục <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-500" />
            </button>
            <div className="absolute top-full -left-10 pt-6 opacity-0 translate-y-4 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-500">
              <div className="w-64 bg-white rounded-[2rem] shadow-[0_30px_100px_rgba(0,0,0,0.1)] border border-gray-50 overflow-hidden p-4">
                <div className="grid gap-2">
                  {categories.map((cat) => (
                    <Link 
                      key={cat.id} 
                      href={sessionUrl(`/products?category=${cat.id}`)}
                      className="px-6 py-4 rounded-2xl text-xs font-bold text-gray-600 hover:bg-[#800020]/5 hover:text-[#800020] transition-all flex items-center justify-between group/item"
                    >
                      {cat.name}
                      <span className="w-1 h-1 bg-[#D4AF37] rounded-full scale-0 group-hover/item:scale-150 transition-transform" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Link href={sessionUrl("/about")} className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-800 hover:text-[#800020] transition-colors">
            Giới thiệu
          </Link>
          <Link href={sessionUrl("/contact")} className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-800 hover:text-[#800020] transition-colors">
            Liên hệ
          </Link>

          {user && (user.role === 'admin' || user.role === 'manager') && (
            <Link href={sessionUrl("/admin")} className="px-6 py-2.5 bg-[#800020] text-[#D4AF37] rounded-full font-black text-[9px] uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all">
              Bảng quản trị
            </Link>
          )}
        </nav>

        {/* User & Actions */}
        <div className="flex items-center space-x-6">
          <Link href={sessionUrl("/cart")} className="p-3 bg-gray-50 rounded-full text-[#800020] hover:bg-[#800020] hover:text-white transition-all relative">
            <ShoppingBag size={20} />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#D4AF37] text-[#800020] text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in">
                {itemCount}
              </span>
            )}
          </Link>

          {!loading && (
            user ? (
              <div className="flex items-center gap-4 pl-4 border-l border-gray-100">
                <Link href={sessionUrl("/profile")} className="w-11 h-11 rounded-full bg-gradient-to-br from-[#800020] to-[#600018] text-[#D4AF37] flex items-center justify-center font-black text-sm shadow-xl hover:rotate-6 transition-transform">
                  {user.username.charAt(0).toUpperCase()}
                </Link>
                <div className="hidden xl:block">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-800">{user.username}</p>
                  <button onClick={handleLogout} className="text-[8px] font-bold uppercase text-red-500 hover:underline tracking-tighter">Đăng xuất</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href={sessionUrl("/login")} className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-[#800020] hover:opacity-70 transition-opacity">
                  Đăng nhập
                </Link>
                <Link href={sessionUrl("/register")} className="hidden md:block px-8 py-3 bg-[#D4AF37] text-[#800020] rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 transition-all">
                  Tham gia
                </Link>
              </div>
            )
          )}

          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden p-3 text-gray-800"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-100 animate-in slide-in-from-top duration-300">
          <div className="p-6 space-y-4">
            {categories.map((cat) => (
              <Link 
                key={cat.id} 
                href={sessionUrl(`/products?category=${cat.id}`)}
                className="block px-4 py-3 rounded-xl text-sm font-bold text-gray-600 active:bg-gray-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {cat.name}
              </Link>
            ))}
            <hr />
            <Link href={sessionUrl("/about")} className="block px-4 py-3 text-sm font-bold text-gray-800">Giới thiệu</Link>
            <Link href={sessionUrl("/contact")} className="block px-4 py-3 text-sm font-bold text-gray-800">Liên hệ</Link>
          </div>
        </div>
      )}
    </header>
  );
}
