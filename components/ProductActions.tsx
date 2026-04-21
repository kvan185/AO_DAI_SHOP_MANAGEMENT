'use client';
import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { toast } from 'react-hot-toast';
import { Minus, Plus, ShoppingBag, Flashlight as Flash } from 'lucide-react';

interface ProductActionsProps {
    product: any;
    selectedVariant: any;
    maxStock: number;
}

export default function ProductActions({ product, selectedVariant, maxStock }: ProductActionsProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    addToCart(product, selectedVariant, quantity);
    toast.success(`Đã thêm ${quantity} ${product.name} vào giỏ hàng`);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedVariant, quantity);
    window.location.href = '/checkout';
  };

  return (
    <div className="space-y-8">
      {/* Quantity Selector */}
      <div className="flex items-center justify-between bg-white p-2 rounded-2xl border border-gray-100 shadow-sm w-full sm:w-48">
        <button 
            onClick={() => setQuantity(q => Math.max(1, q - 1))}
            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-[#800020] transition-colors"
        >
            <Minus size={16} />
        </button>
        <span className="font-bold text-lg w-12 text-center">{quantity}</span>
        <button 
            onClick={() => setQuantity(q => q < maxStock ? q + 1 : q)}
            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-[#800020] transition-colors"
        >
            <Plus size={16} />
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button 
          onClick={handleAddToCart}
          disabled={maxStock === 0}
          className="flex-1 group relative bg-white border-2 border-[#800020] text-[#800020] px-8 py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-[#800020]/5 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
        >
          <ShoppingBag size={20} className="group-hover:-translate-y-1 transition-transform" />
          THÊM VÀO GIỎ
        </button>
        <button 
          onClick={handleBuyNow}
          disabled={maxStock === 0}
          className="flex-1 bg-[#800020] text-[#D4AF37] px-8 py-5 rounded-2xl font-black shadow-[0_20px_40px_rgba(128,0,32,0.2)] hover:bg-[#600018] hover:shadow-[0_20px_40px_rgba(128,0,32,0.3)] transition-all active:scale-95 disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-3 tracking-widest uppercase text-sm"
        >
          MUA NGAY
        </button>
      </div>
    </div>
  );
}
