'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sid, setSid] = useState<string>('');

  useEffect(() => {
    // 1. Get sid from URL or generate a new one specifically for this tab session
    let currentSid = searchParams.get('sid');
    if (!currentSid) {
        // Use window.name or a timestamp to create a unique tab identity
        currentSid = Date.now().toString().slice(-6);
    }
    setSid(currentSid);

    // 2. Check for unauthorized flag from middleware
    if (searchParams.get('unauthorized')) {
        setError('Tài khoản của bạn không có quyền truy cập trang này. Vui lòng đăng nhập bằng tài khoản phù hợp.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, sid }),
      });

      const data = await res.json();
      if (res.ok) {
        // 3. Clear existing tokens from other tabs (optional, but sid isolation handles it)
        const defaultUrl = data?.user?.role === 'customer' ? '/' : '/admin';
        const callbackUrl = searchParams.get('callbackUrl') || defaultUrl;
        
        // Construct destination URL with sid to maintain tab-specific session
        const dest = new URL(callbackUrl, window.location.origin);
        dest.searchParams.set('sid', sid);
        
        window.location.href = dest.pathname + dest.search;
      } else {
        setError(data.message || 'Sai tên đăng nhập hoặc mật khẩu');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi hệ thống');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F8FF] p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.1)] overflow-hidden border border-gray-100 flex flex-col">
        <div className="bg-[#800020] p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <h1 className="text-4xl font-serif text-[#D4AF37] mb-3 uppercase tracking-[0.2em] font-black italic">Áo Dài Shop</h1>
          <p className="text-white/60 text-xs font-bold tracking-widest uppercase mb-1">Thương hiệu truyền thống</p>
          <div className="w-12 h-[2px] bg-[#D4AF37] mx-auto mt-4"></div>
        </div>
        
        <div className="p-12">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-serif font-black text-gray-800 italic">Chào mừng trở lại</h2>
            <p className="text-gray-400 text-sm mt-2">Đăng nhập để quản lý cửa hàng của bạn</p>
          </div>
          
          {error && (
            <div className="flex items-center gap-3 text-red-600 text-xs mb-8 bg-red-50 p-4 rounded-2xl border border-red-100 font-bold animate-in fade-in slide-in-from-top-1">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse shrink-0"></div>
                {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Đăng nhập bằng mã SID: <span className="text-[#D4AF37]">{sid}</span></label>
              <input
                type="text"
                required
                className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-[#800020]/10 focus:bg-white outline-none transition-all font-bold text-gray-700 shadow-inner"
                placeholder="Nhập username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mật khẩu</label>
              <input
                type="password"
                required
                className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-[#800020]/10 focus:bg-white outline-none transition-all font-bold text-gray-700 shadow-inner"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#800020] text-[#D4AF37] font-black py-5 rounded-2xl hover:bg-[#600018] hover:shadow-2xl hover:shadow-[#800020]/20 transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 mt-4 shadow-xl text-xs uppercase tracking-widest"
            >
              {loading ? 'Đang xác thực...' : 'Đăng nhập'}
            </button>
          </form>
          
          <div className="mt-10 text-center border-t border-gray-50 pt-8">
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                Đặc quyền nhân viên cao cấp
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
