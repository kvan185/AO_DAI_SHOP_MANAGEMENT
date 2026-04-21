'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from '@/hooks/useSession';
import { Package, Clock, CreditCard, ChevronRight, ShoppingBag } from 'lucide-react';

export default function OrderHistoryPage() {
  const { sid, sessionUrl } = useSession();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const url = sid ? `/api/orders/history?sid=${sid}` : '/api/orders/history';
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders);
        } else if (res.status === 401) {
          window.location.href = sessionUrl('/login');
        }
      } catch (err) {
        console.error('Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [sid]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'processing': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'shipped': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'delivered': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'cancelled': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: any = {
      'pending': 'Chờ xác nhận',
      'processing': 'Đang chuẩn bị',
      'shipped': 'Đang vận chuyển',
      'delivered': 'Đã giao hàng',
      'cancelled': 'Đã hủy'
    };
    return statusMap[status.toLowerCase()] || status;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9F6F0]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#800020]"></div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#F9F6F0] py-16 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-4">
              <nav className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 flex items-center gap-2">
                  <Link href={sessionUrl("/")} className="hover:text-[#800020] transition-colors">Trang chủ</Link>
                  <span className="w-1 h-1 bg-gray-300 rounded-full" />
                  <Link href={sessionUrl("/profile")} className="hover:text-[#800020] transition-colors">Tài khoản</Link>
              </nav>
              <h1 className="text-4xl md:text-5xl font-serif italic text-gray-900 tracking-tight">Lịch sử đơn hàng</h1>
          </div>
          <Link 
            href={sessionUrl("/")} 
            className="group flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#800020] hover:translate-x-2 transition-transform duration-500"
          >
            Tiếp tục mua sắm <ChevronRight size={16} />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-24 text-center shadow-[0_40px_100px_rgba(0,0,0,0.03)] border border-gray-50 animate-in fade-in zoom-in duration-700">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 text-[#800020]/20">
                <ShoppingBag size={48} strokeWidth={1} />
            </div>
            <h2 className="text-2xl font-serif italic text-gray-400 mb-8">Bạn chưa có đơn hàng nào trong hành trình này</h2>
            <Link 
                href={sessionUrl("/")} 
                className="inline-block bg-[#800020] text-[#D4AF37] px-10 py-4 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all"
            >
                Khám phá bộ sưu tập ngay
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.03)] overflow-hidden border border-gray-50 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Mã đơn hàng</th>
                    <th className="px-6 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-center">Ngày đặt</th>
                    <th className="px-6 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Tổng thanh toán</th>
                    <th className="px-6 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-center">Trạng thái</th>
                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.map((order: any) => (
                    <tr key={order.id} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="px-10 py-8">
                          <div className="flex items-center gap-4">
                              <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-[#800020]/5 group-hover:text-[#800020] transition-colors">
                                  <Package size={20} />
                              </div>
                              <span className="font-black text-sm tracking-tighter text-gray-800 uppercase">#OD{order.id.toString().padStart(6, '0')}</span>
                          </div>
                      </td>
                      <td className="px-6 py-8 text-center">
                          <div className="flex flex-col items-center">
                              <span className="text-sm font-bold text-gray-600">{new Date(order.created_at).toLocaleDateString('vi-VN')}</span>
                              <span className="text-[10px] text-gray-300 font-bold uppercase tracking-tighter">{new Date(order.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                      </td>
                      <td className="px-6 py-8 text-right">
                        <span className="text-lg font-serif font-black text-[#800020]">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total_amount)}
                        </span>
                      </td>
                      <td className="px-6 py-8 text-center">
                        <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <button className="px-6 py-3 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#800020] hover:border-[#800020] hover:shadow-xl transition-all">
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        <div className="mt-16 text-center">
            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em] max-w-md mx-auto">
                Nếu có bất kỳ thắc mắc nào về đơn hàng, vui lòng liên hệ nghệ nhân của chúng tôi qua hotline 0900 123 456
            </p>
        </div>
      </div>
    </main>
  );
}
