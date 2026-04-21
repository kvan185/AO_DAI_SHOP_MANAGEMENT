import React from 'react';
import pool from '@/lib/db';
import ProductCard from '@/components/ProductCard';
import { Metadata } from 'next';

async function getProductsByCategory(categoryId?: string) {
  let query = `
    SELECT p.*, pi.image_path as image_path 
    FROM products p 
    LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
  `;
  const params: any[] = [];

  if (categoryId) {
    query += ' WHERE p.category_id = ?';
    params.push(categoryId);
  }

  query += ' ORDER BY p.created_at DESC';

  const [rows]: any = await pool.query(query, params);
  return rows;
}

async function getCategoryInfo(categoryId?: string) {
    if (!categoryId) return null;
    const [rows]: any = await pool.query('SELECT * FROM categories WHERE id = ?', [categoryId]);
    return rows[0];
}

export async function generateMetadata({ searchParams }: { searchParams: { category?: string } }): Promise<Metadata> {
  const category = await getCategoryInfo(searchParams.category);
  return {
    title: category ? `${category.name} - Bộ sưu tập Áo Dài` : 'Tất cả sản phẩm - Áo Dài Shop',
    description: 'Khám phá bộ sưu tập áo dài cao cấp, thiết kế độc quyền.',
  };
}

export default async function ProductsPage({ searchParams }: { searchParams: { category?: string } }) {
  const products = await getProductsByCategory(searchParams.category);
  const category = await getCategoryInfo(searchParams.category);

  return (
    <main className="min-h-screen bg-white">
      {/* Header Section */}
      <section className="bg-[#800020] py-24 text-center">
          <div className="max-w-7xl mx-auto px-6 space-y-6 animate-in fade-in slide-in-from-top-10 duration-1000">
              <span className="text-[#D4AF37] text-xs font-black uppercase tracking-[0.5em]">Bộ sưu tập sảo phẩm</span>
              <h1 className="text-5xl md:text-7xl font-serif text-white italic">
                  {category ? category.name : 'Tất cả tuyệt phẩm'}
              </h1>
              <div className="w-24 h-1 bg-[#D4AF37] mx-auto" />
          </div>
      </section>

      {/* Grid Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#800020]">Kết quả tìm kiếm</p>
                <h3 className="text-2xl font-serif italic text-gray-900">Tìm thấy {products.length} mẫu thiết kế</h3>
            </div>
            
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <span>Sắp xếp:</span>
                <select className="bg-transparent border-none focus:ring-0 text-gray-900 font-bold cursor-pointer">
                    <option>Mới nhất</option>
                    <option>Giá tăng dần</option>
                    <option>Giá giảm dần</option>
                </select>
            </div>
        </div>

        {products.length > 0 ? (
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${process.env.ITEMS_PER_ROW || '4'} gap-10`}>
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-40 text-center space-y-8 bg-gray-50 rounded-[4rem] border border-dashed border-gray-200">
            <div className="text-6xl">🪷</div>
            <h2 className="text-3xl font-serif italic text-gray-400">Bộ sưu tập này đang được nghệ nhân chuẩn bị...</h2>
          </div>
        )}
      </section>

      {/* Decorative luxury footer section */}
      <section className="bg-[#F9F6F0] py-32 border-t border-gray-100">
          <div className="max-w-4xl mx-auto text-center px-6 space-y-10">
              <span className="text-[#800020] text-[10px] font-black uppercase tracking-[0.4em]">Trải nghiệm đỉnh cao</span>
              <h2 className="text-4xl md:text-6xl font-serif italic text-gray-900 leading-tight">
                  Từng đường nét tôn vinh bản sắc <br /> Từng chất liệu kể chuyện đam mê
              </h2>
          </div>
      </section>
    </main>
  );
}
