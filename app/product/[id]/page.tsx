import React from 'react';
import pool from '@/lib/db';
import Link from 'next/link';
import { Metadata } from 'next';
import ProductGallery from '@/components/ProductGallery';
import ProductInfo from '@/components/ProductInfo';
import { ArrowLeft, Star, Heart, Share2 } from 'lucide-react';

async function getProductData(id: string) {
  const [productRows]: any = await pool.query(`
    SELECT p.*, c.name as category_name 
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.id 
    WHERE p.id = ?`, [id]);
  
  const [imageRows]: any = await pool.query(
    'SELECT * FROM product_images WHERE product_id = ? ORDER BY display_order ASC, created_at ASC', 
    [id]
  );

  const [variantRows]: any = await pool.query(
    'SELECT * FROM product_variants WHERE product_id = ?',
    [id]
  );
  
  return {
    product: productRows[0],
    images: imageRows,
    variants: variantRows
  };
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { product } = await getProductData(params.id);
  return {
    title: `${product?.name || 'Sản phẩm'} - Nét quyến rũ Phương Đông`,
    description: product?.description || 'Chi tiết sản phẩm áo dài thiết kế cao cấp.',
  };
}

export default async function ProductDetailPage({ params, searchParams }: { params: { id: string }, searchParams: { sid?: string } }) {
  const { product, images, variants } = await getProductData(params.id);
  const sid = searchParams.sid;
  const sessionUrl = (url: string) => {
    if (!sid) return url;
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}sid=${sid}`;
  };

  if (!product) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#F9F6F0]">
        <h1 className="text-4xl font-serif text-gray-800 mb-6 italic">Tuyệt tác không tìm thấy</h1>
        <Link href={sessionUrl("/")} className="px-8 py-3 bg-[#800020] text-[#D4AF37] rounded-full font-bold uppercase tracking-widest hover:scale-105 transition-all">
          Trở về bộ sưu tập
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Top Navigation / Progress */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100 hidden md:block">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
              <Link href={sessionUrl("/")} className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#800020] hover:translate-x-[-4px] transition-transform">
                  <ArrowLeft size={16} /> Quay lại
              </Link>
              <div className="flex items-center gap-6">
                  <button className="text-gray-400 hover:text-[#800020] transition-colors"><Heart size={18} /></button>
                  <button className="text-gray-400 hover:text-[#800020] transition-colors"><Share2 size={18} /></button>
              </div>
          </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-20 lg:py-24">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
          
          {/* Gallery Section - Full width on mobile, 1/2 on desktop */}
          <div className="lg:w-[55%] xl:w-1/2">
            <ProductGallery images={images} productName={product.name} />
          </div>

          {/* Info Section */}
          <div className="lg:w-[45%] xl:w-1/2">
            <ProductInfo product={product} variants={variants} />
            
            {/* Description Section */}
            <div className="mt-16 pt-12 border-t border-gray-100 space-y-8 animate-in fade-in duration-1000">
                <div className="flex items-center gap-4">
                    <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-[#800020]">Câu chuyện sản phẩm</h3>
                    <div className="flex-1 h-[1px] bg-gray-100" />
                </div>
                <div className="prose prose-burgundy max-w-none text-gray-600 leading-[1.8] font-light text-lg">
                    {product.description ? (
                        <div className="whitespace-pre-wrap">{product.description}</div>
                    ) : (
                        <p className="italic text-gray-400">Thiết kế tinh xảo, chất liệu thượng hạng, tôn vinh vẻ đẹp Á Đông.</p>
                    )}
                </div>
                
                {/* Specific details */}
                <div className="grid grid-cols-2 gap-y-6 pt-6 text-[11px] font-bold uppercase tracking-widest text-gray-400">
                    <div className="flex flex-col gap-1">
                        <span className="text-gray-300">Chất liệu</span>
                        <span className="text-[#800020]">Lụa tơ tằm / Gấm</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-gray-300">Phân loại</span>
                        <span className="text-[#800020]">{product.category_name || 'Truyền thống'}</span>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative luxury footer section */}
      <section className="bg-[#F9F6F0] py-24 mt-20">
          <div className="max-w-3xl mx-auto text-center px-6 space-y-8">
              <div className="flex justify-center gap-1 text-[#D4AF37]">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
              </div>
              <h2 className="text-3xl md:text-4xl font-serif italic text-gray-900 leading-tight">
                  "Mỗi bộ áo dài là một tác phẩm nghệ thuật, mang hơi thở của thời đại hòa quyện cùng giá trị truyền thống."
              </h2>
              <p className="text-xs font-bold uppercase tracking-[0.4em] text-[#800020]">Nghệ nhân thiết kế</p>
          </div>
      </section>

      {/* Mobile Sticky Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-[0_-10px_30px_rgba(0,0,0,0.05)] p-4 flex gap-4 z-50">
          <Link href="/cart" className="w-14 h-14 flex items-center justify-center bg-gray-50 rounded-2xl text-[#800020]">
                <ShoppingBag size={24} />
          </Link>
          <button className="flex-1 bg-[#800020] text-[#D4AF37] font-black uppercase tracking-widest text-xs rounded-2xl px-6">
                Lựa chọn phiên bản ngay
          </button>
      </div>

    </main>
  );
}

// Internal ShoppingBag icon for mobile
function ShoppingBag({ size }: { size: number }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
    );
}
