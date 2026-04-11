'use client';
import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  UserPlus, 
  AlertTriangle,
  ArrowRight,
  Clock
} from 'lucide-react';
import DashboardChart from '@/components/admin/DashboardChart';
import Link from 'next/link';

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      });
  }, []);

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
            <select className="text-xs bg-gray-50 border-none rounded-lg px-3 py-2 outline-none">
              <option>6 tháng gần nhất</option>
              <option>Năm nay</option>
            </select>
          </div>
          <DashboardChart data={data.chartData} />
        </div>

        {/* Recent Orders Section */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-gray-800">Đơn hàng mới nhất</h2>
            <Link href="/admin/orders" className="text-[#800020] text-xs font-bold hover:underline flex items-center">
              Xem tất cả <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </div>
          <div className="space-y-6">
            {data.recentOrders.map((order: any) => (
              <div key={order.id} className="flex items-center justify-between group">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500 group-hover:bg-[#800020] group-hover:text-white transition-colors">
                    {order.fullname?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800 line-clamp-1">{order.fullname || 'Ẩm danh'}</p>
                    <p className="text-[10px] text-gray-400 font-medium">#OD{order.id} • {new Date(order.created_at).toLocaleDateString('vi-VN')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[#800020]">
                    {new Intl.NumberFormat('vi-VN').format(order.total_price)}đ
                  </p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize
                    ${order.status === 'pending' ? 'bg-yellow-50 text-yellow-600' : 'bg-green-50 text-green-600'}
                  `}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
