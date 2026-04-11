'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders/history');
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders);
        } else if (res.status === 401) {
          window.location.href = '/login';
        }
      } catch (err) {
        console.error('Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'shipped': return 'bg-purple-100 text-purple-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: any = {
      'pending': 'Chờ xử lý',
      'processing': 'Đang thực hiện',
      'shipped': 'Đang giao hàng',
      'delivered': 'Đã hoàn thành',
      'cancelled': 'Đã hủy'
    };
    return statusMap[status.toLowerCase()] || status;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#800020]"></div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#F8F8FF] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-serif text-gray-800">Lịch Sử Đặt Hàng</h1>
          <Link href="/" className="text-[#800020] hover:underline text-sm font-semibold">Tiếp tục mua sắm</Link>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-20 text-center shadow-sm border border-gray-100">
            <div className="text-6xl mb-6">📦</div>
            <h2 className="text-xl font-medium text-gray-600 mb-6">Bạn chưa có đơn hàng nào</h2>
            <Link href="/" className="bg-[#800020] text-[#D4AF37] px-8 py-3 rounded-full font-bold shadow-lg">KHÁM PHÁ CÁC MẪU ÁO DÀI</Link>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-8 py-5 text-sm font-bold text-gray-400 uppercase tracking-widest">Mã đơn</th>
                    <th className="px-6 py-5 text-sm font-bold text-gray-400 uppercase tracking-widest">Ngày đặt</th>
                    <th className="px-6 py-5 text-sm font-bold text-gray-400 uppercase tracking-widest">Tổng tiền</th>
                    <th className="px-6 py-5 text-sm font-bold text-gray-400 uppercase tracking-widest">Trạng thái</th>
                    <th className="px-8 py-5 text-sm font-bold text-gray-400 uppercase tracking-widest">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order: any) => (
                    <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-8 py-6 font-bold text-[#800020]">#OD{order.id.toString().padStart(6, '0')}</td>
                      <td className="px-6 py-6 text-gray-600">{new Date(order.created_at).toLocaleDateString('vi-VN')}</td>
                      <td className="px-6 py-6 font-bold text-gray-800">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total_amount)}
                      </td>
                      <td className="px-6 py-6">
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <button className="text-sm font-bold text-blue-600 hover:underline">Chi tiết</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
