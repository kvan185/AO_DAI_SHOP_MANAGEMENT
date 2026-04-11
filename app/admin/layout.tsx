import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { jwtVerify } from 'jose';
import Sidebar from '@/components/admin/Sidebar';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = cookies().get('auth_token')?.value;

  if (!token) {
    redirect('/login');
  }

  let user = null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    user = {
      username: payload.username as string,
      role: payload.role as string,
    };

    // Global role check for entire /admin section
    const allowedRoles = ['admin', 'manager', 'staff'];
    if (!allowedRoles.includes(user.role)) {
      redirect('/403');
    }
  } catch (error) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Dynamic Sidebar */}
      <Sidebar user={user} />

      {/* Main Content Area */}
      <div className="flex-grow lg:ml-64 transition-all duration-300">
        <header className="bg-white border-b h-16 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm lg:hidden">
            <h1 className="text-lg font-serif font-bold text-[#800020]">ADMIN PANEL</h1>
        </header>
        
        <main className="p-4 md:p-8 lg:p-12">
          {children}
        </main>
      </div>
    </div>
  );
}
