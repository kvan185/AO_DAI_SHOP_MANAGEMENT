import Link from 'next/link';
import React from 'react';
import pool from '@/lib/db';
import ProductCard from '@/components/ProductCard';

async function getProducts() {
  const [rows]: any = await pool.query(`
    SELECT p.*, pi.image_path as image_path 
    FROM products p 
    LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
    ORDER BY p.created_at DESC
  `);
  return rows;
}

export default async function HomePage() {
  const products = await getProducts();

  return (
    <main className="min-h-screen bg-[#F8F8FF]">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center bg-[#800020] overflow-hidden">
        <div className="absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center"></div>
        <div className="relative text-center z-10 px-4">
          <h1 className="text-5xl md:text-7xl font-serif text-[#D4AF37] mb-6 tracking-[0.1em] uppercase drop-shadow-lg">Áo Dài Shop</h1>
          <p className="text-xl md:text-2xl text-white font-light italic mb-8 max-w-2xl mx-auto">
            "Sức sống nghệ thuật từ tà áo truyền thống Việt Nam"
          </p>
          <Link href="/register" className="px-10 py-4 bg-[#D4AF37] text-[#800020] font-bold rounded-full hover:bg-white transition-all transform hover:scale-105 shadow-2xl">
            BẮT ĐẦU NGAY
          </Link>
        </div>
      </section>

      {/* Product Grid Section */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <h2 className="text-4xl font-serif text-[#800020] text-center mb-4 uppercase tracking-widest">Bộ Sưu Tập Áo Dài</h2>
        <div className="w-24 h-1 bg-[#D4AF37] mx-auto mb-16"></div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Featured Collections */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <h2 className="text-4xl font-serif text-[#800020] text-center mb-16 relative">
          Bộ Sưu Tập Nổi Bật
          <span className="block w-24 h-1 bg-[#D4AF37] mx-auto mt-4"></span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            { name: 'Truyền Thống', slug: 'truyen-thong', img: 'https://images.unsplash.com/photo-1591123120675-6f7f1aae0e5b?auto=format&fit=crop&q=80&w=800' },
            { name: 'Cách Tân', slug: 'cach-tan', img: 'https://images.unsplash.com/photo-1593344484962-796055d4a3a4?auto=format&fit=crop&q=80&w=800' },
            { name: 'Đám Cưới', slug: 'dam-cuoi', img: 'https://images.unsplash.com/photo-1574169208507-84376144848b?auto=format&fit=crop&q=80&w=800' }
          ].map((item) => (
            <div key={item.slug} className="group relative h-96 overflow-hidden rounded-xl shadow-lg cursor-pointer">
              <img src={item.img} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all"></div>
              <div className="absolute bottom-10 left-0 right-0 text-center">
                <h3 className="text-2xl text-white font-serif tracking-widest">{item.name}</h3>
                <span className="text-[#D4AF37] text-sm uppercase opacity-0 group-hover:opacity-100 transition-opacity">Xem ngay</span>
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-[#1a1a1a] text-white/60 py-12 px-4 text-center">
        <h3 className="text-[#D4AF37] font-serif text-2xl mb-4">ÁO DÀI SHOP</h3>
        <p className="max-w-md mx-auto mb-8">Tôn vinh vẻ đẹp phụ nữ Việt qua những thiết kế tinh xảo và tâm huyết.</p>
        <div className="border-t border-white/10 pt-8 text-sm">
          &copy; 2024 Shop Áo Dài Online. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
