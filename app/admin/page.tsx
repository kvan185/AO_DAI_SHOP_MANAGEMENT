'use client';
import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  UserPlus, 
  AlertTriangle,
  Clock,
  ChevronRight,
  Plus
} from 'lucide-react';
import DashboardChart from '@/components/admin/DashboardChart';
import Link from 'next/link';
import { useSession } from '@/hooks/useSession';

export default function AdminDashboard() {
  const { sid, sessionUrl } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = sid ? `?sid=${sid}` : '';
    fetch(`/api/admin/stats${q}`)
      .then(res => {
        if (res.status === 401 || res.status === 403) throw new Error('Unauthorized');
        if (!res.ok) throw new Error('ServerError');
        return res.json();
      })
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error('Stats fetch failed:', err);
        if (err.message === 'Unauthorized') {
            window.location.href = sessionUrl('/login');
        } else {
            // Hiển thị giao diện rỗng hoặc báo lỗi kết nối thay vì đá văng
            setData({ stats: {}, chartData: [], recentOrders: [] });
            setLoading(false);
        }
      });
  }, [sid]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#800020]"></div>
    </div>
  );

  const stats = [
    { name: 'Tổng doanh thu', value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data.stats.totalRevenue), icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { name: 'Đơn hàng mới', value: data.stats.newOrders, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'Khách hàng', value: data.stats.totalCustomers, icon: UserPlus, color: 'text-purple-600', bg: 'bg-purple-50' },
    { name: 'Sắp hết hàng', value: data.stats.lowStockCount, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-serif text-[#800020] mb-2 uppercase tracking-widest">Tổng quan Dashboard</h1>
          <p className="text-gray-500 text-sm">Chào mừng trở lại. Dưới đây là hiệu suất kinh doanh của shop hôm nay.</p>
        </div>
        <div className="hidden md:block">
            <span className="text-xs font-bold text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-100 flex items-center">
                <Clock className="w-3 h-3 mr-2" />
                Dữ liệu thời gian thực
            </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">Tháng này</span>
            </div>
            <p className="text-gray-500 text-sm font-medium mb-1">{stat.name}</p>
            <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-gray-800">Biểu đồ doanh thu</h2>
            <div className="flex items-center gap-2">
                <button className="px-3 py-1 bg-gray-50 text-[10px] font-black text-gray-400 rounded-lg hover:text-[#800020] transition-colors">NGÀY</button>
                <button className="px-3 py-1 bg-[#800020]/5 text-[10px] font-black text-[#800020] rounded-lg">THÁNG</button>
                <button className="px-3 py-1 bg-gray-50 text-[10px] font-black text-gray-400 rounded-lg hover:text-[#800020] transition-colors">NĂM</button>
            </div>
          </div>
          <DashboardChart data={data.chartData} />
          
          <div className="mt-10 grid grid-cols-2 gap-4 border-t border-gray-50 pt-8">
              <div className="space-y-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sản phẩm bán chạy nhất</p>
                  <p className="text-sm font-bold text-gray-800">{data.stats.topProduct || 'N/A'}</p>
              </div>
              <div className="space-y-1 text-right">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tỷ lệ hoàn đơn</p>
                  <p className="text-sm font-bold text-red-500">{data.stats.returnRate || '0'}%</p>
              </div>
          </div>
        </div>

        {/* Right Section: Orders & Coupons */}
        <div className="space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-bold text-gray-800">Đơn hàng mới nhất</h2>
                <Link href={sessionUrl("/admin/orders")} className="text-[#800020] text-xs font-bold hover:underline flex items-center">
                  Tất cả <ChevronRight className="w-3 h-3 ml-1" />
                </Link>
              </div>
              <div className="space-y-6">
                {data.recentOrders.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between group cursor-pointer" onClick={() => window.location.href=sessionUrl(`/admin/orders/${order.id}`)}>
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-xs font-black text-[#800020] group-hover:bg-[#800020] group-hover:text-white transition-all shadow-sm">
                        {order.fullname?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800 line-clamp-1 group-hover:text-[#800020] transition-colors">{order.fullname || 'Ẩm danh'}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">#{order.id} • {new Date(order.created_at).toLocaleDateString('vi-VN')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-gray-800">
                        {new Intl.NumberFormat('vi-VN').format(order.total_price)}đ
                      </p>
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest
                        ${order.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}
                      `}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions / Coupons Banner */}
            <div className="bg-gradient-to-br from-[#800020] to-[#600018] p-8 rounded-3xl shadow-xl text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                <h3 className="text-xl font-serif italic font-black mb-2 relative z-10">Khuyến mãi & Marketing</h3>
                <p className="text-white/60 text-xs mb-6 relative z-10">Tạo mã giảm giá để thu hút khách hàng quay lại Shop.</p>
                <Link 
                    href={sessionUrl("/admin/coupons")} 
                    className="inline-flex items-center gap-2 bg-[#D4AF37] text-[#800020] px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-white transition-all"
                >
                    <Plus size={14} /> Quản lý Coupon
                </Link>
            </div>
        </div>
      </div>
    </div>
  );
}
