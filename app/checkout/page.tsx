'use client';
import React, { useEffect, useState } from 'react';
import { useCart } from '@/context/CartContext';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const [formData, setFormData] = useState({
    fullname: '',
    phone: '',
    address: '',
    paymentMethod: 'COD'
  });
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Fetch profile to pre-fill
    const fetchSession = async () => {
      try {
        const res = await fetch('/api/auth/profile');
        if (res.ok) {
          const data = await res.json();
          setSession(data.profile);
          setFormData(prev => ({
            ...prev,
            fullname: data.profile.fullname || '',
            phone: data.profile.phone || '',
            address: data.profile.address || ''
          }));
        }
      } catch (e) {
        console.error('Session fetch failed');
      }
    };
    fetchSession();
  }, []);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          totalAmount: cartTotal,
          address: formData.address,
          phone: formData.phone,
          paymentMethod: formData.paymentMethod
        })
      });

      const result = await res.json();
      if (res.ok) {
        toast.success('Đặt hàng thành công! Cảm ơn bạn.');
        clearCart();
        window.location.href = '/orders/history';
      } else {
        toast.error(result.message || 'Lỗi khi đặt hàng');
      }
    } catch (err) {
      toast.error('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-serif text-gray-800 mb-6">Giỏ hàng của bạn đang trống</h1>
        <Link href="/" className="text-[#800020] hover:underline font-bold">Quay lại mua sắm</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F8FF] py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-serif text-[#800020] mb-12">Thanh Toán</h1>
        
        <form onSubmit={handlePlaceOrder} className="flex flex-col lg:flex-row gap-12">
          {/* Form Info */}
          <div className="lg:w-2/3 space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-serif text-gray-800 mb-8 border-b pb-4">Thông tin giao hàng</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Họ và Tên</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#800020] outline-none"
                    value={formData.fullname}
                    onChange={(e) => setFormData({...formData, fullname: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Số điện thoại</label>
                    <input 
                      required
                      type="text" 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#800020] outline-none"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Phương thức thanh toán</label>
                    <select 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#800020] outline-none"
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                    >
                      <option value="COD">Thanh toán khi nhận hàng (COD)</option>
                      <option value="BANK_TRANSFER">Chuyển khoản ngân hàng</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Địa chỉ chi tiết</label>
                  <textarea 
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#800020] outline-none h-32 resize-none"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-[#800020] p-8 rounded-3xl shadow-xl text-white sticky top-24">
              <h2 className="text-2xl font-serif text-[#D4AF37] mb-8 border-b border-white/20 pb-4">Tóm tắt đơn hàng</h2>
              
              <div className="space-y-4 mb-8 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <div className="flex-grow pr-4">
                      <p className="font-semibold line-clamp-1">{item.name}</p>
                      <p className="text-white/60">Số lượng: {item.quantity}</p>
                    </div>
                    <p className="font-bold whitespace-nowrap">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/20 pt-6 space-y-4 mb-8">
                <div className="flex justify-between text-white/70">
                  <span>Tạm tính</span>
                  <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-[#D4AF37]">
                  <span>Tổng cộng</span>
                  <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cartTotal)}</span>
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-[#D4AF37] text-[#800020] py-4 rounded-2xl font-bold hover:bg-white transition-all shadow-lg disabled:opacity-50"
              >
                {loading ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN ĐẶT HÀNG'}
              </button>
              
              <p className="text-center text-xs text-white/40 mt-6 italic">
                Bằng cách đặt hàng, bạn đồng ý với Điều khoản mua sắm của chúng tôi.
              </p>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
