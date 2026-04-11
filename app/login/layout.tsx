import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Đăng Nhập - Shop Áo Dài Online',
  description: 'Đăng nhập vào tài khoản Shop Áo Dài Online để quản lý đơn hàng.',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
