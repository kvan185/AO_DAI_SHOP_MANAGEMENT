'use client';
import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Shield, 
  Lock, 
  Unlock, 
  MoreVertical,
  Mail,
  Calendar,
  Star,
  Award
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useSession } from '@/hooks/useSession';

export default function AdminUsers() {
  const { sid } = useSession();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const q = sid ? `?sid=${sid}` : '';
      const res = await fetch(`/api/admin/users${q}`);
      const data = await res.json();
      setUsers(data.users || []);
    } catch (e) {
      toast.error('Lỗi khi tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [sid]);

  const handleUpdate = async (user: any, updates: any) => {
    try {
      const q = sid ? `?sid=${sid}` : '';
      const res = await fetch(`/api/admin/users${q}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...user, ...updates })
      });
      
      if (res.ok) {
        toast.success('Cập nhật thành công');
        fetchUsers();
      } else {
          const data = await res.json();
          toast.error(data.message || 'Lỗi phân quyền');
      }
    } catch (e) {
      toast.error('Lỗi thực thi');
    }
  };

  if (loading && users.length === 0) return <div className="p-20 text-center">Đang tải...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif text-[#800020] uppercase tracking-widest">Quản lý nhân sự & Người dùng</h1>
        <p className="text-gray-500 text-sm">Quản lý tài khoản, phân quyền và bảo mật hệ thống.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Người dùng / Liên hệ</th>
                 <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Vai trò (Role)</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Loyalty (Điểm/Hạng)</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Ngày tham gia</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Trạng thái</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((u: any) => (
                <tr key={u.id} className={`hover:bg-gray-50 transition-colors ${u.is_locked ? 'opacity-60 bg-gray-50/30' : ''}`}>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-[#800020] font-bold border border-gray-100 shadow-sm transition-transform hover:scale-110">
                        {u.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{u.username}</p>
                        <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5"><Mail size={10} /> {u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <select 
                      value={u.role}
                      onChange={(e) => handleUpdate(u, { role: e.target.value })}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl outline-none cursor-pointer border-2 transition-all
                        ${u.role === 'admin' ? 'bg-red-50 text-red-600 border-red-100' : ''}
                        ${u.role === 'manager' ? 'bg-purple-50 text-purple-600 border-purple-100' : ''}
                        ${u.role === 'staff' ? 'bg-blue-50 text-blue-600 border-blue-100' : ''}
                        ${u.role === 'customer' ? 'bg-gray-50 text-gray-500 border-gray-100' : ''}
                      `}
                    >
                      <option value="customer">Khách hàng</option>
                      <option value="staff">Nhân viên</option>
                      <option value="manager">Quản lý</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 text-xs font-black text-[#800020]">
                            <Star size={12} fill="currentColor" /> {u.points || 0} <span className="text-[10px] font-bold text-gray-400 uppercase">điểm</span>
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-widest mt-1
                            ${u.membership_rank === 'Gold' ? 'text-amber-500' : 'text-gray-400'}
                            ${u.membership_rank === 'Silver' ? 'text-blue-400' : ''}
                        `}>
                            {u.membership_rank || 'Bronze'}
                        </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
                      <Calendar size={12} /> {new Date(u.created_at).toLocaleDateString('vi-VN')}
                    </p>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg
                        ${u.is_locked ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}
                    `}>
                        {u.is_locked ? 'Đang khóa' : 'Hoạt động'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button 
                        onClick={() => handleUpdate(u, { is_locked: !u.is_locked })}
                        className={`p-2 rounded-xl transition-all
                            ${u.is_locked ? 'text-green-500 hover:bg-green-50' : 'text-red-500 hover:bg-red-50'}
                        `}
                        title={u.is_locked ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                    >
                        {u.is_locked ? <Unlock size={18} /> : <Lock size={18} />}
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
                        <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
