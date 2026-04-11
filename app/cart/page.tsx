'use client';
import React from 'react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-serif text-[#800020] mb-6">Giỏ hàng của bạn đang trống</h1>
        <p className="text-gray-600 mb-8">Hãy chọn những mẫu áo dài đẹp nhất cho mình nhé!</p>
        <Link href="/" className="bg-[#800020] text-[#D4AF37] px-8 py-3 rounded-full font-bold shadow-lg hover:bg-[#600018] transition-all">
          XEM SẢN PHẨM
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F8FF] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-serif text-[#800020] mb-12">Giỏ Hàng</h1>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* List Items */}
          <div className="lg:w-2/3 space-y-6">
            {cart.map((item) => (
              <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6">
                <div className="w-24 h-32 rounded-xl overflow-hidden flex-shrink-0 bg-gray-50">
                  <img src={item.image_path} alt={item.name} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-grow">
                  <h3 className="text-xl font-serif text-gray-800 mb-1">{item.name}</h3>
                  <p className="text-[#800020] font-bold mb-4">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                  </p>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border rounded-lg">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-3 py-1 hover:bg-gray-100 transition-colors"
                      >-</button>
                      <span className="px-4 py-1 font-bold">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-3 py-1 hover:bg-gray-100 transition-colors"
                      >+</button>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-sm text-red-500 hover:underline"
                    >Xóa</button>
                  </div>
                </div>

                <div className="text-right hidden sm:block">
                  <p className="text-lg font-bold text-gray-800">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Area */}
          <div className="lg:w-1/3">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 sticky top-24">
              <h2 className="text-2xl font-serif text-gray-800 mb-6">Tổng đơn hàng</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính</span>
                  <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển</span>
                  <span>Miễn phí</span>
                </div>
                <div className="border-t pt-4 flex justify-between text-xl font-bold text-[#800020]">
                  <span>Tổng tiền</span>
                  <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cartTotal)}</span>
                </div>
              </div>

              <Link 
                href="/checkout"
                className="block w-full text-center bg-[#800020] text-[#D4AF37] py-4 rounded-2xl font-bold hover:bg-[#600018] shadow-xl transition-all"
              >
                TIẾN HÀNH THANH TOÁN
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
