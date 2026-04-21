'use client';
import React, { useState, useMemo } from 'react';
import ProductActions from './ProductActions';
import { Check, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

interface Variant {
    id: number;
    size: string;
    color: string;
    stock: number;
    price_override: string | null;
}

interface ProductInfoProps {
    product: any;
    variants: Variant[];
}

export default function ProductInfo({ product, variants }: ProductInfoProps) {
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);

    // Get unique sizes and colors
    const uniqueSizes = useMemo(() => {
        const sizes = variants
            .filter(v => v.stock > 0)
            .map(v => v.size)
            .filter((v, i, a) => v && a.indexOf(v) === i);
        return sizes;
    }, [variants]);

    const colorsForSize = useMemo(() => {
        if (!selectedSize) return [];
        return variants
            .filter(v => v.size === selectedSize && v.stock > 0)
            .map(v => v.color)
            .filter((v, i, a) => v && a.indexOf(v) === i);
    }, [variants, selectedSize]);

    const selectedVariant = useMemo(() => {
        if (!selectedSize || !selectedColor) return null;
        return variants.find(v => v.size === selectedSize && v.color === selectedColor) || null;
    }, [variants, selectedSize, selectedColor]);

    const displayedPrice = selectedVariant?.price_override 
        ? parseFloat(selectedVariant.price_override) 
        : parseFloat(product.price);
    
    const maxStock = selectedVariant ? selectedVariant.stock : (variants.length > 0 ? 0 : product.stock);

    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-1000">
            {/* Breadcrumb */}
            <nav className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-6 flex items-center gap-3">
                <a href="/" className="hover:text-[#800020] transition-colors">Bộ sưu tập</a>
                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                <span className="text-[#800020]">{product.name}</span>
            </nav>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-gray-900 mb-6 leading-[1.1] tracking-tight italic">
                {product.name}
            </h1>

            <div className="flex items-baseline gap-6 mb-10">
                <p className="text-4xl font-serif font-black text-[#800020]">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(displayedPrice)}
                </p>
                {product.discount_price && !selectedVariant?.price_override && (
                    <p className="text-xl text-gray-400 line-through decoration-[#800020]/20 underline-offset-4">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                    </p>
                )}
            </div>

            <div className="space-y-10 mb-12">
                {/* Size Selection */}
                {uniqueSizes.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500">Kích cỡ hiện có</h3>
                            <button className="text-[10px] font-bold text-[#800020] underline underline-offset-4 uppercase tracking-widest">Hướng dẫn chọn size</button>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {uniqueSizes.map((size) => (
                                <button
                                    key={size}
                                    onClick={() => {
                                        setSelectedSize(size);
                                        setSelectedColor(null);
                                    }}
                                    className={`min-w-[4.5rem] h-14 rounded-2xl flex items-center justify-center font-bold text-sm transition-all duration-500 border-2 
                                        ${selectedSize === size 
                                            ? 'border-[#800020] bg-[#800020] text-[#D4AF37] shadow-xl' 
                                            : 'border-gray-100 bg-white text-gray-800 hover:border-[#800020]/30 shadow-sm'}`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Color Selection */}
                {selectedSize && colorsForSize.length > 0 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500">Họa tiết / Màu sắc</h3>
                        <div className="flex flex-wrap gap-3">
                            {colorsForSize.map((color) => (
                                <button
                                    key={color}
                                    onClick={() => setSelectedColor(color)}
                                    className={`px-6 h-14 rounded-2xl flex items-center justify-center font-bold text-sm transition-all duration-500 border-2
                                        ${selectedColor === color 
                                            ? 'border-[#800020] bg-[#800020]/5 text-[#800020]' 
                                            : 'border-gray-100 bg-white text-gray-500 hover:border-[#800020]/30'}`}
                                >
                                    {color}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Status Section */}
                <div className="flex items-center gap-4 py-4 px-6 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className={`w-2 h-2 rounded-full 
                        ${(!selectedSize && variants.length > 0) ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 
                          (maxStock > 0 ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse' : 'bg-red-500')}
                    `} />
                    <span className="text-[11px] font-bold uppercase tracking-[0.1em]">
                        {(!selectedSize && variants.length > 0) 
                            ? 'Vui lòng chọn Kích cỡ & Màu sắc để xem tồn kho' 
                            : (maxStock > 0 ? `Sẵn sàng giao ngay (Còn ${maxStock} sản phẩm)` : 'Tạm hết hàng hoặc phiên bản này không khả dụng')}
                    </span>
                </div>
            </div>

            <ProductActions product={product} selectedVariant={selectedVariant} maxStock={maxStock} />

            {/* Premium Trust Badges */}
            <div className="mt-12 pt-10 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#800020]/5 text-[#800020] rounded-lg"><ShieldCheck size={18} /></div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Bảo hành 12 tháng</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#800020]/5 text-[#800020] rounded-lg"><Truck size={18} /></div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Miễn phí vận chuyển</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#800020]/5 text-[#800020] rounded-lg"><RefreshCw size={18} /></div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Đổi trả 7 ngày</span>
                </div>
            </div>
        </div>
    );
}
