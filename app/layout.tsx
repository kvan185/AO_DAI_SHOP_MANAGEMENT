import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import { CartProvider } from '@/context/CartContext';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Shop Áo Dài Online - Nét Đẹp Truyền Thống',
  description: 'Chuyên cung cấp các mẫu áo dài truyền thống và cách tân cao cấp.',
  keywords: 'áo dài, thời trang, việt nam, shop áo dài online',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <CartProvider>
          <Toaster position="top-right" />
          <Header />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
