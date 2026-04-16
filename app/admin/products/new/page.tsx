'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  X,
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Layers,
  Image as ImageIcon,
  Sparkles,
  Trash2,
  Hash,
  Link as LinkIcon,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

import { useSession } from '@/hooks/useSession';

// --- Skeleton Component ---
const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`}></div>
);

// --- Product Page (Creation) ---
export default function CreateProductPage() {
  const router = useRouter();
  const { sid, sessionUrl } = useSession();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [generatingAI, setGeneratingAI] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    slug: '',
    category_id: '',
    price: '',
    discount_price: '',
    stock: '',
    description: '',
    is_active: 'true'
  });

  useEffect(() => {
    fetchCategories();
  }, [sid]);

  const fetchCategories = async () => {
    try {
        const url = sid ? `/api/admin/categories?sid=${sid}` : '/api/admin/categories';
        const res = await fetch(url);
        const data = await res.json();
        if (res.ok) {
            setCategories(data.categories);
            if (data.categories.length > 0 && !formData.category_id) {
                setFormData(prev => ({ ...prev, category_id: data.categories[0].id.toString() }));
            }
        }
    } catch (e) {
      toast.error('Lỗi khi tải danh mục');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setIsDirty(true);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateSlug = () => {
    const s = formData.name.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[đĐ]/g, "d")
        .replace(/([^0-9a-z-\s])/g, '')
        .replace(/(\s+)/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
    handleInputChange('slug', s);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setIsDirty(true);
      setNewImageFiles(prev => [...prev, ...files]);
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => setNewImagePreviews(prev => [...prev, reader.result as string]);
        reader.readAsDataURL(file);
      });
    }
  };

  const handleAIGenerate = async () => {
    if (!formData.name) return toast.error('Vui lòng nhập tên sản phẩm để AI có dữ liệu');
    setGeneratingAI(true);
    try {
        const catName = categories.find(c => c.id.toString() === formData.category_id)?.name || '';
        const url = sid ? `/api/ai/generate?sid=${sid}` : '/api/ai/generate';
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                productName: formData.name, 
                category: catName,
                details: formData.description,
                sid: sid
            })
        });
        const data = await res.json();
        if (res.ok) {
            handleInputChange('description', data.text);
            toast.success('AI đã tạo mô tả xong!');
        } else {
            toast.error(data.message);
        }
    } catch (e) {
        toast.error('Lỗi khi gọi trợ lý AI');
    } finally {
      setGeneratingAI(false);
    }
  };

  const addVariant = () => {
    setVariants([...variants, { size: '', color: '', stock: 0, price_override: null, sku: '' }]);
    setIsDirty(true);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
    setIsDirty(true);
  };

  const updateVariant = (index: number, field: string, value: any) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    setVariants(newVariants);
    setIsDirty(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return toast.error('Vui lòng nhập tên sản phẩm');
    if (!formData.price) return toast.error('Vui lòng nhập giá sản phẩm');
    if (newImageFiles.length === 0) return toast.error('Vui lòng thêm ít nhất một hình ảnh');

    // Validation cho biến thể
    for (let i = 0; i < variants.length; i++) {
        if (!variants[i].size || !variants[i].color) {
            return toast.error(`Biến thể số ${i + 1} đang thiếu Kích cỡ hoặc Màu sắc`);
        }
    }
    
    setSaving(true);
    const fb = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
        // Luôn gửi slug và sku ngay cả khi rỗng để server xử lý chính xác
        if (key === 'slug' || key === 'sku') {
            fb.append(key, value || '');
        } else if (value !== null && value !== '') {
            fb.append(key, value);
        }
    });
    
    if (!formData.discount_price) fb.append('discount_price', 'null');
    fb.append('variants', JSON.stringify(variants));
    newImageFiles.forEach(file => fb.append('new_images', file));

    try {
      const url = sid ? `/api/admin/products?sid=${sid}` : '/api/admin/products';
      const res = await fetch(url, { method: 'POST', body: fb });
      const data = await res.json();
      if (res.ok) {
        toast.success('Tạo sản phẩm thành công');
        setIsDirty(false);
        router.push(sessionUrl('/admin/products'));
      } else {
        toast.error(data.message || 'Lỗi khi lưu');
      }
    } catch (e) {
      toast.error('Lỗi hệ thống');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto p-12 space-y-10">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 space-y-8">
                <Skeleton className="h-[400px] w-full rounded-[3rem]" />
                <Skeleton className="h-[200px] w-full rounded-[3rem]" />
            </div>
            <div className="lg:col-span-4 space-y-8">
                <Skeleton className="h-[500px] w-full rounded-[3rem]" />
            </div>
        </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20 px-4">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 sticky top-0 bg-white/80 backdrop-blur-md z-40 py-4 -mx-4 px-4 border-b border-gray-100">
        <div className="space-y-1">
            <button 
                onClick={() => isDirty ? (window.confirm('Có thay đổi chưa lưu, vẫn muốn rời trang?') && router.back()) : router.back()} 
                className="flex items-center text-gray-400 hover:text-[#800020] transition-colors font-bold text-xs uppercase tracking-widest gap-2 mb-2 group"
            >
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Quay lại
            </button>
            <div className="flex items-center gap-4">
                <h1 className="text-3xl font-serif font-black text-[#800020] italic truncate max-w-md">
                    Thêm sản phẩm mới
                </h1>
                {isDirty && (
                    <span className="flex items-center gap-1.5 text-[10px] bg-amber-50 text-amber-600 px-3 py-1.5 rounded-full border border-amber-100 font-bold uppercase tracking-wider animate-pulse">
                        <AlertCircle size={10} /> Đang soạn thảo
                    </span>
                )}
            </div>
        </div>
        <div className="flex items-center gap-4">
            <button 
                type="button"
                onClick={handleSave} 
                disabled={saving || !isDirty}
                className={`px-10 py-4 rounded-2xl font-black flex items-center gap-3 shadow-2xl transition-all duration-300 transform active:scale-95
                    ${isDirty 
                        ? 'bg-[#800020] text-[#D4AF37] hover:bg-[#600018] hover:shadow-[#800020]/20' 
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'}
                `}
            >
                {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                XÁC NHẬN TẠO MỚI
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* LEFT COLUMN: Form */}
        <div className="lg:col-span-8 space-y-8">
            <div className="bg-white p-10 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-gray-100">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-[#800020]/5 rounded-lg text-[#800020]"><CheckCircle2 size={22} /></div>
                    <h2 className="text-xl font-serif text-gray-800 font-bold italic">Thông tin định danh & SEO</h2>
                </div>
                
                <div className="space-y-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Tên mẫu Áo Dài</label>
                        <input 
                            type="text" 
                            className="w-full px-7 py-5 bg-gray-50 border-2 border-transparent focus:border-[#800020]/10 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-700 text-lg shadow-inner"
                            value={formData.name}
                            onChange={e => handleInputChange('name', e.target.value)}
                            placeholder="Nhập tên sản phẩm..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                                <Hash size={10} /> Mã định danh (SKU)
                            </label>
                            <input 
                                type="text" 
                                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-[#D4AF37]/20 focus:bg-white rounded-2xl outline-none transition-all font-mono font-bold text-gray-600"
                                value={formData.sku}
                                onChange={e => handleInputChange('sku', e.target.value)}
                                placeholder="AD-XXXX"
                            />
                        </div>
                        <div className="space-y-2 relative">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                                <LinkIcon size={10} /> Đường dẫn SEO (Slug)
                            </label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-[#800020]/20 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-700 pr-24"
                                    value={formData.slug}
                                    onChange={e => handleInputChange('slug', e.target.value)}
                                    placeholder="duong-dan-seo"
                                />
                                <button 
                                    type="button"
                                    onClick={generateSlug}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-white text-[9px] font-black text-[#800020] border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors uppercase tracking-tight"
                                >
                                    Tạo tự động
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Giá bán công khai</label>
                            <div className="relative group">
                                <input 
                                    type="number" 
                                    className="w-full pl-7 pr-16 py-5 bg-gray-50 border-2 border-transparent focus:border-[#800020]/20 focus:bg-white rounded-2xl outline-none transition-all font-black text-gray-800 text-xl shadow-inner appearance-none"
                                    value={formData.price}
                                    onChange={e => handleInputChange('price', e.target.value)}
                                    placeholder="0"
                                />
                                <span className="absolute right-7 top-1/2 -translate-y-1/2 text-gray-300 font-black text-lg">₫</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Giá khuyến mãi</label>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    className="w-full pl-7 pr-16 py-5 bg-red-50/20 border-2 border-transparent focus:border-red-500/20 focus:bg-white rounded-2xl outline-none transition-all font-black text-red-600 text-xl shadow-inner appearance-none"
                                    value={formData.discount_price}
                                    onChange={e => handleInputChange('discount_price', e.target.value)}
                                    placeholder="0"
                                />
                                <span className="absolute right-7 top-1/2 -translate-y-1/2 text-red-100 font-black text-lg">₫</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-10 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-gray-100">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#800020]/5 rounded-lg text-[#800020]"><AlertCircle size={22} /></div>
                        <h2 className="text-xl font-serif text-gray-800 font-bold italic">Mô tả sản phẩm</h2>
                    </div>
                    <button 
                        type="button"
                        onClick={handleAIGenerate}
                        disabled={generatingAI}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#800020] to-purple-800 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
                    >
                        {generatingAI ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                        Gợi ý bởi AI
                    </button>
                </div>
                <textarea 
                    rows={8}
                    className="w-full px-8 py-7 bg-gray-50 border-2 border-transparent focus:border-[#800020]/10 focus:bg-white rounded-[2.5rem] outline-none transition-all font-medium text-gray-600 resize-none leading-relaxed shadow-inner"
                    value={formData.description}
                    onChange={e => handleInputChange('description', e.target.value)}
                    placeholder="Chất liệu, kiểu dáng, ý nghĩa thiết kế..."
                />
            </div>

            {/* VARIANT MANAGEMENT SECTION */}
            <div className="bg-white p-10 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-gray-100">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#800020]/5 rounded-lg text-[#800020]"><Layers size={22} /></div>
                        <h2 className="text-xl font-serif text-gray-800 font-bold italic">Biến thể & Phân loại (Size/Màu)</h2>
                    </div>
                    <button 
                        type="button" 
                        onClick={addVariant}
                        className="flex items-center gap-2 px-4 py-2 bg-[#800020] text-[#D4AF37] rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#600018] transition-all"
                    >
                        <Plus size={14} /> Thêm biến thể
                    </button>
                </div>

                {variants.length === 0 ? (
                    <div className="py-12 text-center border-2 border-dashed border-gray-100 rounded-[2rem] bg-gray-50/50">
                        <p className="text-gray-400 text-sm font-medium">Chưa có biến thể nào. Sản phẩm này sẽ bán theo thông tin chung ở trên.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="grid grid-cols-12 gap-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                            <div className="col-span-3">Kích cỡ (Size)</div>
                            <div className="col-span-3">Màu sắc/Chất liệu</div>
                            <div className="col-span-2">Kho</div>
                            <div className="col-span-3">Giá riêng (₫)</div>
                            <div className="col-span-1 text-right">Xóa</div>
                        </div>
                        {variants.map((v, i) => (
                            <div key={i} className="grid grid-cols-12 gap-4 bg-gray-50/50 p-4 rounded-2xl border border-transparent hover:border-[#800020]/10 hover:bg-white transition-all group animate-in fade-in slide-in-from-left-2 duration-300">
                                <div className="col-span-3">
                                    <input 
                                        type="text" 
                                        placeholder="S, M, May đo..."
                                        className="w-full bg-white px-4 py-2.5 rounded-xl border border-gray-100 outline-none focus:border-[#800020]/20 text-sm font-bold text-gray-700"
                                        value={v.size}
                                        onChange={e => updateVariant(i, 'size', e.target.value)}
                                    />
                                </div>
                                <div className="col-span-3">
                                    <input 
                                        type="text" 
                                        placeholder="Đỏ, Gấm..."
                                        className="w-full bg-white px-4 py-2.5 rounded-xl border border-gray-100 outline-none focus:border-[#800020]/20 text-sm font-bold text-gray-700"
                                        value={v.color}
                                        onChange={e => updateVariant(i, 'color', e.target.value)}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <input 
                                        type="number" 
                                        className="w-full bg-white px-4 py-2.5 rounded-xl border border-gray-100 outline-none focus:border-[#800020]/20 text-sm font-black text-[#800020]"
                                        value={v.stock}
                                        onChange={e => updateVariant(i, 'stock', parseInt(e.target.value) || 0)}
                                    />
                                </div>
                                <div className="col-span-3">
                                    <input 
                                        type="number" 
                                        placeholder="Để trống nếu lấy giá gốc"
                                        className="w-full bg-white px-4 py-2.5 rounded-xl border border-gray-100 outline-none focus:border-[#800020]/20 text-sm font-bold text-gray-500"
                                        value={v.price_override || ''}
                                        onChange={e => updateVariant(i, 'price_override', e.target.value ? parseFloat(e.target.value) : null)}
                                    />
                                </div>
                                <div className="col-span-1 flex justify-end items-center">
                                    <button 
                                        type="button" 
                                        onClick={() => removeVariant(i)}
                                        className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* RIGHT COLUMN: Gallery */}
        <div className="lg:col-span-4 space-y-8">
            <div className="bg-white p-8 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-gray-100 overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-serif text-[#800020] font-bold">Hình ảnh sản phẩm</h2>
                    <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2.5 bg-[#800020] text-white rounded-full hover:scale-110 active:scale-95 transition-all shadow-lg"
                    >
                        <Plus size={18} />
                    </button>
                    <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect} accept="image/*" />
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Tải ảnh lên (Ảnh đầu tiên sẽ là ảnh chính)</label>
                    <div className="grid grid-cols-2 gap-3">
                        {newImagePreviews.map((p, i) => (
                            <div key={`new-${i}`} className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 ${i === 0 ? 'border-[#800020]' : 'border-dashed border-[#D4AF37]/30'} bg-amber-50/20`}>
                                <img src={p} className="w-full h-full object-cover" alt="New" />
                                {i === 0 && (
                                    <div className="absolute top-1 left-1 bg-[#800020] text-[#D4AF37] px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-tighter">
                                        Ảnh chính
                                    </div>
                                )}
                                <button 
                                    type="button"
                                    onClick={() => {
                                        setNewImageFiles(prev => prev.filter((_, idx) => idx !== i));
                                        setNewImagePreviews(prev => prev.filter((_, idx) => idx !== i));
                                    }} 
                                    className="absolute top-1 right-1 p-1 bg-white text-red-500 rounded-md shadow-lg"
                                >
                                    <X size={10} />
                                </button>
                            </div>
                        ))}

                        {/* Upload Slot */}
                        <button 
                            type="button"
                            onClick={() => fileInputRef.current?.click()} 
                            className="aspect-[3/4] rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-300 hover:text-[#800020] hover:border-[#800020] transition-all bg-gray-50/50 group"
                        >
                            <Upload size={18} className="group-hover:-translate-y-1 transition-transform" />
                            <span className="text-[8px] font-bold mt-1 uppercase">Thêm ảnh</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Other settings */}
            <div className="bg-white p-8 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-gray-100 space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Danh mục sản phẩm</label>
                    <select 
                        className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-[#800020]/10 focus:bg-white rounded-2xl outline-none font-bold text-gray-700 appearance-none shadow-inner transition-all"
                        value={formData.category_id}
                        onChange={e => handleInputChange('category_id', e.target.value)}
                    >
                        <option value="">Chọn danh mục</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Tồn kho</label>
                        <input 
                            type="number" 
                            className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-[#800020]/10 focus:bg-white rounded-2xl outline-none font-black text-[#800020] shadow-inner"
                            value={formData.stock}
                            onChange={e => handleInputChange('stock', e.target.value)}
                            placeholder="0"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Trạng thái</label>
                        <select 
                            className={`w-full px-5 py-4 border-2 border-transparent rounded-2xl outline-none font-bold transition-all shadow-inner appearance-none
                                ${formData.is_active === 'true' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400'}
                            `}
                            value={formData.is_active}
                            onChange={e => handleInputChange('is_active', e.target.value)}
                        >
                            <option value="true">Đang bán</option>
                            <option value="false">Tạm ẩn</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
