import React from 'react';
import pool from '@/lib/db';
import Link from 'next/link';
import { Metadata } from 'next';
import ProductActions from '@/components/ProductActions';
import ProductGallery from '@/components/ProductGallery';

async function getProductData(id: string) {
  const [productRows]: any = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
  const [imageRows]: any = await pool.query(
    'SELECT * FROM product_images WHERE product_id = ? ORDER BY display_order ASC, created_at ASC', 
    [id]
  );
  
  return {
    product: productRows[0],
    images: imageRows
  };
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { product } = await getProductData(params.id);
  return {
    title: `${product?.name || 'Sản phẩm'} - Shop Áo Dài Online`,
    description: product?.description || 'Chi tiết sản phẩm áo dài cao cấp.',
  };
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const { product, images } = await getProductData(params.id);

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h1 className="text-2xl font-serif text-gray-800 mb-4">Sản phẩm không tồn tại</h1>
        <Link href="/" className="text-[#800020] hover:underline">Quay lại trang chủ</Link>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-12 md:py-24 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
        
        {/* Gallery Section */}
        <div className="lg:w-1/2">
          <ProductGallery images={images} productName={product.name} />
        </div>

        {/* Info Section */}
        <div className="lg:w-1/2 flex flex-col pt-4">
          <nav className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-8 flex items-center gap-2">
            <Link href="/" className="hover:text-[#800020] transition-colors">Cửa hàng</Link>
            <span className="text-gray-300">/</span>
            <span className="text-[#800020]">{product.name}</span>
          </nav>

          <h1 className="text-4xl md:text-6xl font-serif text-gray-900 mb-6 leading-tight tracking-tight">{product.name}</h1>
          
          <div className="flex items-center gap-6 mb-10">
            <p className="text-4xl font-bold text-[#800020] font-serif">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
            </p>
            <div className="h-8 w-[1px] bg-gray-200" />
            {product.stock > 0 ? (
              <span className="flex items-center gap-2 text-green-600 text-xs font-bold uppercase tracking-widest">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Sẵn có ({product.stock})
              </span>
            ) : (
              <span className="text-red-500 text-xs font-bold uppercase tracking-widest">Tạm hết hàng</span>
            )}
          </div>

          <div className="prose prose-burgundy max-w-none text-gray-500 mb-12 leading-relaxed text-lg italic font-serif">
            <p className="border-l-4 border-[#800020]/20 pl-6">
              "{product.description}"
            </p>
          </div>

          <div className="space-y-6 mb-12">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">Kích thước yêu cầu</h3>
            <div className="flex flex-wrap gap-3">
              {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                <button key={size} className="min-w-[4rem] h-14 border border-gray-100 rounded-2xl flex items-center justify-center font-bold text-sm hover:border-[#800020] hover:text-[#800020] hover:bg-[#800020]/5 transition-all shadow-sm">
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gray-50/50 p-8 rounded-[2rem] border border-gray-100 mb-12">
            <ProductActions product={product} />
          </div>

          <div className="grid grid-cols-2 gap-8 pt-10 border-t border-gray-100">
            <div className="flex items-start gap-4">
                <span className="text-2xl">🕊️</span>
                <div>
                    <h4 className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-1">Thiết kế thủ công</h4>
                    <p className="text-xs text-gray-400">Tỉ mỉ trong từng đường kim mũi chỉ</p>
                </div>
            </div>
            <div className="flex items-start gap-4">
                <span className="text-2xl">✨</span>
                <div>
                    <h4 className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-1">Chất liệu thượng hạng</h4>
                    <p className="text-xs text-gray-400">Lụa cao cấp, mềm mại và sang trọng</p>
                </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
