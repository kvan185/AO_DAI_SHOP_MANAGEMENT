'use client';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useSession } from '@/hooks/useSession';
import { Search, Eye, Filter, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminOrdersPage() {
  const { sid, sessionUrl } = useSession();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchOrders = async () => {
    try {
      const q = sid ? `?sid=${sid}` : '';
      const res = await fetch(`/api/admin/orders${q}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders);
      }
    } catch (e) {
      toast.error('Lỗi khi tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [sid]);

  const updateStatus = async (orderId: number, newStatus: string) => {
    try {
      const q = sid ? `?sid=${sid}` : '';
      const res = await fetch(`/api/admin/orders/${orderId}${q}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        toast.success('Cập nhật trạng thái thành công');
        fetchOrders();
      } else {
          toast.error('Lỗi cập nhật');
      }
    } catch (e) {
      toast.error('Lỗi khi cập nhật trạng thái');
    }
  };

  if (loading && orders.length === 0) return (
    <div className="p-20 text-center animate-pulse">
        <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Loader2 className="animate-spin text-gray-400" size={32} />
        </div>
        <p className="text-gray-400 font-serif italic text-xl">Đang tải danh sách đơn hàng...</p>
    </div>
  );

  const filteredOrders = orders.filter((o: any) => 
    o.id.toString().includes(search) || 
    (o.fullname && o.fullname.toLowerCase().includes(search.toLowerCase())) ||
    o.phone.includes(search)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-serif text-[#800020] font-black italic uppercase tracking-widest leading-tight">Quản Lý Đơn Hàng</h1>
          <p className="text-gray-500 text-sm font-medium italic">Order Fulfillment Tracking System</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-gray-100 items-center">
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#800020] transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Tìm theo mã đơn, sđt, khách hàng..." 
            className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-2xl outline-none text-sm focus:ring-4 focus:ring-[#800020]/5 transition-all font-bold text-gray-700"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-end text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] px-4">
            Total {filteredOrders.length} Orders Found
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[3rem] shadow-[0_30px_60px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Mã Đơn</th>
                <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Khách hàng</th>
                <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Tổng tiền</th>
                <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Ngày đặt</th>
                <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Trạng thái</th>
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredOrders.map((order: any) => (
                <tr key={order.id} className="group hover:bg-gray-50/50 transition-all duration-300">
                  <td className="px-10 py-6">
                    <span className="text-[14px] text-[#800020] font-black uppercase tracking-[0.1em] bg-[#800020]/5 inline-block px-3 py-1 rounded-lg">
                        #OD{order.id}
                    </span>
                  </td>
                  <td className="px-6 py-6">
                    <p className="font-bold text-gray-800 font-serif italic">{order.fullname || 'Khách vãng lai'}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{order.phone}</p>
                  </td>
                  <td className="px-6 py-6 font-black text-[#800020] text-lg">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total_price)}
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest block font-medium">{order.payment_method}</p>
                  </td>
                  <td className="px-6 py-6">
                    <span className="text-xs text-gray-500 font-medium">
                        {new Date(order.created_at).toLocaleString('vi-VN')}
                    </span>
                  </td>
                  <td className="px-6 py-6">
                    <select 
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className={`text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-[0.1em] outline-none cursor-pointer appearance-none text-center
                        ${order.status === 'pending' ? 'bg-yellow-50 text-yellow-600 border border-yellow-200' : ''}
                        ${order.status === 'confirmed' ? 'bg-blue-50 text-blue-600 border border-blue-200' : ''}
                        ${order.status === 'shipping' ? 'bg-purple-50 text-purple-600 border border-purple-200' : ''}
                        ${order.status === 'completed' ? 'bg-green-50 text-green-600 border border-green-200' : ''}
                        ${order.status === 'cancelled' ? 'bg-red-50 text-red-600 border border-red-200' : ''}
                      `}
                    >
                      <option value="pending">Chờ xác nhận</option>
                      <option value="confirmed">Đã xác nhận</option>
                      <option value="shipping">Đang giao</option>
                      <option value="completed">Hoàn thành</option>
                      <option value="cancelled">Đã hủy</option>
                    </select>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex items-center justify-end">
                        <Link 
                          href={sessionUrl(`/admin/orders/${order.id}`)}
                          className="p-3.5 text-gray-400 hover:text-[#800020] hover:bg-[#800020]/5 rounded-2xl transition-all shadow-sm bg-white border border-transparent hover:border-[#800020]/10"
                          title="Chi tiết đơn hàng"
                        >
                            <Eye size={18} />
                        </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredOrders.length === 0 && (
            <div className="p-20 text-center">
                <p className="text-gray-300 font-serif italic text-2xl">Không có đơn hàng nào</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
