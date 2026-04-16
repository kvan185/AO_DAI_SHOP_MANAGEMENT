'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff,
  Filter
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import { useSession } from '@/hooks/useSession';

export default function AdminProducts() {
  const { sid, sessionUrl } = useSession();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (search) q.append('search', search);
      if (selectedCategory) q.append('categoryId', selectedCategory);
      if (sid) q.append('sid', sid);

      const [pRes, cRes] = await Promise.all([
        fetch(`/api/admin/products?${q.toString()}`),
        fetch(`/api/admin/categories${sid ? `?sid=${sid}` : ''}`)
      ]);

      const pData = await pRes.json();
      const cData = await cRes.json();

      setProducts(pData.products || []);
      setCategories(cData.categories || []);
    } catch (e) {
      toast.error('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, selectedCategory, sid]);

  const handleToggleActive = async (product: any) => {
    try {
      // Logic for simple toggle
      const fb = new FormData();
      fb.append('name', product.name);
      fb.append('category_id', product.category_id);
      fb.append('price', product.price);
      fb.append('stock', product.stock);
      fb.append('is_active', (!product.is_active).toString());
      
      const updateUrl = sid ? `/api/admin/products/${product.id}?sid=${sid}` : `/api/admin/products/${product.id}`;
      const updateRes = await fetch(updateUrl, {
        method: 'PUT',
        body: fb
      });

      if (updateRes.ok) {
        toast.success(`Đã ${product.is_active ? 'ẩn' : 'hiện'} sản phẩm`);
        fetchData();
      }
    } catch (e) {
      toast.error('Lỗi thực thi');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có muốn xóa vĩnh viễn sản phẩm này cùng tệp tin ảnh liên quan?')) return;
    try {
      const url = sid ? `/api/admin/products/${id}?sid=${sid}` : `/api/admin/products/${id}`;
      const res = await fetch(url, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        fetchData();
      }
    } catch (e) {
      toast.error('Lỗi khi xóa');
    }
  };

  if (loading && products.length === 0) return (
    <div className="p-20 text-center animate-pulse">
        <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4"></div>
        <p className="text-gray-400 font-serif italic text-xl">Đang tải danh mục sản phẩm...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-serif text-[#800020] font-black italic uppercase tracking-widest leading-tight">Catalog Quản Trị</h1>
          <p className="text-gray-500 text-sm font-medium italic">Master Inventory Management System</p>
        </div>
        <Link 
          href={sessionUrl("/admin/products/new")}
          className="bg-[#800020] text-[#D4AF37] px-8 py-4 rounded-2xl font-black flex items-center gap-3 hover:bg-[#600018] shadow-2xl transition-all uppercase tracking-widest text-xs"
        >
          <Plus size={22} strokeWidth={3} /> THÊM SẢN PHẨM MỚI
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-gray-100 items-center">
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#800020] transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Tìm theo tên sản phẩm..." 
            className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-2xl outline-none text-sm focus:ring-4 focus:ring-[#800020]/5 transition-all font-bold text-gray-700"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative group">
          <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#800020] transition-colors" size={20} />
          <select 
            className="w-full pl-14 pr-10 py-4 bg-gray-50 border-none rounded-2xl outline-none text-sm appearance-none focus:ring-4 focus:ring-[#800020]/5 transition-all font-bold text-gray-700 cursor-pointer"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Tất cả danh mục sản phẩm</option>
            {categories.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center justify-end text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] px-4">
            Total {products.length} Products Found
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[3rem] shadow-[0_30px_60px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Sản phẩm</th>
                <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Danh mục</th>
                <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Giá niêm yết</th>
                <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Kho</th>
                <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Trạng thái</th>
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((p: any) => (
                <tr key={p.id} className={`group hover:bg-gray-50/50 transition-all duration-300 ${!p.is_active ? 'opacity-40 grayscale-[50%]' : ''}`}>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-24 rounded-2xl bg-gray-100 overflow-hidden relative border border-gray-100 shadow-md transition-all duration-500 group-hover:scale-110 group-hover:-rotate-2">
                        <img 
                          src={p.image_path || '/no-image.jpg'} 
                          alt={p.name} 
                          className="w-full h-full object-cover"
                          onError={(e: any) => { e.target.src = '/no-image.jpg' }}
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-base font-black text-gray-800 line-clamp-1 font-serif italic">{p.name}</p>
                        <p className="text-[10px] text-[#800020] font-black uppercase tracking-[0.2em] bg-[#800020]/5 inline-block px-2 py-0.5 rounded-md">
                            SKU: {p.sku || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <span className="text-[10px] font-black text-gray-500 bg-gray-100 px-4 py-2 rounded-xl uppercase tracking-[0.15em] border border-gray-200">{p.category_name}</span>
                  </td>
                  <td className="px-6 py-6 font-black text-[#800020] text-lg">
                    {new Intl.NumberFormat('vi-VN').format(p.price)}đ
                  </td>
                  <td className="px-6 py-6">
                    <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest ${p.stock < 10 ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-gray-50 text-gray-400 border border-gray-100'}`}>
                        {p.stock} Unit
                    </span>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <button 
                      onClick={() => handleToggleActive(p)}
                      className={`inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.1em] px-4 py-2 rounded-2xl transition-all duration-300 shadow-sm
                        ${p.is_active 
                            ? 'bg-green-50 text-green-600 border border-green-100 hover:bg-green-100' 
                            : 'bg-gray-100 text-gray-400 border border-gray-200'
                        }
                      `}
                    >
                      {p.is_active ? <Eye size={12} strokeWidth={3} /> : <EyeOff size={12} strokeWidth={3} />}
                      {p.is_active ? 'Công khai' : 'Tạm ẩn'}
                    </button>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                        <Link 
                          href={sessionUrl(`/admin/products/${p.id}`)}
                          className="p-3.5 text-gray-400 hover:text-[#800020] hover:bg-[#800020]/5 rounded-2xl transition-all shadow-sm bg-white border border-transparent hover:border-[#800020]/10"
                        >
                            <Edit2 size={18} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(p.id)}
                          className="p-3.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all shadow-sm bg-white border border-transparent hover:border-red-100"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && (
            <div className="p-20 text-center">
                <p className="text-gray-300 font-serif italic text-2xl">Không tìm thấy sản phẩm nào phù hợp yêu cầu</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
