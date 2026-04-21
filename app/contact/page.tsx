import React from 'react';
import { Metadata } from 'next';
import { MapPin, Phone, Mail, Clock, Send, MessageCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Liên hệ - Áo Dài Shop Cao Cấp',
  description: 'Liên hệ với chúng tôi để được tư vấn về những bộ Áo Dài thiết kế riêng thượng hạng.',
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#F9F6F0]">
      {/* Hero Section */}
      <section className="relative h-[50vh] flex items-end pb-20">
        <div className="absolute inset-0">
          <img 
            src="/ao_dai_boutique_exterior_1776791328199.png" 
            alt="Showroom Áo Dài" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#F9F6F0] via-[#F9F6F0]/20 to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full text-center">
            <span className="text-[#800020] text-xs font-black uppercase tracking-[0.4em] mb-4 block">Hành trình trải nghiệm</span>
            <h1 className="text-5xl md:text-7xl font-serif text-gray-900 italic">Ghé thăm showroom</h1>
        </div>
      </section>

      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            {/* Info Cards */}
            <div className="space-y-12">
                <div className="space-y-6">
                    <h2 className="text-3xl font-serif italic text-[#800020]">Kết nối với nghệ nhân</h2>
                    <p className="text-gray-500 leading-relaxed font-light text-lg">
                        Chúng tôi luôn sẵn sàng lắng nghe và tư vấn để giúp bạn tìm thấy bộ Áo Dài hoàn hảo nhất cho ngày trọng đại.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-500">
                        <div className="w-12 h-12 bg-[#800020]/5 rounded-2xl flex items-center justify-center text-[#800020] mb-6">
                            <MapPin size={24} />
                        </div>
                        <h3 className="font-bold text-sm uppercase tracking-widest text-gray-800 mb-2">Địa chỉ</h3>
                        <p className="text-sm text-gray-500 font-light">123 Phố Lụa, Quận Hoàn Kiếm, Hà Nội</p>
                    </div>
                    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-500">
                        <div className="w-12 h-12 bg-[#800020]/5 rounded-2xl flex items-center justify-center text-[#800020] mb-6">
                            <Phone size={24} />
                        </div>
                        <h3 className="font-bold text-sm uppercase tracking-widest text-gray-800 mb-2">Hotline</h3>
                        <p className="text-sm text-gray-500 font-light">0900 123 456</p>
                        <p className="text-xs text-[#D4AF37] mt-2 font-bold uppercase tracking-tight">Hỗ trợ 24/7</p>
                    </div>
                    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-500">
                        <div className="w-12 h-12 bg-[#800020]/5 rounded-2xl flex items-center justify-center text-[#800020] mb-6">
                            <Mail size={24} />
                        </div>
                        <h3 className="font-bold text-sm uppercase tracking-widest text-gray-800 mb-2">Email</h3>
                        <p className="text-sm text-gray-500 font-light">contact@aodaishop.com</p>
                    </div>
                    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-500">
                        <div className="w-12 h-12 bg-[#800020]/5 rounded-2xl flex items-center justify-center text-[#800020] mb-6">
                            <Clock size={24} />
                        </div>
                        <h3 className="font-bold text-sm uppercase tracking-widest text-gray-800 mb-2">Giờ mở cửa</h3>
                        <p className="text-sm text-gray-500 font-light">09:00 - 21:00 (Hàng ngày)</p>
                    </div>
                </div>

                <div className="p-8 bg-[#800020] rounded-[2.5rem] flex items-center justify-between text-[#D4AF37] shadow-2xl">
                    <div>
                        <p className="text-xs font-black uppercase tracking-[0.2em] mb-1 opacity-70">Tư vấn trực tiếp qua Zalo</p>
                        <p className="font-serif text-2xl italic">Trò chuyện cùng chuyên gia</p>
                    </div>
                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-[#800020] shadow-inner-lg">
                        <MessageCircle size={28} />
                    </div>
                </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white p-10 md:p-16 rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.05)] border border-gray-50">
                <form className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-4">Họ và tên</label>
                            <input 
                                type="text" 
                                placeholder="Nguyễn Văn A" 
                                className="w-full h-16 px-8 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#800020]/20 transition-all font-medium"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-4">Email</label>
                            <input 
                                type="email" 
                                placeholder="a@example.com" 
                                className="w-full h-16 px-8 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#800020]/20 transition-all font-medium"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-4">Chủ đề tư vấn</label>
                        <select className="w-full h-16 px-8 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#800020]/20 transition-all font-medium appearance-none">
                            <option>Đặt may Áo Dài cưới</option>
                            <option>Đặt may Áo Dài truyền thống</option>
                            <option>Câu hỏi về vận chuyển</option>
                            <option>Hợp tác / Sỉ</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-4">Nội dung / Tin nhắn</label>
                        <textarea 
                            rows={5} 
                            placeholder="Hãy để lại lời nhắn cho chúng tôi..."
                            className="w-full px-8 py-6 rounded-[2rem] bg-gray-50 border-none focus:ring-2 focus:ring-[#800020]/20 transition-all font-medium resize-none"
                        />
                    </div>
                    <button className="w-full py-6 bg-[#800020] text-[#D4AF37] rounded-[2rem] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-[#800020]/20">
                        <Send size={20} /> Gửi yêu cầu ngay
                    </button>
                </form>
            </div>
        </div>
      </section>

      {/* Map Placeholder */}
      <section className="h-[400px] w-full bg-gray-200 overflow-hidden relative group">
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-transparent transition-all duration-700">
              <div className="bg-white/80 backdrop-blur-md px-10 py-4 rounded-full font-bold text-sm tracking-widest text-gray-900 shadow-2xl border border-white/50">
                  Xem vị trí chính xác trên Google Maps
              </div>
          </div>
          <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover grayscale opacity-50" />
      </section>
    </main>
  );
}
