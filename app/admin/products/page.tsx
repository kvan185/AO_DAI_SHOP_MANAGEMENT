'use client';
import React, { useEffect, useState, useRef } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff,
  Filter,
  X,
  Upload,
  ImageIcon
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    price: '',
    stock: '',
    description: '',
    is_active: 'true',
    image: null as File | null
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (search) q.append('search', search);
      if (selectedCategory) q.append('categoryId', selectedCategory);

      const [pRes, cRes] = await Promise.all([
        fetch(`/api/admin/products?${q.toString()}`),
        fetch('/api/admin/categories') // Using admin categories for management
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
  }, [search, selectedCategory]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleToggleActive = async (product: any) => {
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        // Note: For simple toggle, we can use JSON if the API supports it, 
        // but here we refined the API to use FormData. 
        // For simplicity in this specific toggle, let's create a partial FormData
        body: new FormData() 
      });
      // Actually, let's just use the full fields for consistency in this implementation
      const fb = new FormData();
      fb.append('name', product.name);
      fb.append('category_id', product.category_id);
      fb.append('price', product.price);
      fb.append('stock', product.stock);
      fb.append('description', product.description || '');
      fb.append('is_active', (!product.is_active).toString());
      
      const updateRes = await fetch(`/api/admin/products/${product.id}`, {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fb = new FormData();
    fb.append('name', formData.name);
    fb.append('category_id', formData.category_id);
    fb.append('price', formData.price);
    fb.append('stock', formData.stock);
    fb.append('description', formData.description);
    fb.append('is_active', formData.is_active);
    if (formData.image) {
      fb.append('image', formData.image);
    }

    const url = editingProduct ? `/api/admin/products/${editingProduct.id}` : '/api/admin/products';
    const method = editingProduct ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, { method, body: fb });
      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
        setIsModalOpen(false);
        resetForm();
        fetchData();
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      toast.error('Lỗi khi lưu sản phẩm');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có muốn xóa vĩnh viễn sản phẩm này cùng tệp tin ảnh liên quan?')) return;
    try {
      const res = await fetch(`/api/admin/products/${id}?hard=true`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        fetchData();
      }
    } catch (e) {
      toast.error('Lỗi khi xóa');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category_id: '',
      price: '',
      stock: '',
      description: '',
      is_active: 'true',
      image: null
    });
    setImagePreview(null);
    setEditingProduct(null);
  };

  const openEditModal = (p: any) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      category_id: p.category_id.toString(),
      price: p.price.toString(),
      stock: p.stock.toString(),
      description: p.description || '',
      is_active: p.is_active.toString(),
      image: null
    });
    setImagePreview(p.image_path || p.image_url);
    setIsModalOpen(true);
  };

  if (loading && products.length === 0) return <div className="p-20 text-center">Đang tải...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[#800020] uppercase tracking-widest leading-tight">Quản lý sản phẩm</h1>
          <p className="text-gray-500 text-sm font-medium italic">Master Catalog - Shop Áo Dài Online</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-[#800020] text-[#D4AF37] px-6 py-3.5 rounded-2xl font-bold flex items-center gap-2 hover:bg-[#600018] shadow-lg transition-all uppercase tracking-widest text-sm"
        >
          <Plus size={20} /> THÊM SẢN PHẨM MỚI
        </button>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 items-center">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Tìm kiếm theo tên sản phẩm..." 
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl outline-none text-sm focus:ring-2 focus:ring-[#800020]/20 transition-all font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <select 
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl outline-none text-sm appearance-none focus:ring-2 focus:ring-[#800020]/20 transition-all font-medium cursor-pointer"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Tất cả danh mục sản phẩm</option>
            {categories.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center justify-end text-xs font-bold text-gray-400 uppercase tracking-widest px-4">
            Total {products.length} Products
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Sản phẩm</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Danh mục</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Giá niêm yết</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Kho</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Trạng thái</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((p: any) => (
                <tr key={p.id} className={`group hover:bg-gray-50 transition-colors ${!p.is_active ? 'opacity-50' : ''}`}>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-20 rounded-xl bg-gray-100 overflow-hidden relative border border-gray-100 shadow-sm transition-transform group-hover:scale-105">
                        <img src={p.image_path || p.image_url} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800 line-clamp-1">{p.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1 italic">#{p.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg uppercase tracking-wider">{p.category_name}</span>
                  </td>
                  <td className="px-6 py-5 font-bold text-[#800020] text-sm">
                    {new Intl.NumberFormat('vi-VN').format(p.price)}đ
                  </td>
                  <td className="px-6 py-5">
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg ${p.stock < 5 ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-600'}`}>
                        {p.stock} cái
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <button 
                      onClick={() => handleToggleActive(p)}
                      className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-xl transition-all
                        ${p.is_active ? 'bg-green-50 text-green-600 shadow-sm' : 'bg-gray-100 text-gray-400'}
                      `}
                    >
                      {p.is_active ? <Eye size={12} /> : <EyeOff size={12} />}
                      {p.is_active ? 'Công khai' : 'Tạm ẩn'}
                    </button>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                        <a 
                          href={`/admin/products/${p.id}`}
                          className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        >
                            <Edit2 size={18} />
                        </a>
                        <button 
                          onClick={() => handleDelete(p.id)}
                          className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
            <div className="flex justify-between items-center px-10 py-8 border-b">
              <div>
                <h2 className="text-3xl font-serif text-[#800020] font-bold uppercase tracking-widest">
                  {editingProduct ? 'Chỉnh sửa Sản phẩm' : 'Thêm Sản phẩm Mới'}
                </h2>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.2em] mt-1 italic">Product Management Terminal</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-3 hover:bg-gray-100 rounded-full text-gray-400 transition-colors shadow-sm"
              >
                <X size={28} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-10 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Image Section */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Hình ảnh sản phẩm</label>
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-[3/4] rounded-[2rem] bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-[#800020] hover:bg-[#800020]/5 transition-all group relative overflow-hidden"
                    >
                        {imagePreview ? (
                            <>
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-2">
                                    <Upload size={18} /> CLICK ĐỂ THAY ĐỔI 
                                </div>
                            </>
                        ) : (
                            <>
                                <ImageIcon size={48} className="text-gray-300 group-hover:text-[#800020] transition-colors mb-4" />
                                <p className="text-sm font-bold text-gray-400 group-hover:text-[#800020]">Click hoặc thả ảnh vào đây</p>
                                <p className="text-[10px] text-gray-300 mt-2">Dung lượng tối đa 5MB</p>
                            </>
                        )}
                        <input 
                            ref={fileInputRef}
                            type="file" 
                            accept="image/*"
                            className="hidden" 
                            onChange={handleImageChange}
                        />
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Tên sản phẩm</label>
                    <input 
                      type="text" 
                      required
                      className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#800020]/20 transition-all font-bold text-gray-700"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Danh mục</label>
                      <select 
                        required
                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#800020]/20 transition-all font-bold text-gray-700 appearance-none"
                        value={formData.category_id}
                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      >
                        <option value="">Chọn...</option>
                        {categories.map((c: any) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Trạng thái</label>
                      <select 
                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#800020]/20 transition-all font-bold text-gray-700 appearance-none"
                        value={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.value })}
                      >
                        <option value="true">Công khai</option>
                        <option value="false">Tạm ẩn</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Giá bán (VND)</label>
                      <input 
                        type="number" 
                        required
                        min="0"
                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#800020]/20 transition-all font-bold text-gray-700"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Kho hàng</label>
                      <input 
                        type="number" 
                        required
                        min="0"
                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#800020]/20 transition-all font-bold text-gray-700"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Mô tả sản phẩm</label>
                    <textarea 
                      rows={6}
                      className="w-full px-6 py-4 bg-gray-50 border-none rounded-3xl outline-none focus:ring-2 focus:ring-[#800020]/20 transition-all font-medium resize-none text-gray-600"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-6 mt-12 mb-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-5 bg-gray-100 text-gray-500 rounded-3xl font-bold hover:bg-gray-200 transition-all tracking-[0.2em] text-xs uppercase"
                >
                  HUỶ BỎ GIAO DỊCH
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-5 bg-[#800020] text-[#D4AF37] rounded-3xl font-bold hover:bg-[#600018] shadow-2xl transition-all uppercase tracking-[0.2em] text-xs border border-[#800020]"
                >
                  {editingProduct ? 'CẬP NHẬT DỮ LIỆU' : 'XÁC NHẬN TẠO MỚI'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
}
