-- File: update.sql
-- Description: Cập nhật toàn bộ cấu trúc Database (Hỗ trợ Gallery Sắp xếp & Drag-and-Drop)
-- Cập nhật lần cuối: 2026-04-11

USE shop_ao_dai;

-- 1. Thêm bảng Product Images nếu chưa có
CREATE TABLE IF NOT EXISTS product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 2. Cập nhật bảng Product Images (Thêm display_order nếu bảng đã tồn tại)
ALTER TABLE product_images ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0 AFTER is_primary;

-- 3. Di chuyển dữ liệu từ products (Legacy image_path) sang product_images
SET @s = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'products' AND COLUMN_NAME = 'image_path' AND TABLE_SCHEMA = DATABASE()) > 0,
    "INSERT INTO product_images (product_id, image_path, is_primary, display_order) 
     SELECT id, image_path, TRUE, 0 FROM products WHERE image_path IS NOT NULL AND image_path != ''",
    "SELECT 'Column image_path already removed or not found'"
));
PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 4. Loại bỏ cột image_path cũ trong bảng products và thêm các cột mới
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku VARCHAR(50) UNIQUE AFTER name;
ALTER TABLE products ADD COLUMN IF NOT EXISTS slug VARCHAR(200) UNIQUE AFTER sku;
ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_price DECIMAL(10, 2) DEFAULT NULL AFTER price;
ALTER TABLE products DROP COLUMN IF EXISTS image_path;

-- 5. Đảm bảo các bảng khác ở trạng thái mới nhất
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    fullname VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    role ENUM('admin', 'manager', 'staff', 'customer') DEFAULT 'customer',
    is_locked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
