import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Đăng Ký - Shop Áo Dài Online',
  description: 'Tạo tài khoản mới tại Shop Áo Dài Online để trải nghiệm mua sắm tuyệt vời.',
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
