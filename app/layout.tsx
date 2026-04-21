import type { Metadata } from 'next';
import { Playfair_Display, Outfit } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import { CartProvider } from '@/context/CartContext';
import { Toaster } from 'react-hot-toast';

const playfair = Playfair_Display({
  subsets: ['vietnamese'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-playfair',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-outfit',
  display: 'swap',
});

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
  const brandStyles = {
    '--primary': process.env.PRIMARY_COLOR || '#800020',
    '--secondary': process.env.SECONDARY_COLOR || '#D4AF37',
    '--accent': process.env.ACCENT_COLOR || '#F9F6F0',
  } as React.CSSProperties;

  return (
    <html lang="vi" className={`${playfair.variable} ${outfit.variable}`} style={brandStyles}>
      <body className="antialiased font-sans">
        <CartProvider>
          <Toaster position="top-right" />
          <Header />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
