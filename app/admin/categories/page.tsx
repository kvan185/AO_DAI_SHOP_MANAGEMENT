'use client';
import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useSession } from '@/hooks/useSession';

export default function AdminCategories() {
  const { sid } = useSession();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (search) q.append('search', search);
      if (sid) q.append('sid', sid);
      const res = await fetch(`/api/admin/categories?${q.toString()}`);
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (e) {
      toast.error('Lỗi khi tải danh mục');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [search, sid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = sid ? `?sid=${sid}` : '';
    const url = editingCategory 
      ? `/api/admin/categories/${editingCategory.id}${q}` 
      : `/api/admin/categories${q}`;
    const method = editingCategory ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
        setIsModalOpen(false);
        setFormData({ name: '', description: '' });
        fetchCategories();
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      toast.error('Lỗi hệ thống');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;

    try {
      const q = sid ? `?sid=${sid}` : '';
      const res = await fetch(`/api/admin/categories/${id}${q}`, { method: 'DELETE' });
      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
        fetchCategories();
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      toast.error('Lỗi khi xóa');
    }
  };

  const openEditModal = (category: any) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || ''
    });
    setIsModalOpen(true);
  };

  if (loading && categories.length === 0) return <div className="p-20 text-center">Đang tải...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[#800020] uppercase tracking-widest">Danh mục sản phẩm</h1>
          <p className="text-gray-500 text-sm">Quản lý phân loại các mẫu áo dài.</p>
        </div>
        <button 
          onClick={() => {
            setEditingCategory(null);
            setFormData({ name: '', description: '' });
            setIsModalOpen(true);
          }}
          className="bg-[#800020] text-[#D4AF37] px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-[#600018] shadow-lg transition-all"
        >
          <Plus size={20} /> THÊM DANH MỤC
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Tìm kiếm danh mục..." 
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl outline-none text-sm focus:ring-2 focus:ring-[#800020]/20 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b">
              <tr>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">ID</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Tên danh mục</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Slug</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Ngày tạo</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories.map((c: any) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-8 py-5 font-bold text-[#800020] text-sm">#{c.id}</td>
                  <td className="px-6 py-5 font-bold text-gray-800">{c.name}</td>
                  <td className="px-6 py-5">
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">/{c.slug}</span>
                  </td>
                  <td className="px-6 py-5 text-xs text-gray-400">
                    {new Date(c.created_at).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => openEditModal(c)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(c.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && !loading && (
                <tr>
                    <td colSpan={5} className="px-8 py-10 text-center text-gray-400 italic">Không tìm thấy danh mục nào</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center p-8 border-b">
              <h2 className="text-2xl font-serif text-[#800020] font-bold">
                {editingCategory ? 'Chỉnh sửa Danh mục' : 'Thêm Danh mục mới'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Tên danh mục</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ví dụ: Áo dài cưới"
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#800020]/20 transition-all font-medium"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Mô tả (Tùy chọn)</label>
                <textarea 
                  rows={4}
                  placeholder="Mô tả ngắn về danh mục này..."
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#800020]/20 transition-all font-medium resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                >
                  HỦY BỎ
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-[#800020] text-[#D4AF37] rounded-2xl font-bold hover:bg-[#600018] shadow-lg transition-all uppercase tracking-widest"
                >
                  {editingCategory ? 'CẬP NHẬT' : 'TẠO MỚI'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
