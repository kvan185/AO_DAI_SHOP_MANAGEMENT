'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Save, 
  Trash2, 
  Star, 
  Plus, 
  X,
  Upload,
  Loader2,
  GripVertical,
  CheckCircle2,
  AlertCircle,
  Hash,
  Link as LinkIcon
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// DND Kit
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- Sortable Item ---
function SortableImage({ img, isPendingDelete, onToggleDelete }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: img.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isPendingDelete ? 0.3 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`relative aspect-[3/4] rounded-2xl overflow-hidden group border border-gray-100 shadow-sm bg-gray-50
        ${isDragging ? 'shadow-2xl ring-2 ring-[#800020]' : 'hover:scale-[1.02]'}
        transition-transform duration-300
      `}
    >
      <img src={img.image_path} className="w-full h-full object-cover" alt="Product" />
      <div 
        {...attributes} {...listeners}
        className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-move"
      >
        <div className="bg-white/40 p-2 rounded-full backdrop-blur-sm">
            <GripVertical className="text-white" size={20} />
        </div>
      </div>
      {img.index === 0 && (
          <div className="absolute top-2 left-2 bg-[#D4AF37] text-[#800020] px-2 py-1 rounded-lg shadow-lg z-20 flex items-center gap-1 text-[8px] font-bold uppercase tracking-widest">
            <Star size={10} fill="currentColor" /> BÌA
          </div>
      )}
      <button 
        type="button"
        onClick={(e) => { e.stopPropagation(); onToggleDelete(img.id); }}
        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg z-30"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}

