'use client';
import React, { useState } from 'react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert('Đăng ký thành công! Hãy đăng nhập.');
        window.location.href = '/login';
      } else {
        setError(data.message || 'Đăng ký thất bại');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi hệ thống');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F8FF] p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col md:flex-row">
        <div className="md:w-1/2 bg-[#800020] p-8 text-center flex flex-col justify-center text-white">
          <h1 className="text-3xl font-serif text-[#D4AF37] mb-4 uppercase tracking-widest">Gia Nhập Cùng Chúng Tôi</h1>
          <p className="text-sm italic opacity-80 leading-relaxed">Khám phá vẻ đẹp truyền thống Việt Nam qua từng tà áo dài tinh tế.</p>
        </div>
        
        <div className="md:w-1/2 p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Đăng Ký</h2>
          
          {error && <p className="text-red-500 text-sm mb-4 text-center bg-red-50 p-2 rounded">{error}</p>}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#800020] focus:border-transparent outline-none transition-all"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#800020] focus:border-transparent outline-none transition-all"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
              <input
                type="password"
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#800020] focus:border-transparent outline-none transition-all"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu</label>
              <input
                type="password"
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#800020] focus:border-transparent outline-none transition-all"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#800020] text-[#D4AF37] font-bold py-3 rounded-lg hover:bg-[#600018] transition-colors duration-300 shadow-lg disabled:opacity-50 mt-4"
            >
              {loading ? 'Đang đăng ký...' : 'ĐĂNG KÝ'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Đã có tài khoản?{' '}
              <a href="/login" className="text-[#800020] font-semibold hover:underline">Đăng nhập</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
