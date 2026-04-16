'use client';
import React, { useEffect, useState } from 'react';
import { 
  Ticket, 
  Plus, 
  Trash2, 
  Calendar, 
  Infinity, 
  Search,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useSession } from '@/hooks/useSession';

export default function AdminCouponsPage() {
  const { sid } = useSession();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percent',
    discount_value: '',
    min_order_value: '0',
    start_date: '',
    end_date: '',
    usage_limit: ''
  });

  const fetchCoupons = async () => {
    try {
      const q = sid ? `?sid=${sid}` : '';
      const res = await fetch(`/api/admin/coupons${q}`);
      if (res.ok) {
        const data = await res.json();
        setCoupons(data.coupons);
      }
    } catch (e) {
      toast.error('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, [sid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const q = sid ? `?sid=${sid}` : '';
      const res = await fetch(`/api/admin/coupons${q}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        toast.success('Đã tạo mã giảm giá');
        setIsModalOpen(false);
        setFormData({
          code: '',
          discount_type: 'percent',
          discount_value: '',
          min_order_value: '0',
          start_date: '',
          end_date: '',
          usage_limit: ''
        });
        fetchCoupons();
      } else {
        const data = await res.json();
        toast.error(data.message);
      }
    } catch (e) {
      toast.error('Lỗi hệ thống');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-[#800020] w-10 h-10" />
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif text-[#800020] font-black italic uppercase tracking-widest">Mã Giảm Giá</h1>
          <p className="text-gray-500 text-sm italic">Quản lý các chương trình ưu đãi và khuyến mãi.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[#800020] text-[#D4AF37] rounded-2xl font-black text-sm uppercase tracking-tighter hover:bg-[#600018] shadow-xl transition-all active:scale-95"
        >
          <Plus size={18} /> Tạo mã mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((coupon) => (
          <div key={coupon.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-xl transition-all group relative overflow-hidden">
             <div className="absolute -right-4 -top-4 w-20 h-20 bg-[#800020]/5 rounded-full -rotate-12 group-hover:scale-150 transition-transform"></div>
             
             <div className="flex justify-between items-start relative z-10">
                <div className="p-3 bg-amber-50 text-[#800020] rounded-2xl">
                    <Ticket size={24} />
                </div>
                <div className="text-right">
                    <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest
                        ${coupon.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}
                    `}>
                        {coupon.is_active ? 'Đang hoạt động' : 'Tạm dừng'}
                    </span>
                </div>
             </div>

             <div className="mt-6 space-y-2">
                <h3 className="text-xl font-mono font-black text-gray-800 tracking-tighter group-hover:text-[#800020] transition-colors">{coupon.code}</h3>
                <p className="text-2xl font-black text-[#800020]">
                    {coupon.discount_type === 'percent' ? `${coupon.discount_value}%` : `${new Intl.NumberFormat('vi-VN').format(coupon.discount_value)}đ`}
                    <span className="text-[10px] text-gray-400 ml-2 font-bold uppercase">Giảm giá</span>
                </p>
             </div>

             <div className="mt-6 pt-6 border-t border-dashed border-gray-100 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                    <AlertCircle size={14} className="text-[#800020]" />
                    Tối thiểu đơn: <span className="text-gray-800">{new Intl.NumberFormat('vi-VN').format(coupon.min_order_value)}đ</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                    <Calendar size={14} className="text-[#800020]" />
                    HSD: <span className="text-gray-800">{coupon.end_date ? new Date(coupon.end_date).toLocaleDateString('vi-VN') : 'Vô thời hạn'}</span>
                </div>
                <div className="flex items-center justify-between mt-4">
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Đã dùng: {coupon.used_count} / {coupon.usage_limit || '∞'}
                    </div>
                </div>
             </div>
          </div>
        ))}
      </div>

      {coupons.length === 0 && (
          <div className="py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
              <Ticket size={48} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-400 font-serif italic">Chưa có mã giảm giá nào được tạo.</p>
          </div>
      )}

      {/* Modal - Create Coupon */}
      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
              <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
                  <div className="bg-[#800020] p-8 text-white relative">
                      <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-white/60 hover:text-white transition-colors">
                          <X size={24} />
                      </button>
                      <h2 className="text-2xl font-serif font-black italic">Tạo Mã Giảm Giá Mới</h2>
                      <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1">Thiết lập ưu đãi cho khách hàng.</p>
                  </div>

                  <form onSubmit={handleSubmit} className="p-10 space-y-6">
                      <div className="space-y-1">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mã giảm giá (Code)</label>
                          <input 
                              type="text" 
                              required
                              className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-[#800020]/20 rounded-2xl outline-none font-black text-gray-800 transition-all uppercase"
                              value={formData.code}
                              onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                              placeholder="SUMMER2024"
                          />
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-1">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Loại giảm giá</label>
                              <select 
                                  className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-[#800020]/20 rounded-2xl outline-none font-bold text-gray-700 appearance-none"
                                  value={formData.discount_type}
                                  onChange={e => setFormData({...formData, discount_type: e.target.value})}
                              >
                                  <option value="percent">Phần trăm (%)</option>
                                  <option value="fixed">Số tiền mặt (đ)</option>
                              </select>
                          </div>
                          <div className="space-y-1">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Giá trị giảm</label>
                              <input 
                                  type="number" 
                                  required
                                  className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-[#800020]/20 rounded-2xl outline-none font-black text-[#800020] transition-all"
                                  value={formData.discount_value}
                                  onChange={e => setFormData({...formData, discount_value: e.target.value})}
                              />
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-1">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Đơn hàng tối thiểu (₫)</label>
                              <input 
                                  type="number" 
                                  className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-[#800020]/20 rounded-2xl outline-none font-bold text-gray-600"
                                  value={formData.min_order_value}
                                  onChange={e => setFormData({...formData, min_order_value: e.target.value})}
                              />
                          </div>
                          <div className="space-y-1">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Lượt dùng tối đa</label>
                              <input 
                                  type="number" 
                                  placeholder="Vô hạn"
                                  className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-[#800020]/20 rounded-2xl outline-none font-bold text-gray-600"
                                  value={formData.usage_limit}
                                  onChange={e => setFormData({...formData, usage_limit: e.target.value})}
                              />
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-1">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Ngày bắt đầu</label>
                              <input 
                                  type="date" 
                                  className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-[#800020]/20 rounded-2xl outline-none font-bold text-gray-600"
                                  value={formData.start_date}
                                  onChange={e => setFormData({...formData, start_date: e.target.value})}
                              />
                          </div>
                          <div className="space-y-1">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Ngày kết thúc</label>
                              <input 
                                  type="date" 
                                  className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-[#800020]/20 rounded-2xl outline-none font-bold text-gray-600"
                                  value={formData.end_date}
                                  onChange={e => setFormData({...formData, end_date: e.target.value})}
                              />
                          </div>
                      </div>

                      <button 
                          type="submit"
                          className="w-full py-5 bg-[#800020] text-[#D4AF37] rounded-3xl font-black uppercase tracking-widest shadow-2xl hover:scale-[1.02] transition-all transform active:scale-95 mt-4"
                      >
                          Lưu Voucher
                      </button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
}
