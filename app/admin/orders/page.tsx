'use client';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders');
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
  }, []);

  const updateStatus = async (orderId: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        toast.success('Cập nhật trạng thái thành công');
        fetchOrders();
      }
    } catch (e) {
      toast.error('Lỗi khi cập nhật trạng thái');
    }
  };

  if (loading) return <div className="p-20 text-center">Đang tải...</div>;

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-serif text-[#800020] mb-8">Quản Lý Đơn Hàng</h1>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-6 py-4 font-bold text-gray-600">ID</th>
                <th className="px-6 py-4 font-bold text-gray-600">Khách hàng</th>
                <th className="px-6 py-4 font-bold text-gray-600">Tổng tiền</th>
                <th className="px-6 py-4 font-bold text-gray-600">Thanh toán</th>
                <th className="px-6 py-4 font-bold text-gray-600">Ngày đặt</th>
                <th className="px-6 py-4 font-bold text-gray-600">Trạng thái</th>
                <th className="px-6 py-4 font-bold text-gray-600">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: any) => (
                <tr key={order.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold">#OD{order.id}</td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-800">{order.fullname || 'Ẩm danh'}</p>
                    <p className="text-xs text-gray-500">{order.phone}</p>
                  </td>
                  <td className="px-6 py-4 font-bold text-[#800020]">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total_price)}
                  </td>
                  <td className="px-6 py-4 text-sm">{order.payment_method}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleString('vi-VN')}
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className={`text-xs font-bold px-3 py-1 rounded-full outline-none cursor-pointer
                        ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : ''}
                        ${order.status === 'confirmed' ? 'bg-blue-100 text-blue-700' : ''}
                        ${order.status === 'shipping' ? 'bg-purple-100 text-purple-700' : ''}
                        ${order.status === 'completed' ? 'bg-green-100 text-green-700' : ''}
                        ${order.status === 'cancelled' ? 'bg-red-100 text-red-700' : ''}
                      `}
                    >
                      <option value="pending">Chờ xác nhận</option>
                      <option value="confirmed">Đã xác nhận</option>
                      <option value="shipping">Đang giao</option>
                      <option value="completed">Hoàn thành</option>
                      <option value="cancelled">Đã hủy</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                     <button className="text-blue-600 hover:underline text-sm">Chi tiết</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