// --- Skeleton Loader ---
const FormSkeleton = () => (
    <div className="animate-pulse space-y-10">
        <div className="h-8 bg-gray-100 rounded-xl w-48"></div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 space-y-8">
                <div className="h-96 bg-gray-100 rounded-[3rem]"></div>
                <div className="h-64 bg-gray-100 rounded-[3rem]"></div>
            </div>
            <div className="lg:col-span-4 space-y-8">
                <div className="h-80 bg-gray-100 rounded-[3rem]"></div>
                <div className="h-48 bg-gray-100 rounded-[3rem]"></div>
            </div>
        </div>
    </div>
);

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [images, setImages] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  
  const [pendingDeletions, setPendingDeletions] = useState<number[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
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

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  useEffect(() => {
    fetchData();
  }, [params.id]);

  // Alert on unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const fetchData = async () => {
    try {
      const [res, catRes] = await Promise.all([
        fetch(`/api/admin/products/${params.id}`),
        fetch('/api/admin/categories')
      ]);
      const data = await res.json();
      const catData = await catRes.json();
      if (res.ok) {
        setImages(data.images);
        setCategories(catData.categories);
        setFormData({
          name: data.product.name,
          sku: data.product.sku || '',
          slug: data.product.slug || '',
          category_id: data.product.category_id.toString(),
          price: data.product.price.toString(),
          discount_price: data.product.discount_price ? data.product.discount_price.toString() : '',
          stock: data.product.stock.toString(),
          description: data.product.description || '',
          is_active: data.product.is_active.toString()
        });
        setIsDirty(false);
      }
    } catch (e) {
      toast.error('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (event: any) => {
    const {active, over} = event;
    if (active.id !== over.id) {
      setIsDirty(true);
      setImages((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
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

  const handleInputChange = (field: string, value: string) => {
    setIsDirty(true);
    setFormData(prev => ({ ...prev, [field]: value }));
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return toast.error('Vui lòng nhập tên sản phẩm');
    
    setSaving(true);
    const fb = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== '') fb.append(key, value);
    });
    
    // Explicitly handle empty values
    if (!formData.discount_price) fb.append('discount_price', 'null');

    fb.append('delete_image_ids', pendingDeletions.join(','));
    const sortedIds = images.filter(img => !pendingDeletions.includes(img.id)).map(img => img.id);
    fb.append('sorted_image_ids', sortedIds.join(','));
    newImageFiles.forEach(file => fb.append('new_images', file));

    try {
      const res = await fetch(`/api/admin/products/${params.id}`, { method: 'PUT', body: fb });
      const data = await res.json();
      if (res.ok) {
        toast.success('Lưu sản phẩm thành công');
        setIsDirty(false);
        setNewImageFiles([]);
        setNewImagePreviews([]);
        setPendingDeletions([]);
        fetchData();
      } else {
        toast.error(data.message || 'Lỗi khi lưu');
      }
    } catch (e) {
      toast.error('Lỗi hệ thống');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="max-w-7xl mx-auto p-12"><FormSkeleton /></div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20 px-4">
      
      {/* Top Navigation & Status Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 sticky top-0 bg-white/80 backdrop-blur-md z-40 py-4 -mx-4 px-4 border-b border-gray-100">
        <div className="space-y-1">
            <button 
                onClick={() => isDirty ? (window.confirm('Có thay đổi chưa lưu, vẫn muốn rời trang?') && router.back()) : router.back()} 
                className="flex items-center text-gray-400 hover:text-[#800020] transition-colors font-bold text-xs uppercase tracking-widest gap-2 mb-2 group"
            >
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Quay lại danh sách
            </button>
            <div className="flex items-center gap-4">
                <h1 className="text-3xl font-serif font-black text-[#800020] italic truncate max-w-md">
                    {formData.name || 'Sản phẩm mới'}
                </h1>
                {isDirty && (
                    <span className="flex items-center gap-1.5 text-[10px] bg-amber-50 text-amber-600 px-3 py-1.5 rounded-full border border-amber-100 font-bold uppercase tracking-wider animate-pulse">
                        <AlertCircle size={10} /> Chưa lưu
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
                LƯU THAY ĐỔI
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* LEFT COLUMN: Main Information (8/12) */}
        <div className="lg:col-span-8 space-y-8">
            <div className="bg-white p-10 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-gray-100 group">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-[#800020]/5 rounded-lg text-[#800020]"><CheckCircle2 size={22} /></div>
                    <h2 className="text-xl font-serif text-gray-800 font-bold italic">Thông tin định danh & SEO</h2>
                </div>
                
                <div className="grid grid-cols-1 gap-8">
                    <div className="space-y-2 group">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 group-focus-within:text-[#800020] transition-colors">Tên mẫu Áo Dài</label>
                        <input 
                            type="text" 
                            className="w-full px-7 py-5 bg-gray-50 border-2 border-transparent focus:border-[#800020]/10 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-700 text-lg shadow-inner"
                            value={formData.name}
                            onChange={e => handleInputChange('name', e.target.value)}
                            placeholder="Ví dụ: Phượng Hoàng Lửa"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                    <div className="space-y-2 group">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                            <Hash size={10} /> Mã định danh (SKU)
                        </label>
                        <input 
                            type="text" 
                            className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-[#D4AF37]/20 focus:bg-white rounded-2xl outline-none transition-all font-mono font-bold text-gray-600"
                            value={formData.sku}
                            onChange={e => handleInputChange('sku', e.target.value)}
                            placeholder="AD-PH-001"
                        />
                    </div>
                    <div className="space-y-2 group relative">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                            <LinkIcon size={10} /> Đường dẫn SEO (Slug)
                        </label>
                        <div className="relative">
                            <input 
                                type="text" 
                                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-[#800020]/20 focus:bg-white rounded-2xl outline-none transition-all font-medium text-gray-500 pr-24"
                                value={formData.slug}
                                onChange={e => handleInputChange('slug', e.target.value)}
                                placeholder="ao-dai-phuong-hoang-lua"
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

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Giá bán công khai</label>
                        <div className="relative group">
                            <input 
                                type="number" 
                                className="w-full pl-7 pr-16 py-5 bg-gray-50 border-2 border-transparent focus:border-[#800020]/20 focus:bg-white rounded-2xl outline-none transition-all font-black text-gray-800 text-xl shadow-inner appearance-none"
                                value={formData.price}
                                onChange={e => handleInputChange('price', e.target.value)}
                            />
                            <span className="absolute right-7 top-1/2 -translate-y-1/2 text-gray-300 font-black text-lg">₫</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Giá khuyến mãi (Nêu có)</label>
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

            <div className="bg-white p-10 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-gray-100">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-[#800020]/5 rounded-lg text-[#800020]"><AlertCircle size={22} /></div>
                    <h2 className="text-xl font-serif text-gray-800 font-bold italic">Mô tả tinh phẩm</h2>
                </div>
                <textarea 
                    rows={10}
                    className="w-full px-8 py-7 bg-gray-50 border-2 border-transparent focus:border-[#800020]/10 focus:bg-white rounded-[2.5rem] outline-none transition-all font-medium text-gray-600 resize-none leading-relaxed shadow-inner"
                    value={formData.description}
                    onChange={e => handleInputChange('description', e.target.value)}
                    placeholder="Chất liệu, đường may, ý nghĩa thiết kế..."
                />
            </div>
        </div>

        {/* RIGHT COLUMN: Gallery & Categorization (4/12) */}
        <div className="lg:col-span-4 space-y-8">
            <div className="bg-white p-10 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-gray-100">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-serif text-[#800020] font-bold">Bộ sưu tập ảnh</h2>
                    <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-10 h-10 flex items-center justify-center bg-[#800020] text-white rounded-full hover:scale-110 active:scale-95 transition-all shadow-lg"
                    >
                        <Plus size={20} />
                    </button>
                    <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect} accept="image/*" />
                </div>

                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={images.map(i => i.id)} strategy={rectSortingStrategy}>
                        <div className="grid grid-cols-2 gap-5">
                            {images.map((img, index) => (
                                <SortableImage 
                                    key={img.id} 
                                    img={{ ...img, index }} 
                                    isPendingDelete={pendingDeletions.includes(img.id)}
                                    onToggleDelete={(id: number) => {
                                        setIsDirty(true);
                                        setPendingDeletions(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
                                    }}
                                />
                            ))}
                            {newImagePreviews.map((p, i) => (
                                <div key={`new-${i}`} className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-dashed border-[#D4AF37]/30 group">
                                    <img src={p} className="w-full h-full object-cover opacity-60" alt="New" />
                                    <div className="absolute inset-0 flex items-center justify-center bg-[#D4AF37]/5">
                                        <Loader2 className="animate-spin text-[#D4AF37]" size={20} />
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            setNewImageFiles(prev => prev.filter((_, idx) => idx !== i));
                                            setNewImagePreviews(prev => prev.filter((_, idx) => idx !== i));
                                        }} 
                                        className="absolute top-2 right-2 p-1.5 bg-white text-red-500 rounded-lg shadow-xl"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                            <button 
                                type="button"
                                onClick={() => fileInputRef.current?.click()} 
                                className="aspect-[3/4] rounded-2xl bg-gray-50 border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-gray-300 hover:text-[#800020] hover:border-[#800020] transition-all group"
                            >
                                <Upload size={24} className="group-hover:-translate-y-1 transition-transform" />
                            </button>
                        </div>
                    </SortableContext>
                </DndContext>
            </div>

            <div className="bg-white p-10 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-gray-100 space-y-8">
                <div className="space-y-4">
                    <div className="space-y-2 group">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 font-serif">Phân loại danh mục</label>
                        <div className="relative">
                            <select 
                                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-[#800020]/10 focus:bg-white rounded-2xl outline-none font-bold text-gray-700 appearance-none transition-all shadow-inner"
                                value={formData.category_id}
                                onChange={e => handleInputChange('category_id', e.target.value)}
                            >
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"><Plus size={14} /></div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Tồn kho</label>
                        <input 
                            type="number" 
                            className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-[#800020]/10 focus:bg-white rounded-2xl outline-none font-black text-[#800020] shadow-inner"
                            value={formData.stock}
                            onChange={e => handleInputChange('stock', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Cửa hàng</label>
                        <select 
                            className={`w-full px-5 py-4 border-2 border-transparent rounded-2xl outline-none font-bold transition-all shadow-inner appearance-none
                                ${formData.is_active === 'true' ? 'bg-green-50/50 text-green-700 focus:border-green-200' : 'bg-gray-50 text-gray-500 focus:border-gray-200'}
                            `}
                            value={formData.is_active}
                            onChange={e => handleInputChange('is_active', e.target.value)}
                        >
                            <option value="true">Hiện</option>
                            <option value="false">Ẩn</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
