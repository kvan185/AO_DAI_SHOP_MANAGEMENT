-- File: structure.sql
-- Description: Toàn bộ cấu trúc Database hoàn chỉnh cho dự án Shop Áo Dài Online
-- Phiên bản: 2.0 (Hỗ trợ Gallery Đa Ảnh, Sắp xếp Drag-and-Drop, và Phân quyền RBAC)
-- Cập nhật lần cuối: 2026-04-11

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Khởi tạo Database
CREATE DATABASE IF NOT EXISTS shop_ao_dai;
USE shop_ao_dai;

-- 2. Bảng Users (Quản lý tài khoản: Admin, Manager, Staff, Customer)
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Bảng Categories (Danh mục sản phẩm)
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Bảng Products (Thông tin chính của Áo Dài)
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT,
    name VARCHAR(200) NOT NULL,
    sku VARCHAR(50) UNIQUE,        -- Mã định danh sản phẩm
    slug VARCHAR(200) UNIQUE,      -- Đường dẫn SEO
    price DECIMAL(10, 2) NOT NULL,
    discount_price DECIMAL(10, 2) DEFAULT NULL, -- Giá khuyến mãi
    description TEXT,
    image_url VARCHAR(255), -- Đường dẫn ảnh minh họa (Legacy/External)
    stock INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Bảng Product Images (Hệ thống Gallery Đa Ảnh)
CREATE TABLE IF NOT EXISTS product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_path VARCHAR(255) NOT NULL, -- Đường dẫn file trong /uploads/products/
    is_primary BOOLEAN DEFAULT FALSE, -- Ảnh bìa
    display_order INT DEFAULT 0,      -- Thứ tự hiển thị (hỗ trợ Drag-and-Drop)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Bảng Orders (Quản lý đơn hàng)
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    total_price DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'confirmed', 'shipping', 'completed', 'cancelled') DEFAULT 'pending',
    address TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    payment_method ENUM('COD', 'BANK_TRANSFER') DEFAULT 'COD',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Bảng Order Items (Chi tiết sản phẩm trong đơn hàng)
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL, -- Giá lưu lại tại thời điểm mua
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
