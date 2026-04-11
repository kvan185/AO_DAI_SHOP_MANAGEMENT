-- File: insert.sql
-- Description: Dữ liệu mẫu (Seed Data) cho hệ thống Shop Áo Dài Online
-- Cập nhật lần cuối: 2026-04-11

USE shop_ao_dai;

-- 1. Dữ liệu cho bảng Users (Mật khẩu mặc định: '123456' đã Hash bằng bcrypt)
INSERT INTO users (username, password, email, fullname, role) VALUES
('admin', '$2b$10$X7.W3I7O5I7O5I7O5I7O5e0zYp.y/SjB.f.o.G/SjB.f.o.G', 'admin@aodai.com', 'Quản trị hệ thống', 'admin'),
('manager1', '$2b$10$X7.W3I7O5I7O5I7O5I7O5e0zYp.y/SjB.f.o.G/SjB.f.o.G', 'manager@aodai.com', 'Quản lý cửa hàng', 'manager'),
('staff1', '$2b$10$X7.W3I7O5I7O5I7O5I7O5e0zYp.y/SjB.f.o.G/SjB.f.o.G', 'staff@aodai.com', 'Nhân viên bán hàng', 'staff'),
('customer1', '$2b$10$X7.W3I7O5I7O5I7O5I7O5e0zYp.y/SjB.f.o.G/SjB.f.o.G', 'khachhang@gmail.com', 'Nguyễn Văn Khách', 'customer');

-- 2. Dữ liệu cho bảng Categories (Danh mục Áo Dài)
INSERT INTO categories (name, slug, description) VALUES
('Áo dài truyền thống', 'ao-dai-truyen-thong', 'Các mẫu áo dài giữ nguyên nét đẹp cổ điển, kín đáo'),
('Áo dài cách tân', 'ao-dai-cach-tan', 'Sự pha trộn giữa nét đẹp truyền thống và hơi thở hiện đại'),
('Áo dài cưới', 'ao-dai-cuoi', 'Sắc đỏ, sắc trắng tinh khôi cho ngày trọng đại'),
('Áo dài học sinh', 'ao-dai-hoc-sinh', 'Đồng phục áo dài trắng thanh khiết cho nữ sinh'),
('Phụ kiện Áo dài', 'phu-kien-ao-dai', 'Mấn, quạt, trang sức phối cùng áo dài');

-- 3. Dữ liệu cho bảng Products (Sản phẩm mẫu)
INSERT INTO products (category_id, name, sku, slug, price, discount_price, description, image_url, stock) VALUES
(1, 'Áo Dài Lụa Hà Đông Đỏ', 'AD-HD-001', 'ao-dai-lua-ha-dong-do', 1250000, 990000, 'Chất liệu lụa satin cao cấp, co giãn nhẹ', 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb', 15),
(1, 'Áo Dài Gấm Hoa Văn Chìm', 'AD-G-002', 'ao-dai-gam-hoa-van-chim', 1850000, NULL, 'Gấm dệt cao cấp với họa tiết truyền thống', 'https://images.unsplash.com/photo-1583394238412-8697d17623c5', 8),
(2, 'Áo Dài Cách Tân Dáng Suông', 'AD-CT-003', 'ao-dai-cach-tan-dang-suong', 750000, 650000, 'Thiết kế trẻ trung, phù hợp dạo phố', 'https://images.unsplash.com/photo-1599839619722-397514112634', 20),
(3, 'Áo Dài Cưới Long Phụng', 'AD-C-004', 'ao-dai-cuoi-long-phung', 3500000, 3200000, 'Thêu tay kỳ công với chỉ vàng cao cấp', 'https://images.unsplash.com/photo-1583394838336-acd977736f90', 5),
(3, 'Áo Dài Cưới Trắng Trân Châu', 'AD-C-005', 'ao-dai-cuoi-trang-tran-chau', 2900000, NULL, 'Đính kết trân châu nổi bật trên nền voan trắng', 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb', 10),
(4, 'Áo Dài Trắng Nữ Sinh Lụa Thái', 'AD-HS-006', 'ao-dai-trang-nu-sinh-lua-thai', 550000, 490000, 'Vải lụa Thái mềm mát, ít nhăn', 'https://images.unsplash.com/photo-1583394838336-acd977736f90', 50);

-- 4. Dữ liệu cho bảng Product Images (Mẫu gallery ảnh)
INSERT INTO product_images (product_id, image_path, is_primary, display_order) VALUES
(1, '/uploads/products/demo-1-front.jpg', TRUE, 0),
(1, '/uploads/products/demo-1-back.jpg', FALSE, 1),
(1, '/uploads/products/demo-1-detail.jpg', FALSE, 2),
(2, '/uploads/products/demo-2-main.jpg', TRUE, 0),
(3, '/uploads/products/demo-3-main.jpg', TRUE, 0),
(4, '/uploads/products/demo-4-wedding.jpg', TRUE, 0);

-- 5. Dữ liệu mẫu cho Orders
INSERT INTO orders (user_id, total_price, status, address, phone, payment_method) VALUES
(4, 1250000, 'completed', '123 Đường Lê Lợi, Quận 1, TP.HCM', '0901234567', 'COD'),
(4, 750000, 'pending', '123 Đường Lê Lợi, Quận 1, TP.HCM', '0901234567', 'BANK_TRANSFER');

-- 6. Chi tiết sản phẩm trong đơn hàng
INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
(1, 1, 1, 1250000),
(2, 3, 1, 750000);
