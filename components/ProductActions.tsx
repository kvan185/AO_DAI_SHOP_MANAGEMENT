'use client';
import React from 'react';
import { useCart } from '@/context/CartContext';
import { toast } from 'react-hot-toast';

export default function ProductActions({ product }: { product: any }) {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product);
    toast.success(`Đã thêm ${product.name} vào giỏ hàng`);
  };

  const handleBuyNow = () => {
    addToCart(product);
    window.location.href = '/checkout';
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mt-auto">
      <button 
        onClick={handleAddToCart}
        className="flex-1 bg-white border-2 border-[#800020] text-[#800020] py-4 rounded-2xl font-bold hover:bg-gray-50 transition-all text-lg"
      >
        THÊM VÀO GIỎ
      </button>
      <button 
        onClick={handleBuyNow}
        className="flex-1 bg-[#800020] text-[#D4AF37] py-4 rounded-2xl font-bold hover:bg-[#600018] transition-all shadow-xl text-lg"
      >
        MUA NGAY
      </button>
    </div>
  );
}
