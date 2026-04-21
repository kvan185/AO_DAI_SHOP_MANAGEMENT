-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 21, 2026 at 11:43 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `shop_ao_dai`
--

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(120) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `created_at`) VALUES
(1, 'Áo dài truyền thống', 'ao-dai-truyen-thong', 'Các mẫu áo dài giữ nguyên nét đẹp cổ điển, kín đáo', '2026-04-21 07:32:55'),
(2, 'Áo dài cách tân', 'ao-dai-cach-tan', 'Sự pha trộn giữa nét đẹp truyền thống và hơi thở hiện đại', '2026-04-21 07:32:55'),
(3, 'Áo dài cưới', 'ao-dai-cuoi', 'Sắc đỏ, sắc trắng tinh khôi cho ngày trọng đại', '2026-04-21 07:32:55'),
(4, 'Áo dài học sinh', 'ao-dai-hoc-sinh', 'Đồng phục áo dài trắng thanh khiết cho nữ sinh', '2026-04-21 07:32:55'),
(5, 'Phụ kiện Áo dài', 'phu-kien-ao-dai', 'Mấn, quạt, trang sức phối cùng áo dài', '2026-04-21 07:32:55');

-- --------------------------------------------------------

--
-- Table structure for table `coupons`
--

CREATE TABLE `coupons` (
  `id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `discount_type` enum('percent','fixed') DEFAULT 'fixed',
  `discount_value` decimal(10,2) NOT NULL,
  `min_order_value` decimal(10,2) DEFAULT 0.00,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `usage_limit` int(11) DEFAULT NULL,
  `times_used` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `status` enum('pending','confirmed','shipping','completed','cancelled') DEFAULT 'pending',
  `address` text NOT NULL,
  `phone` varchar(20) NOT NULL,
  `payment_method` enum('COD','BANK_TRANSFER') DEFAULT 'COD',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `total_price`, `status`, `address`, `phone`, `payment_method`, `created_at`) VALUES
(1, 4, 1250000.00, 'completed', '123 Đường Lê Lợi, Quận 1, TP.HCM', '0901234567', 'COD', '2026-04-21 07:32:55'),
(2, 4, 750000.00, 'pending', '123 Đường Lê Lợi, Quận 1, TP.HCM', '0901234567', 'BANK_TRANSFER', '2026-04-21 07:32:55');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `quantity`, `price`) VALUES
(1, 1, 1, 1, 1250000.00),
(2, 2, 3, 1, 750000.00);

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `name` varchar(200) NOT NULL,
  `sku` varchar(50) DEFAULT NULL,
  `slug` varchar(200) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `discount_price` decimal(10,2) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `stock` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `category_id`, `name`, `sku`, `slug`, `price`, `discount_price`, `description`, `image_url`, `stock`, `is_active`, `created_at`) VALUES
(1, 1, 'ÁO DÀI GẤM', NULL, NULL, 1299000.00, NULL, NULL, 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb', 20, 1, '2026-04-21 07:32:55'),
(2, 1, 'ÁO DÀI IN HOA', NULL, NULL, 1599000.00, NULL, NULL, 'https://images.unsplash.com/photo-1583394238412-8697d17623c5', 20, 1, '2026-04-21 07:32:55'),
(3, 2, 'ÁO DÀI LỤA XANH NGỌC', NULL, NULL, 1899000.00, NULL, NULL, 'https://images.unsplash.com/photo-1599839619722-397514112634', 20, 1, '2026-04-21 07:32:55'),
(4, 3, 'ÁO DÀI THÊU HOA', NULL, NULL, 1799000.00, NULL, NULL, 'https://images.unsplash.com/photo-1583394838336-acd977736f90', 20, 1, '2026-04-21 07:32:55'),
(5, 2, 'ÁO DÀI 4 TÀ PHỐI HOẠ TIẾT', NULL, NULL, 1999000.00, NULL, NULL, 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb', 100, 1, '2026-04-21 07:32:55'),
(6, 2, 'Áo Dài Cách Tân Gấm Nhũ Xanh Cổ Tròn Đính Hoa Xinh', NULL, NULL, 1989999.00, NULL, NULL, 'https://images.unsplash.com/photo-1583394838336-acd977736f90', 200, 1, '2026-04-21 07:32:55'),
(7, 2, 'ÁO DÀI KIM SA', NULL, NULL, 1899000.00, NULL, NULL, NULL, 200, 1, '2026-04-21 08:38:46');

-- --------------------------------------------------------

--
-- Table structure for table `product_images`
--

CREATE TABLE `product_images` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `image_path` varchar(255) NOT NULL,
  `is_primary` tinyint(1) DEFAULT 0,
  `display_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_images`
--

INSERT INTO `product_images` (`id`, `product_id`, `image_path`, `is_primary`, `display_order`, `created_at`) VALUES
(1, 1, '/uploads/products/demo-1-front.jpg', 0, 0, '2026-04-21 07:32:55'),
(4, 2, '/uploads/products/demo-2-main.jpg', 0, 0, '2026-04-21 07:32:55'),
(5, 3, '/uploads/products/demo-3-main.jpg', 0, 0, '2026-04-21 07:32:55'),
(6, 4, '/uploads/products/demo-4-wedding.jpg', 0, 0, '2026-04-21 07:32:55'),
(7, 6, '/uploads/products/ao-dai-cach-tan/ao-dai-cach-tan-gam-nhu-xanh-co-tron-dinh-hoa-xinh/1776757243103-0-z7602149331629-a42c2b76082d1cbfb0307cd536a391a2.webp', 1, 1, '2026-04-21 07:40:43'),
(8, 6, '/uploads/products/ao-dai-cach-tan/ao-dai-cach-tan-gam-nhu-xanh-co-tron-dinh-hoa-xinh/1776757243105-1-z7602149331048-422c059d4475e97f1050a36b8c265cf0.webp', 0, 2, '2026-04-21 07:40:43'),
(9, 7, '/uploads/products/ao-dai-cach-tan/ao-dai-kim-sa/1776760726038-0-ad088321582561020401p1899dt_q088421782561020401p799dt__4__5325d4dbaf144a92bea9579b513af74d_master.jpg', 0, 0, '2026-04-21 08:38:46'),
(10, 7, '/uploads/products/ao-dai-cach-tan/ao-dai-kim-sa/1776760726041-1-ad088321582561020401p1899dt_q088421782561020401p799dt__2__604b3f8c4870404b892f467c731b475a_master.jpg', 0, 1, '2026-04-21 08:38:46'),
(11, 7, '/uploads/products/ao-dai-cach-tan/ao-dai-kim-sa/1776760726047-2-c_c846944b9ecc4ce789f6a0c4fd2bb284_master.jpg', 1, 2, '2026-04-21 08:38:46'),
(12, 7, '/uploads/products/ao-dai-cach-tan/ao-dai-kim-sa/1776763744914-0-z7602149331048-422c059d4475e97f1050a36b8c265cf0.webp', 0, 3, '2026-04-21 09:29:04'),
(13, 5, '/uploads/products/ao-dai-cach-tan/ao-dai-4-ta-phoi-hoa-tiet/1776763917416-0-ad088521582561020401p1899dt_q088621782561040401p799dt__3__df3f1d7248264a89ad858e31699947e5_master.jpg', 0, 1, '2026-04-21 09:31:57'),
(14, 5, '/uploads/products/ao-dai-cach-tan/ao-dai-4-ta-phoi-hoa-tiet/1776763917417-1-ad088521582561020401p1899dt_q088621782561040401p799dt__2__4736d2ae03ef405eb4e3edc33324d450_master.jpg', 1, 2, '2026-04-21 09:31:57'),
(15, 5, '/uploads/products/ao-dai-cach-tan/ao-dai-4-ta-phoi-hoa-tiet/1776763917420-2-f_5537dfb3191243288d2a3094d558d8aa_master.jpg', 0, 3, '2026-04-21 09:31:57'),
(16, 4, '/uploads/products/ao-dai-cuoi/ao-dai-theu-hoa/1776764029994-0-ad087521582561020401p1799dt_q087621782561020401p699dt__2__f5186ab977554e29b00cdee5723e6fb8_master.jpg', 0, 1, '2026-04-21 09:33:49'),
(17, 4, '/uploads/products/ao-dai-cuoi/ao-dai-theu-hoa/1776764029996-1-ad087521582561020401p1799dt_q087621782561020401p699dt__8__7ffb20e8e5d34cb299028b1c2e958662_master.jpg', 1, 2, '2026-04-21 09:33:49'),
(18, 4, '/uploads/products/ao-dai-cuoi/ao-dai-theu-hoa/1776764029999-2-o_74daab0392bf4739b43a2051757231be_master.jpg', 0, 3, '2026-04-21 09:33:50'),
(19, 3, '/uploads/products/ao-dai-cach-tan/ao-dai-lua-xanh-ngoc/1776764161583-0-1.16_03abb77b4f9b4038896558e1ff1238a7_master.jpg', 1, 1, '2026-04-21 09:36:01'),
(20, 3, '/uploads/products/ao-dai-cach-tan/ao-dai-lua-xanh-ngoc/1776764161585-1-1.14_627d3e3600354495a0eeca5149c5638b_master.jpg', 0, 2, '2026-04-21 09:36:01'),
(21, 3, '/uploads/products/ao-dai-cach-tan/ao-dai-lua-xanh-ngoc/1776764161587-2-1.13_104ed4938c2b4bd59545af15ab9e7f30_master.jpg', 0, 3, '2026-04-21 09:36:01'),
(22, 2, '/uploads/products/ao-dai-truyen-thong/ao-dai-in-hoa/1776764230936-0-ad033221582553000418p1699dt_q033321782553050418p699dt_6__21855d505d884aff85611a12ed1fcdf0_master.jpg', 1, 1, '2026-04-21 09:37:10'),
(23, 2, '/uploads/products/ao-dai-truyen-thong/ao-dai-in-hoa/1776764230940-1-ad033221582553000418p1699dt_q033321782553050418p699dt_1__ae88488700644b5785798c2ae54d0b91_master.jpg', 0, 2, '2026-04-21 09:37:10'),
(24, 2, '/uploads/products/ao-dai-truyen-thong/ao-dai-in-hoa/1776764230943-2-1.4_e61a5a427ce64d7683beb238b9cbc839_master.jpg', 0, 3, '2026-04-21 09:37:10'),
(25, 1, '/uploads/products/ao-dai-truyen-thong/ao-dai-gam/1776764313291-0-ad087721582561000401p1699dt_q087821782561020401p799dt__2__6d98a2e586f94df6b3cfed797c8ecf32_master.jpg', 0, 1, '2026-04-21 09:38:33'),
(26, 1, '/uploads/products/ao-dai-truyen-thong/ao-dai-gam/1776764313293-1-ad087721582561000401p1699dt_q087821782561020401p799dt__1__4d9b6a76bdd241f1855ff4fb38597226_master.jpg', 1, 2, '2026-04-21 09:38:33'),
(27, 1, '/uploads/products/ao-dai-truyen-thong/ao-dai-gam/1776764313295-2-b_968a4a50f71f4954809007e989b38f3b_master.jpg', 0, 3, '2026-04-21 09:38:33');

-- --------------------------------------------------------

--
-- Table structure for table `product_variants`
--

CREATE TABLE `product_variants` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `size` varchar(50) DEFAULT NULL,
  `color` varchar(50) DEFAULT NULL,
  `sku` varchar(50) DEFAULT NULL,
  `stock` int(11) DEFAULT 0,
  `price_override` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `fullname` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `role` enum('admin','manager','staff','customer') DEFAULT 'customer',
  `avatar` varchar(255) DEFAULT NULL,
  `is_locked` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `email`, `fullname`, `phone`, `address`, `role`, `avatar`, `is_locked`, `created_at`) VALUES
(1, 'admin', '$2b$10$7GjhX5usioEs92622Jz3cOuIugp3sFVKgrx8rpXL4rwIcJp0GkAMm', 'admin@aodai.com', 'Quản trị hệ thống', NULL, NULL, 'admin', NULL, 0, '2026-04-21 07:32:55'),
(2, 'manager1', '$2b$10$7GjhX5usioEs92622Jz3cOuIugp3sFVKgrx8rpXL4rwIcJp0GkAMm', 'manager@aodai.com', 'Quản lý cửa hàng', NULL, NULL, 'manager', NULL, 0, '2026-04-21 07:32:55'),
(3, 'staff1', '$2b$10$7GjhX5usioEs92622Jz3cOuIugp3sFVKgrx8rpXL4rwIcJp0GkAMm', 'staff@aodai.com', 'Nhân viên bán hàng', NULL, NULL, 'staff', NULL, 0, '2026-04-21 07:32:55'),
(4, 'customer1', '$2b$10$7GjhX5usioEs92622Jz3cOuIugp3sFVKgrx8rpXL4rwIcJp0GkAMm', 'khachhang@gmail.com', 'Nguyễn Văn Khách', NULL, NULL, 'customer', NULL, 0, '2026-04-21 07:32:55'),
(5, 'kvan', '$2b$10$7GjhX5usioEs92622Jz3cOuIugp3sFVKgrx8rpXL4rwIcJp0GkAMm', 'khanhvan18052004@gmail.com', NULL, NULL, NULL, 'customer', NULL, 0, '2026-04-21 07:36:48');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `coupons`
--
ALTER TABLE `coupons`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sku` (`sku`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `product_images`
--
ALTER TABLE `product_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `product_variants`
--
ALTER TABLE `product_variants`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `coupons`
--
ALTER TABLE `coupons`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `product_images`
--
ALTER TABLE `product_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `product_variants`
--
ALTER TABLE `product_variants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `product_images`
--
ALTER TABLE `product_images`
  ADD CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_variants`
--
ALTER TABLE `product_variants`
  ADD CONSTRAINT `product_variants_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
