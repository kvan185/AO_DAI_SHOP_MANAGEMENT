'use client';
import React, { useEffect, useState } from 'react';

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullname: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/auth/session');
        const session = await res.json();
        
        if (session.authenticated) {
          // Now fetch full profile data including phone, address
          const fullRes = await fetch('/api/auth/profile');
          const fullData = await fullRes.json();
          if (fullRes.ok) {
            setFormData(fullData.profile);
          }
        } else {
          window.location.href = '/login';
        }
      } catch (err) {
        console.error('Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullname: formData.fullname,
          phone: formData.phone,
          address: formData.address
        }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' });
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.message || 'Cập nhật thất bại' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Lỗi kết nối server' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#800020]"></div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#F8F8FF] py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex flex-col md:flex-row">
        {/* Left Sidebar */}
        <div className="md:w-1/3 bg-[#800020] p-10 text-white flex flex-col">
          <div className="text-center mb-8">
            <div className="w-24 h-24 rounded-full bg-[#D4AF37] mx-auto flex items-center justify-center text-4xl font-bold text-[#800020] border-4 border-white/20 mb-4">
              {formData.username.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-2xl font-serif text-[#D4AF37]">{formData.username}</h2>
            <p className="opacity-70 text-sm">Thành viên thân thiết</p>
          </div>
          
          <nav className="space-y-4">
            <button className="w-full text-left px-4 py-3 rounded-xl bg-white/10 font-semibold border-l-4 border-[#D4AF37]">Thông tin cá nhân</button>
            <a href="/orders/history" className="block w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 transition-all opacity-80">Lịch sử đơn hàng</a>
          </nav>
        </div>

        {/* Form Content */}
        <div className="md:w-2/3 p-10 lg:p-16">
          <h1 className="text-3xl font-serif text-gray-800 mb-8">Thông Tin Cá Nhân</h1>
          
          {message.text && (
            <div className={`p-4 rounded-xl mb-6 text-sm flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              <span className="text-lg">{message.type === 'success' ? '✅' : '❌'}</span>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Tên đăng nhập</label>
                <input type="text" disabled value={formData.username} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 text-gray-400 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Email</label>
                <input type="text" disabled value={formData.email} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 text-gray-400 cursor-not-allowed" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-widest mb-2">Họ và Tên</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#800020] outline-none transition-all"
                value={formData.fullname || ''}
                onChange={(e) => setFormData({...formData, fullname: e.target.value})}
                placeholder="Nhập họ tên đầy đủ"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-widest mb-2">Số điện thoại</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#800020] outline-none transition-all"
                value={formData.phone || ''}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="Ví dụ: 0912345678"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-widest mb-2">Địa chỉ giao hàng</label>
              <textarea 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#800020] outline-none transition-all h-32 resize-none"
                value={formData.address || ''}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder="Nhập địa chỉ nhận hàng chi tiết"
              />
            </div>

            <button 
              type="submit" 
              disabled={saving}
              className="w-full bg-[#800020] text-[#D4AF37] font-bold py-4 rounded-2xl hover:bg-[#600018] transition-all shadow-xl disabled:opacity-50"
            >
              {saving ? 'Đang lưu...' : 'CẬP NHẬT THÔNG TIN'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
