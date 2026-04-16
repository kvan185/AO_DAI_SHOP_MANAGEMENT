'use client';
import React, { useEffect, useState } from 'react';
import { 
  FileBox, 
  Download, 
  Calendar, 
  TrendingUp, 
  CreditCard,
  Hash
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useSession } from '@/hooks/useSession';

export default function AdminReports() {
  const { sid } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  // Date state (default to current month)
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const q = sid ? `&sid=${sid}` : '';
      const res = await fetch(`/api/admin/reports?startDate=${startDate}&endDate=${endDate}${q}`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      toast.error('Lỗi khi tải báo cáo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [sid]);

  const handleExport = () => {
      // Basic CSV export logic
      const headers = ['Mã đơn', 'Khách hàng', 'Tổng tiền', 'Ngày đặt', 'PT Thanh toán'];
      const rows = data.orders.map((o: any) => [
          `#OD${o.id}`,
          o.fullname,
          o.total_price,
          new Date(o.created_at).toLocaleDateString(),
          o.payment_method
      ]);
      
      const csvContent = "data:text/csv;charset=utf-8," 
          + headers.join(",") + "\n"
          + rows.map((r: any) => r.join(",")).join("\n");
          
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Bao_cao_doanh_thu_${startDate}_to_${endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  if (loading && !data) return <div className="p-20 text-center">Đang tải báo cáo...</div>;

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-serif text-[#800020] uppercase tracking-widest leading-tight">Báo cáo doanh thu</h1>
          <p className="text-gray-500 text-sm italic font-medium">Phân tích dữ liệu kinh doanh theo thời gian thực.</p>
        </div>
        <button 
          onClick={handleExport}
          disabled={!data}
          className="bg-white border-2 border-[#800020] text-[#800020] px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50"
        >
          <Download size={20} /> XUẤT FILE BÁO CÁO
        </button>
      </div>

      {/* Date Filter Bar */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-end gap-6">
        <div className="flex-grow space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Từ ngày</label>
            <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="date" 
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl outline-none text-sm focus:ring-2 focus:ring-[#800020]/20"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                />
            </div>
        </div>
        <div className="flex-grow space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Đến ngày</label>
            <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="date" 
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl outline-none text-sm focus:ring-2 focus:ring-[#800020]/20"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                />
            </div>
        </div>
        <button 
          onClick={fetchReport}
          className="bg-[#800020] text-[#D4AF37] px-8 py-3.5 rounded-2xl font-bold shadow-lg hover:bg-[#600018] transition-all"
        >
          LỌC DỮ LIỆU
        </button>
      </div>

      {data && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-[#800020] to-[#600018] p-8 rounded-3xl shadow-xl text-white">
                <div className="p-3 bg-white/10 rounded-2xl w-fit mb-6">
                    <TrendingUp size={24} className="text-[#D4AF37]" />
                </div>
                <p className="text-white/60 text-sm font-medium mb-1 uppercase tracking-wider">Tổng doanh thu kỳ</p>
                <h3 className="text-3xl font-serif font-bold text-[#D4AF37]">
                    {new Intl.NumberFormat('vi-VN').format(data.summary.totalRevenue)}đ
                </h3>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <div className="p-3 bg-blue-50 rounded-2xl w-fit mb-6">
                    <Hash size={24} className="text-blue-600" />
                </div>
                <p className="text-gray-400 text-sm font-medium mb-1 uppercase tracking-wider">Số lượng đơn hàng</p>
                <h3 className="text-3xl font-bold text-gray-800">{data.summary.orderCount} đơn</h3>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <div className="p-3 bg-purple-50 rounded-2xl w-fit mb-6">
                    <CreditCard size={24} className="text-purple-600" />
                </div>
                <p className="text-gray-400 text-sm font-medium mb-1 uppercase tracking-wider">Giá trị trung bình</p>
                <h3 className="text-3xl font-bold text-gray-800">
                    {new Intl.NumberFormat('vi-VN').format(data.summary.totalRevenue / (data.summary.orderCount || 1))}đ
                </h3>
            </div>
          </div>

          {/* Details Table */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
                <h2 className="font-bold text-gray-800 flex items-center gap-2">
                    <FileBox size={20} className="text-[#800020]" />
                    Chi tiết đơn hàng hoàn thành
                </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Mã đơn</th>
                    <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Khách hàng</th>
                    <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Hình thức</th>
                    <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Ngày thanh toán</th>
                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Tổng tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.orders.map((o: any) => (
                    <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-8 py-5 font-bold text-[#800020] text-sm group">
                        <span className="opacity-40 font-medium">#</span>{o.id}
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-bold text-gray-800">{o.fullname}</p>
                        <p className="text-[10px] text-gray-400 italic">ID: {o.user_id}</p>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg uppercase tracking-wider">
                            {o.payment_method}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-xs text-gray-500 font-medium">
                        {new Date(o.created_at).toLocaleString('vi-VN')}
                      </td>
                      <td className="px-8 py-5 text-right font-bold text-gray-800 text-sm">
                        {new Intl.NumberFormat('vi-VN').format(o.total_price)}đ
                      </td>
                    </tr>
                  ))}
                  {data.orders.length === 0 && (
                      <tr>
                          <td colSpan={5} className="p-20 text-center text-gray-400 italic font-medium">
                              Không có dữ liệu trong khoảng thời gian này.
                          </td>
                      </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
