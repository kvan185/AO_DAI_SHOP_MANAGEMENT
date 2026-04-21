'use client';
import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { toast } from 'react-hot-toast';
import { useSession } from '@/hooks/useSession';

export default function ProductCard({ product }: { product: any }) {
  const { addToCart } = useCart();
  const { sessionUrl } = useSession();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to detail page if button is inside a Link
    addToCart(product);
    toast.success(`Đã thêm ${product.name} vào giỏ hàng`);
  };

  return (
    <div className="group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col h-full border border-gray-100">
      <Link href={sessionUrl(`/product/${product.id}`)} className="relative h-80 overflow-hidden">
        <img 
          src={product.image_path || product.image_url || '/no-image.jpg'} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e: any) => { e.target.src = '/no-image.jpg' }}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all"></div>
        {product.stock <= 0 && (
          <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">Hết hàng</div>
        )}
      </Link>
      
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-serif text-gray-800 mb-2 line-clamp-1 group-hover:text-[#800020] transition-colors">{product.name}</h3>
        <div className="flex items-center justify-between mb-4">
          <p className="text-[#800020] font-bold text-lg">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
          </p>
          <span className="text-xs text-gray-400">Kho: {product.stock}</span>
        </div>
        
        <div className="mt-auto flex gap-2">
            <Link 
            href={sessionUrl(`/product/${product.id}`)}
            className="flex-grow text-center py-2 bg-white border border-[#800020] text-[#800020] rounded-lg text-sm font-bold hover:bg-gray-50 transition-all"
            >
            CHI TIẾT
            </Link>
            <button 
                onClick={handleAddToCart}
                className="px-4 py-2 bg-[#800020] text-[#D4AF37] rounded-lg text-sm font-bold hover:bg-[#600018] transition-all"
            >
                + GIỎ
            </button>
        </div>
      </div>
    </div>
  );
}
