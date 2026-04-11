'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BarChart3, 
  Package, 
  ShoppingCart, 
  Users, 
  FileBox, 
  LogOut, 
  Menu, 
  X,
  Layers
} from 'lucide-react';

interface SidebarProps {
  user: {
    username: string;
    role: string;
  };
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: 'Tổng quan', href: '/admin', icon: BarChart3, roles: ['admin', 'manager'] },
    { name: 'Sản phẩm', href: '/admin/products', icon: Package, roles: ['admin', 'manager', 'staff'] },
    { name: 'Danh mục', href: '/admin/categories', icon: Layers, roles: ['admin', 'manager'] },
    { name: 'Đơn hàng', href: '/admin/orders', icon: ShoppingCart, roles: ['admin', 'manager', 'staff'] },
    { name: 'Người dùng', href: '/admin/users', icon: Users, roles: ['admin', 'manager'] },
    { name: 'Báo cáo', href: '/admin/reports', icon: FileBox, roles: ['admin', 'manager'] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(user.role));

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  return (
    <>
      <button 
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#800020] text-white rounded-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X /> : <Menu />}
      </button>

      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-[#1a1a1a] text-gray-300 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-800">
            <h1 className="text-xl font-serif font-bold text-[#D4AF37] tracking-widest">HỆ THỐNG ADMIN</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-grow p-4 space-y-2 overflow-y-auto">
            {filteredItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${isActive 
                      ? 'bg-[#800020] text-white shadow-lg shadow-[#800020]/20' 
                      : 'hover:bg-white/5 hover:text-white'}
                  `}
                >
                  <Icon size={20} />
                  <span className="font-medium text-sm">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-gray-800 space-y-4">
            <div className="px-4 py-3 bg-white/5 rounded-xl border border-white/5">
              <p className="text-xs text-gray-500 uppercase font-bold mb-1">Đang đăng nhập</p>
              <p className="text-sm font-semibold text-white">{user.username}</p>
              <p className="text-[10px] text-[#D4AF37] uppercase tracking-wider font-bold">{user.role}</p>
            </div>
            
            <button 
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-all text-sm font-medium"
            >
              <LogOut size={20} />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
