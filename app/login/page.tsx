'use client';
import React, { useState } from 'react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (res.ok) {
        alert('Đăng nhập thành công!');
        // Redirect or store token logic here
        localStorage.setItem('token', data.token);
        window.location.href = '/';
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
    <div className="min-h-screen flex items-center justify-center bg-[#F8F8FF] p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        <div className="bg-burgundy p-8 text-center bg-[#800020]">
          <h1 className="text-3xl font-serif text-[#D4AF37] mb-2 uppercase tracking-widest">Áo Dài Shop</h1>
          <p className="text-white/80 text-sm italic">Slogan: Nét Việt Vươn Tầm</p>
        </div>
        
        <div className="p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Đăng Nhập</h2>
          
          {error && <p className="text-red-500 text-sm mb-4 text-center bg-red-50 p-2 rounded">{error}</p>}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#800020] focus:border-transparent outline-none transition-all"
                placeholder="Nhập username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#800020] focus:border-transparent outline-none transition-all"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#800020] text-[#D4AF37] font-bold py-3 rounded-lg hover:bg-[#600018] transition-colors duration-300 shadow-lg disabled:opacity-50"
            >
              {loading ? 'Đang xử lý...' : 'ĐĂNG NHẬP'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Chưa có tài khoản?{' '}
              <a href="/register" className="text-[#800020] font-semibold hover:underline">Đăng ký ngay</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
