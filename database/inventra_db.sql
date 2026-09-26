-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 26, 2026 at 11:34 AM
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
-- Database: `inventra_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `adjustments`
--

CREATE TABLE `adjustments` (
  `id` varchar(50) NOT NULL,
  `reference` varchar(50) NOT NULL COMMENT 'e.g. WH/ADJ/0001',
  `reason` varchar(50) NOT NULL,
  `responsible_user_id` varchar(50) NOT NULL,
  `status` varchar(30) NOT NULL DEFAULT 'DRAFT',
  `notes` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_at` datetime(3) DEFAULT NULL,
  `location_id` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `adjustments`
--

INSERT INTO `adjustments` (`id`, `reference`, `reason`, `responsible_user_id`, `status`, `notes`, `created_at`, `applied_at`, `location_id`) VALUES
('ADJ-TEST-3079', 'WH/ADJ/TEST-1', 'DAMAGE', 'USR-001', 'APPLIED', 'Found damaged by moisture in audit', '2026-09-26 08:23:53.080', '2026-09-26 08:23:53.114', 'LOC-WH01-SZA-R01');

-- --------------------------------------------------------

--
-- Table structure for table `adjustment_items`
--

CREATE TABLE `adjustment_items` (
  `id` int(11) NOT NULL,
  `adjustment_id` varchar(50) NOT NULL,
  `product_id` varchar(50) NOT NULL,
  `system_qty` int(11) NOT NULL,
  `counted_qty` int(11) NOT NULL,
  `difference` int(11) NOT NULL,
  `unit` varchar(20) NOT NULL DEFAULT 'unit'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `adjustment_items`
--

INSERT INTO `adjustment_items` (`id`, `adjustment_id`, `product_id`, `system_qty`, `counted_qty`, `difference`, `unit`) VALUES
(1, 'ADJ-TEST-3079', 'PRD-TEST-2764', 60, 57, -3, 'kg');

-- --------------------------------------------------------

--
-- Table structure for table `alerts`
--

CREATE TABLE `alerts` (
  `id` varchar(50) NOT NULL,
  `type` varchar(50) NOT NULL,
  `product_id` varchar(50) DEFAULT NULL,
  `is_resolved` tinyint(1) NOT NULL DEFAULT 0,
  `resolved_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `location_id` varchar(50) DEFAULT NULL,
  `message` varchar(255) NOT NULL,
  `reason` text NOT NULL,
  `recommended_action` varchar(255) NOT NULL,
  `severity` varchar(20) NOT NULL DEFAULT 'INFO',
  `status` varchar(20) NOT NULL DEFAULT 'ACTIVE'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `alerts`
--

INSERT INTO `alerts` (`id`, `type`, `product_id`, `is_resolved`, `resolved_at`, `created_at`, `location_id`, `message`, `reason`, `recommended_action`, `severity`, `status`) VALUES
('cmui4gsie0001ilscsgp6yl5j', 'CRITICAL_STOCK', 'PRD01', 0, NULL, '2026-09-26 08:22:53.271', 'LOC-WH01-SZA-R01', 'Steel Rod (12mm) — Below Reorder Point', 'Available stock (36 kg) has breached safety reorder level (50 kg).', 'Create replenishment purchase order.', 'CRITICAL', 'ACTIVE'),
('cmui4gsiy0003ilscpfph86tv', 'CRITICAL_STOCK', 'PRD03', 0, NULL, '2026-09-26 08:22:53.290', 'LOC-WH02-MF-M01', 'Office Chair (Ergonomic) — Below Reorder Point', 'Available stock (12 unit) has breached safety reorder level (20 unit).', 'Create replenishment purchase order.', 'CRITICAL', 'ACTIVE'),
('cmui4gsjt0005ilscynl96rd3', 'CRITICAL_STOCK', 'PRD06', 0, NULL, '2026-09-26 08:22:53.321', 'LOC-WH01-SZA-R02', 'MCB Switch (32A) — Below Reorder Point', 'Available stock (47 unit) has breached safety reorder level (80 unit).', 'Create replenishment purchase order.', 'CRITICAL', 'ACTIVE'),
('cmui4gsk80007ilsc185xtn03', 'CRITICAL_STOCK', 'PRD08', 0, NULL, '2026-09-26 08:22:53.337', 'LOC-WH02-MF-M01', 'Desk (Executive Oak) — Below Reorder Point', 'Available stock (4 unit) has breached safety reorder level (10 unit).', 'Create replenishment purchase order.', 'CRITICAL', 'ACTIVE'),
('cmui4gskm0009ilsc44bh61bp', 'OUT_OF_STOCK', 'PRD10', 0, NULL, '2026-09-26 08:22:53.350', 'LOC-WH01-SZA-R03', 'PVC Pipe (4 inch) — Completely Out of Stock', '0 piece available across all facilities. Reorder threshold is 60 piece.', 'Issue emergency supplier purchase order.', 'CRITICAL', 'ACTIVE');

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` varchar(50) NOT NULL,
  `user_id` varchar(50) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `entity` varchar(50) NOT NULL,
  `entity_id` varchar(100) NOT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `timestamp` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity`, `entity_id`, `metadata`, `ip_address`, `timestamp`) VALUES
('cmui4i2j30003ilys609n93ut', 'Yash Rathore', 'RECEIPT_VALIDATED', 'Receipt', 'WH/IN/TEST-1', '\"{\\\"receiptId\\\":\\\"REC-TEST-2814\\\",\\\"totalItems\\\":1}\"', NULL, '2026-09-26 08:23:52.908'),
('cmui4i2la0007ilys9lq6dxvd', 'Yash Rathore', 'TRANSFER_COMPLETED', 'Transfer', 'WH/INT/TEST-1', '\"{\\\"transferId\\\":\\\"TRF-TEST-2930\\\"}\"', NULL, '2026-09-26 08:23:52.990'),
('cmui4i2nc000bilysm8br254k', 'Yash Rathore', 'DELIVERY_VALIDATED', 'Delivery', 'WH/OUT/TEST-1', '\"{\\\"deliveryId\\\":\\\"DEL-TEST-3011\\\",\\\"totalItems\\\":1}\"', NULL, '2026-09-26 08:23:53.064'),
('cmui4i2ov000filyswze25dlz', 'Yash Rathore', 'ADJUSTMENT_APPLIED', 'Adjustment', 'WH/ADJ/TEST-1', '\"{\\\"adjustmentId\\\":\\\"ADJ-TEST-3079\\\",\\\"reason\\\":\\\"DAMAGE\\\"}\"', NULL, '2026-09-26 08:23:53.120'),
('cmui53j7a000dilsczr8sxpyu', 'USR-002', 'LOGIN', 'User', 'USR-002', '\"{\\\"email\\\":\\\"Garage.sharma@inventra.internal\\\",\\\"role\\\":\\\"WarehouseManager\\\"}\"', NULL, '2026-09-26 08:40:34.295'),
('cmui6lb54000hilsceul8pfl9', 'USR-003', 'LOGIN', 'User', 'USR-003', '\"{\\\"email\\\":\\\"yash.audichya@inventra.internal\\\",\\\"role\\\":\\\"Auditor\\\"}\"', NULL, '2026-09-26 09:22:23.272');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `description`, `created_at`, `updated_at`) VALUES
('CAT01', 'Raw Materials', 'Base metals, plastics, chemicals', '2026-09-26 08:15:12.835', '2026-09-26 08:20:26.408'),
('CAT02', 'Finished Goods', 'Ready for client shipping', '2026-09-26 08:15:12.841', '2026-09-26 08:20:26.435'),
('CAT03', 'Packaging', 'Cardboard boxes, pallets', '2026-09-26 08:15:12.849', '2026-09-26 08:20:26.440'),
('CAT04', 'Electrical Components', 'Cables, panels, switches', '2026-09-26 08:15:12.854', '2026-09-26 08:20:26.445'),
('CAT05', 'Hardware', 'Bolts, screws, fasteners, tools', '2026-09-26 08:15:12.859', '2026-09-26 08:20:26.450'),
('CAT06', 'Furniture', 'Chairs, desks, fixtures', '2026-09-26 08:15:12.863', '2026-09-26 08:20:26.455');

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` varchar(50) NOT NULL,
  `name` varchar(150) NOT NULL,
  `contact_person` varchar(100) DEFAULT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `address` text NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`id`, `name`, `contact_person`, `phone`, `email`, `address`, `created_at`, `updated_at`) VALUES
('CUS01', 'Metro Constructions', 'Arun Mehra', '+91 99887 76655', 'procurement@metroconstructions.in', 'Plot 23, Andheri East, Mumbai', '2026-09-26 08:15:12.895', '2026-09-26 08:20:26.486'),
('CUS02', 'NexGen Interiors', 'Rohan Verma', '+91 97766 55443', 'supply@nexgeninteriors.com', 'MG Road, Bangalore', '2026-09-26 08:15:12.902', '2026-09-26 08:20:26.492'),
('CUS03', 'Prime Electricals', 'Karan Gupta', '+91 96655 44332', 'prime.electricals@gmail.com', 'Karol Bagh, New Delhi', '2026-09-26 08:15:12.910', '2026-09-26 08:20:26.496'),
('CUS04', 'SkyHigh Developers', 'Ananya Deshmukh', '+91 95544 33221', 'materials@skyhighdev.com', 'Hinjewadi, Pune', '2026-09-26 08:15:12.914', '2026-09-26 08:20:26.501');

-- --------------------------------------------------------

--
-- Table structure for table `deliveries`
--

CREATE TABLE `deliveries` (
  `id` varchar(50) NOT NULL,
  `reference` varchar(50) NOT NULL COMMENT 'e.g. WH/OUT/0001',
  `customer_id` varchar(50) NOT NULL,
  `delivery_address` text NOT NULL,
  `warehouse_id` varchar(50) NOT NULL,
  `schedule_date` date NOT NULL,
  `responsible_user_id` varchar(50) NOT NULL,
  `status` varchar(30) NOT NULL DEFAULT 'DRAFT',
  `notes` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `completed_at` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `deliveries`
--

INSERT INTO `deliveries` (`id`, `reference`, `customer_id`, `delivery_address`, `warehouse_id`, `schedule_date`, `responsible_user_id`, `status`, `notes`, `created_at`, `completed_at`) VALUES
('DEL-TEST-3011', 'WH/OUT/TEST-1', 'CUS01', 'Customer Site, Plot 23', 'WH01', '2026-09-26', 'USR-001', 'DELIVERED', NULL, '2026-09-26 08:23:53.012', '2026-09-26 08:23:53.053');

-- --------------------------------------------------------

--
-- Table structure for table `delivery_items`
--

CREATE TABLE `delivery_items` (
  `id` int(11) NOT NULL,
  `delivery_id` varchar(50) NOT NULL,
  `product_id` varchar(50) NOT NULL,
  `requested_qty` int(11) NOT NULL,
  `reserved_qty` int(11) NOT NULL DEFAULT 0,
  `picked_qty` int(11) NOT NULL DEFAULT 0,
  `packed_qty` int(11) NOT NULL DEFAULT 0,
  `delivered_qty` int(11) NOT NULL DEFAULT 0,
  `unit` varchar(20) NOT NULL DEFAULT 'unit'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `delivery_items`
--

INSERT INTO `delivery_items` (`id`, `delivery_id`, `product_id`, `requested_qty`, `reserved_qty`, `picked_qty`, `packed_qty`, `delivered_qty`, `unit`) VALUES
(1, 'DEL-TEST-3011', 'PRD-TEST-2764', 20, 0, 20, 20, 20, 'kg');

-- --------------------------------------------------------

--
-- Table structure for table `locations`
--

CREATE TABLE `locations` (
  `id` varchar(50) NOT NULL,
  `warehouse_id` varchar(50) NOT NULL,
  `zone` varchar(50) NOT NULL,
  `rack` varchar(50) NOT NULL,
  `shelf` varchar(30) NOT NULL DEFAULT 'S1',
  `bin` varchar(30) NOT NULL DEFAULT 'B1',
  `code` varchar(50) NOT NULL,
  `capacity` int(11) NOT NULL DEFAULT 500,
  `occupied` int(11) NOT NULL DEFAULT 0,
  `status` varchar(20) NOT NULL DEFAULT 'active',
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `locations`
--

INSERT INTO `locations` (`id`, `warehouse_id`, `zone`, `rack`, `shelf`, `bin`, `code`, `capacity`, `occupied`, `status`, `created_at`, `updated_at`) VALUES
('LOC-WH01-PF-P01', 'WH01', 'Production Floor', 'Rack P01', 'S1', 'B1', 'WH-A/PF/P01/S1/B1', 300, 0, 'active', '2026-09-26 08:15:12.966', '2026-09-26 08:20:26.548'),
('LOC-WH01-PF-P02', 'WH01', 'Production Floor', 'Rack P02', 'S1', 'B1', 'WH-A/PF/P02/S1/B1', 300, 0, 'active', '2026-09-26 08:15:12.970', '2026-09-26 08:20:26.553'),
('LOC-WH01-RD-R01', 'WH01', 'Receiving Dock', 'Dock R01', 'S1', 'B1', 'WH-A/RD/R01/S1/B1', 200, 0, 'active', '2026-09-26 08:15:12.975', '2026-09-26 08:20:26.558'),
('LOC-WH01-SZA-R01', 'WH01', 'Storage Zone A', 'Rack A01', 'S1', 'B1', 'WH-A/SZ-A/R01/S1/B1', 500, 0, 'active', '2026-09-26 08:15:12.935', '2026-09-26 08:20:26.522'),
('LOC-WH01-SZA-R02', 'WH01', 'Storage Zone A', 'Rack A02', 'S1', 'B1', 'WH-A/SZ-A/R02/S1/B1', 500, 0, 'active', '2026-09-26 08:15:12.942', '2026-09-26 08:20:26.528'),
('LOC-WH01-SZA-R03', 'WH01', 'Storage Zone A', 'Rack A03', 'S1', 'B1', 'WH-A/SZ-A/R03/S1/B1', 500, 0, 'active', '2026-09-26 08:15:12.951', '2026-09-26 08:20:26.533'),
('LOC-WH01-SZB-R01', 'WH01', 'Storage Zone B', 'Rack B01', 'S1', 'B1', 'WH-A/SZ-B/R01/S1/B1', 400, 0, 'active', '2026-09-26 08:15:12.956', '2026-09-26 08:20:26.538'),
('LOC-WH01-SZB-R02', 'WH01', 'Storage Zone B', 'Rack B02', 'S1', 'B1', 'WH-A/SZ-B/R02/S1/B1', 400, 0, 'active', '2026-09-26 08:15:12.961', '2026-09-26 08:20:26.543'),
('LOC-WH02-MF-M01', 'WH02', 'Main Floor', 'Rack M01', 'S1', 'B1', 'WH-B/MF/M01/S1/B1', 600, 0, 'active', '2026-09-26 08:15:12.980', '2026-09-26 08:20:26.562'),
('LOC-WH02-MF-M02', 'WH02', 'Main Floor', 'Rack M02', 'S1', 'B1', 'WH-B/MF/M02/S1/B1', 600, 0, 'active', '2026-09-26 08:15:12.985', '2026-09-26 08:20:26.566');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` varchar(50) NOT NULL,
  `name` varchar(150) NOT NULL,
  `sku` varchar(50) NOT NULL,
  `barcode` varchar(50) NOT NULL,
  `category_id` varchar(50) NOT NULL,
  `unit` varchar(20) NOT NULL DEFAULT 'unit',
  `selling_price` decimal(12,2) NOT NULL DEFAULT 0.00,
  `min_stock` int(11) NOT NULL DEFAULT 10,
  `max_stock` int(11) NOT NULL DEFAULT 500,
  `reorder_point` int(11) NOT NULL DEFAULT 20,
  `supplier_id` varchar(50) NOT NULL,
  `default_warehouse_id` varchar(50) DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'active',
  `last_movement_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  `cost` decimal(12,2) NOT NULL DEFAULT 0.00,
  `default_location_id` varchar(50) DEFAULT NULL,
  `initial_stock` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `sku`, `barcode`, `category_id`, `unit`, `selling_price`, `min_stock`, `max_stock`, `reorder_point`, `supplier_id`, `default_warehouse_id`, `status`, `last_movement_at`, `created_at`, `updated_at`, `cost`, `default_location_id`, `initial_stock`) VALUES
('PRD-TEST-2764', 'Steel Rod Test Batch', 'TEST-STR-2764', '8906551485499', 'CAT01', 'kg', 72.00, 20, 500, 50, 'SUP01', 'WH01', 'active', '2026-09-26 08:23:53.111', '2026-09-26 08:23:52.796', '2026-09-26 08:23:53.112', 58.00, 'LOC-WH01-SZA-R01', 0),
('PRD01', 'Steel Rod (12mm)', 'STR-001', '8901234567890', 'CAT01', 'kg', 72.00, 30, 500, 50, 'SUP01', 'WH01', 'active', NULL, '2026-09-26 08:15:12.990', '2026-09-26 08:20:26.572', 58.00, 'LOC-WH01-SZA-R01', 0),
('PRD02', 'Copper Wire (2.5mm)', 'CPW-002', '8901234567891', 'CAT04', 'meter', 45.00, 100, 2000, 200, 'SUP05', 'WH01', 'active', NULL, '2026-09-26 08:15:12.998', '2026-09-26 08:20:26.578', 32.00, 'LOC-WH01-SZB-R01', 0),
('PRD03', 'Office Chair (Ergonomic)', 'OCH-003', '8901234567892', 'CAT06', 'unit', 12000.00, 10, 100, 20, 'SUP04', 'WH02', 'active', NULL, '2026-09-26 08:15:13.007', '2026-09-26 08:20:26.583', 8500.00, 'LOC-WH02-MF-M01', 0),
('PRD04', 'LED Panel Light (18W)', 'LED-004', '8901234567893', 'CAT04', 'unit', 420.00, 50, 500, 80, 'SUP02', 'WH01', 'active', NULL, '2026-09-26 08:15:13.012', '2026-09-26 08:20:26.589', 280.00, 'LOC-WH01-SZA-R02', 0),
('PRD05', 'Paint (Royal Shyne, 20L)', 'PNT-005', '8901234567894', 'CAT01', 'bucket', 5800.00, 15, 150, 30, 'SUP03', 'WH01', 'active', NULL, '2026-09-26 08:15:13.017', '2026-09-26 08:20:26.595', 4200.00, 'LOC-WH01-SZB-R02', 0),
('PRD06', 'MCB Switch (32A)', 'MCB-006', '8901234567895', 'CAT04', 'unit', 210.00, 50, 400, 80, 'SUP02', 'WH01', 'active', NULL, '2026-09-26 08:15:13.023', '2026-09-26 08:20:26.601', 145.00, 'LOC-WH01-SZA-R02', 0),
('PRD07', 'Cement (OPC 53 Grade)', 'CMT-007', '8901234567896', 'CAT01', 'bag', 450.00, 100, 800, 200, 'SUP01', 'WH01', 'active', NULL, '2026-09-26 08:15:13.029', '2026-09-26 08:20:26.607', 380.00, 'LOC-WH01-PF-P01', 0),
('PRD08', 'Desk (Executive Oak)', 'DSK-008', '8901234567897', 'CAT06', 'unit', 18500.00, 5, 40, 10, 'SUP04', 'WH02', 'active', NULL, '2026-09-26 08:15:13.033', '2026-09-26 08:20:26.612', 12000.00, 'LOC-WH02-MF-M01', 0),
('PRD09', 'Packaging Box (Large)', 'PKG-009', '8901234567898', 'CAT03', 'unit', 40.00, 200, 2000, 400, 'SUP01', 'WH01', 'active', NULL, '2026-09-26 08:15:13.038', '2026-09-26 08:20:26.618', 25.00, 'LOC-WH01-RD-R01', 0),
('PRD10', 'PVC Pipe (4 inch)', 'PVC-010', '8901234567899', 'CAT01', 'piece', 260.00, 30, 300, 60, 'SUP03', 'WH01', 'active', NULL, '2026-09-26 08:15:13.044', '2026-09-26 08:20:26.623', 180.00, 'LOC-WH01-SZA-R03', 0),
('PRD11', 'Safety Helmet', 'SFH-011', '8901234567900', 'CAT05', 'unit', 550.00, 20, 200, 40, 'SUP01', 'WH01', 'active', NULL, '2026-09-26 08:15:13.049', '2026-09-26 08:20:26.629', 350.00, 'LOC-WH01-SZB-R01', 0),
('PRD12', 'Ceiling Fan (Decorative)', 'CFN-012', '8901234567901', 'CAT04', 'unit', 3400.00, 10, 100, 20, 'SUP02', 'WH02', 'active', NULL, '2026-09-26 08:15:13.054', '2026-09-26 08:20:26.634', 2200.00, 'LOC-WH02-MF-M02', 0);

-- --------------------------------------------------------

--
-- Table structure for table `receipts`
--

CREATE TABLE `receipts` (
  `id` varchar(50) NOT NULL,
  `reference` varchar(50) NOT NULL COMMENT 'e.g. WH/IN/0001',
  `supplier_id` varchar(50) NOT NULL,
  `warehouse_id` varchar(50) NOT NULL,
  `schedule_date` date NOT NULL,
  `responsible_user_id` varchar(50) NOT NULL,
  `status` varchar(30) NOT NULL DEFAULT 'DRAFT',
  `notes` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `completed_at` datetime(3) DEFAULT NULL,
  `destination_location_id` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `receipts`
--

INSERT INTO `receipts` (`id`, `reference`, `supplier_id`, `warehouse_id`, `schedule_date`, `responsible_user_id`, `status`, `notes`, `created_at`, `completed_at`, `destination_location_id`) VALUES
('REC-TEST-2814', 'WH/IN/TEST-1', 'SUP01', 'WH01', '2026-09-26', 'USR-001', 'DONE', 'Initial receipt for flow verification', '2026-09-26 08:23:52.817', '2026-09-26 08:23:52.874', 'LOC-WH01-SZA-R01');

-- --------------------------------------------------------

--
-- Table structure for table `receipt_items`
--

CREATE TABLE `receipt_items` (
  `id` int(11) NOT NULL,
  `receipt_id` varchar(50) NOT NULL,
  `product_id` varchar(50) NOT NULL,
  `expected_qty` int(11) NOT NULL,
  `received_qty` int(11) NOT NULL DEFAULT 0,
  `difference` int(11) NOT NULL DEFAULT 0,
  `unit` varchar(20) NOT NULL DEFAULT 'unit'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `receipt_items`
--

INSERT INTO `receipt_items` (`id`, `receipt_id`, `product_id`, `expected_qty`, `received_qty`, `difference`, `unit`) VALUES
(1, 'REC-TEST-2814', 'PRD-TEST-2764', 100, 100, 0, 'kg');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `permissions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Array of permission strings' CHECK (json_valid(`permissions`)),
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `description`, `permissions`, `created_at`) VALUES
('Admin', 'Inventory Administrator', 'Full system access', '[\"*\"]', '2026-09-26 12:05:47.000'),
('Auditor', 'Inventory Quality Auditor', 'Inspect stock counts and ledger', '[\"reports:read\", \"ledger:read\"]', '2026-09-26 12:05:47.000'),
('INVENTORY_MANAGER', 'Warehouse Operations Manager', 'Manage stock movements and receipts', '[\"products:*\", \"receipts:*\", \"deliveries:*\"]', '2026-09-26 08:15:12.815'),
('VIEWER', 'Auditor / Viewer', 'Read-only access', '[\"reports:read\", \"ledger:read\"]', '2026-09-26 08:15:12.830'),
('WarehouseManager', 'Warehouse Operations Manager', 'Manage stock movements and receipts', '[\"products:*\", \"receipts:*\", \"deliveries:*\"]', '2026-09-26 12:05:47.000'),
('WAREHOUSE_STAFF', 'Warehouse Staff', 'Perform counts, pick/pack', '[\"receipts:read\", \"deliveries:read\"]', '2026-09-26 08:15:12.822');

-- --------------------------------------------------------

--
-- Table structure for table `stock`
--

CREATE TABLE `stock` (
  `id` int(11) NOT NULL,
  `product_id` varchar(50) NOT NULL,
  `location_id` varchar(50) NOT NULL,
  `on_hand` int(11) NOT NULL DEFAULT 0,
  `reserved` int(11) NOT NULL DEFAULT 0,
  `damaged` int(11) NOT NULL DEFAULT 0,
  `available` int(11) NOT NULL DEFAULT 0,
  `last_counted_at` datetime(3) DEFAULT NULL,
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `stock`
--

INSERT INTO `stock` (`id`, `product_id`, `location_id`, `on_hand`, `reserved`, `damaged`, `available`, `last_counted_at`, `updated_at`) VALUES
(1, 'PRD01', 'LOC-WH01-SZA-R01', 48, 12, 3, 33, NULL, '2026-09-26 08:20:26.640'),
(2, 'PRD02', 'LOC-WH01-SZB-R01', 1450, 200, 0, 1250, NULL, '2026-09-26 08:20:26.646'),
(3, 'PRD03', 'LOC-WH02-MF-M01', 18, 6, 1, 11, NULL, '2026-09-26 08:20:26.651'),
(4, 'PRD04', 'LOC-WH01-SZA-R02', 234, 30, 0, 204, NULL, '2026-09-26 08:20:26.656'),
(5, 'PRD05', 'LOC-WH01-SZB-R02', 67, 10, 2, 55, NULL, '2026-09-26 08:20:26.661'),
(6, 'PRD06', 'LOC-WH01-SZA-R02', 62, 15, 0, 47, NULL, '2026-09-26 08:20:26.666'),
(7, 'PRD07', 'LOC-WH01-PF-P01', 540, 50, 0, 490, NULL, '2026-09-26 08:20:26.671'),
(8, 'PRD08', 'LOC-WH02-MF-M01', 7, 3, 0, 4, NULL, '2026-09-26 08:20:26.676'),
(9, 'PRD09', 'LOC-WH01-RD-R01', 1850, 100, 0, 1750, NULL, '2026-09-26 08:20:26.680'),
(10, 'PRD10', 'LOC-WH01-SZA-R03', 0, 0, 0, 0, NULL, '2026-09-26 08:20:26.686'),
(11, 'PRD11', 'LOC-WH01-SZB-R01', 85, 0, 5, 80, NULL, '2026-09-26 08:20:26.691'),
(12, 'PRD12', 'LOC-WH02-MF-M02', 45, 8, 0, 37, NULL, '2026-09-26 08:20:26.698'),
(13, 'PRD-TEST-2764', 'LOC-WH01-SZA-R01', 57, 0, 3, 54, '2026-09-26 08:23:53.103', '2026-09-26 08:23:53.104'),
(14, 'PRD-TEST-2764', 'LOC-WH01-PF-P01', 20, 0, 0, 20, NULL, '2026-09-26 08:23:52.966');

-- --------------------------------------------------------

--
-- Table structure for table `stock_movements`
--

CREATE TABLE `stock_movements` (
  `id` varchar(50) NOT NULL,
  `product_id` varchar(50) NOT NULL,
  `movement_type` varchar(30) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit` varchar(20) NOT NULL DEFAULT 'unit',
  `from_location_id` varchar(50) DEFAULT NULL,
  `to_location_id` varchar(50) DEFAULT NULL,
  `reference_id` varchar(100) NOT NULL,
  `notes` text DEFAULT NULL,
  `batch_number` varchar(50) DEFAULT NULL,
  `created_by` varchar(100) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `stock_movements`
--

INSERT INTO `stock_movements` (`id`, `product_id`, `movement_type`, `quantity`, `unit`, `from_location_id`, `to_location_id`, `reference_id`, `notes`, `batch_number`, `created_by`, `created_at`) VALUES
('cmui4i2ht0001ilysaszy1tgz', 'PRD-TEST-2764', 'RECEIPT', 100, 'kg', NULL, 'LOC-WH01-SZA-R01', 'WH/IN/TEST-1', 'Inbound receipt from SUP01 into location LOC-WH01-SZA-R01', NULL, 'Yash Rathore', '2026-09-26 08:23:52.865'),
('cmui4i2kq0005ilyswu5oc6ym', 'PRD-TEST-2764', 'TRANSFER', 20, 'kg', 'LOC-WH01-SZA-R01', 'LOC-WH01-PF-P01', 'WH/INT/TEST-1', 'Internal transfer from WH-A/SZ-A/R01/S1/B1 to WH-A/PF/P01/S1/B1', NULL, 'Yash Rathore', '2026-09-26 08:23:52.970'),
('cmui4i2mq0009ilysw7xl6rip', 'PRD-TEST-2764', 'DELIVERY', -20, 'kg', 'LOC-WH01-SZA-R01', NULL, 'WH/OUT/TEST-1', 'Outbound delivery to customer CUS01', NULL, 'Yash Rathore', '2026-09-26 08:23:53.043'),
('cmui4i2ol000dilysyc7wikri', 'PRD-TEST-2764', 'ADJUSTMENT', -3, 'kg', 'LOC-WH01-SZA-R01', NULL, 'WH/ADJ/TEST-1', 'Physical reconciliation: DAMAGE. Counted: 57, System was: 60. Diff: -3', NULL, 'Yash Rathore', '2026-09-26 08:23:53.109');

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

CREATE TABLE `suppliers` (
  `id` varchar(50) NOT NULL,
  `name` varchar(150) NOT NULL,
  `contact_person` varchar(100) NOT NULL,
  `phone` varchar(30) NOT NULL,
  `email` varchar(150) NOT NULL,
  `address` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `suppliers`
--

INSERT INTO `suppliers` (`id`, `name`, `contact_person`, `phone`, `email`, `address`, `created_at`, `updated_at`) VALUES
('SUP01', 'Tata Steel Ltd', 'Rajesh Kumar', '+91 98765 43210', 'supply@tatasteel.com', 'Jamshedpur Works, Jharkhand', '2026-09-26 08:15:12.869', '2026-09-26 08:20:26.461'),
('SUP02', 'Havells India', 'Priya Sharma', '+91 87654 32109', 'orders@havells.com', 'QRG Towers, Noida, UP', '2026-09-26 08:15:12.876', '2026-09-26 08:20:26.467'),
('SUP03', 'Asian Paints', 'Vikram Singh', '+91 76543 21098', 'b2b@asianpaints.com', 'Santacruz East, Mumbai', '2026-09-26 08:15:12.881', '2026-09-26 08:20:26.472'),
('SUP04', 'Godrej Interio', 'Neha Patel', '+91 65432 10987', 'supply@godrej.com', 'Vikhroli, Mumbai', '2026-09-26 08:15:12.886', '2026-09-26 08:20:26.477'),
('SUP05', 'Polycab Wires', 'Suresh Iyer', '+91 54321 09876', 'orders@polycab.com', 'Alkapuri, Vadodara', '2026-09-26 08:15:12.891', '2026-09-26 08:20:26.482');

-- --------------------------------------------------------

--
-- Table structure for table `transfers`
--

CREATE TABLE `transfers` (
  `id` varchar(50) NOT NULL,
  `reference` varchar(50) NOT NULL COMMENT 'e.g. WH/INT/0001',
  `responsible_user_id` varchar(50) NOT NULL,
  `status` varchar(30) NOT NULL DEFAULT 'DRAFT',
  `notes` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `completed_at` datetime(3) DEFAULT NULL,
  `destination_location_id` varchar(50) NOT NULL,
  `source_location_id` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `transfers`
--

INSERT INTO `transfers` (`id`, `reference`, `responsible_user_id`, `status`, `notes`, `created_at`, `completed_at`, `destination_location_id`, `source_location_id`) VALUES
('TRF-TEST-2930', 'WH/INT/TEST-1', 'USR-001', 'DONE', 'Material shift to production floor', '2026-09-26 08:23:52.931', '2026-09-26 08:23:52.981', 'LOC-WH01-PF-P01', 'LOC-WH01-SZA-R01');

-- --------------------------------------------------------

--
-- Table structure for table `transfer_items`
--

CREATE TABLE `transfer_items` (
  `id` int(11) NOT NULL,
  `transfer_id` varchar(50) NOT NULL,
  `product_id` varchar(50) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit` varchar(20) NOT NULL DEFAULT 'unit'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `transfer_items`
--

INSERT INTO `transfer_items` (`id`, `transfer_id`, `product_id`, `quantity`, `unit`) VALUES
(1, 'TRF-TEST-2930', 'PRD-TEST-2764', 20, 'kg');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role_id` varchar(50) NOT NULL DEFAULT 'ADMIN',
  `avatar` varchar(10) NOT NULL DEFAULT 'YR',
  `phone` varchar(30) DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'active',
  `joined_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role_id`, `avatar`, `phone`, `status`, `joined_at`, `created_at`, `updated_at`) VALUES
('USR-001', 'Yash Rathore', 'yash@inventra.internal', 'admin@123', 'Admin', 'YR', '+91 98765 00001', 'active', '2026-09-26 00:00:00.000', '2026-09-26 12:10:24.000', '2026-09-26 12:10:24.000'),
('USR-002', 'Gargee Sharma', 'Garage.sharma@inventra.internal', 'manager@123', 'WarehouseManager', 'GS', '+91 98765 00002', 'active', '2026-09-26 00:00:00.000', '2026-09-26 12:10:24.000', '2026-09-26 12:18:28.000'),
('USR-003', 'Yash Audichya', 'yash.audichya@inventra.internal', 'auditor@123', 'Auditor', 'YA', '+91 98765 00003', 'active', '2026-09-26 00:00:00.000', '2026-09-26 12:10:24.000', '2026-09-26 12:18:13.000');

-- --------------------------------------------------------

--
-- Table structure for table `user_sessions`
--

CREATE TABLE `user_sessions` (
  `session_id` varchar(64) NOT NULL,
  `user_id` varchar(50) NOT NULL,
  `token` varchar(255) NOT NULL,
  `remember_me` tinyint(1) NOT NULL DEFAULT 0,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `expires_at` datetime(3) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_sessions`
--

INSERT INTO `user_sessions` (`session_id`, `user_id`, `token`, `remember_me`, `ip_address`, `user_agent`, `expires_at`, `created_at`) VALUES
('cmui53j61000bilscy9kjnyea', 'USR-002', 'inv_x9GPL0F4zH36OSYh2oxM', 1, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-10-03 08:40:34.246', '2026-09-26 08:40:34.249'),
('cmui6lb3r000filsco7c683hr', 'USR-003', 'inv_Z4U9bt8syEqinnodPFVY', 1, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-10-03 09:22:23.220', '2026-09-26 09:22:23.223'),
('SESS-IB71CC', 'USR-001', 'inv_tok_4l0h8zimiwmui30cgw', 0, NULL, NULL, '2026-09-26 21:12:06.000', '2026-09-26 13:12:06.000');

-- --------------------------------------------------------

--
-- Table structure for table `warehouses`
--

CREATE TABLE `warehouses` (
  `id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `short_code` varchar(20) NOT NULL COMMENT 'e.g. WH-A',
  `address` text NOT NULL,
  `manager_id` varchar(50) DEFAULT NULL,
  `capacity` int(11) NOT NULL DEFAULT 5000,
  `used_capacity` int(11) NOT NULL DEFAULT 0,
  `status` varchar(20) NOT NULL DEFAULT 'active',
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `warehouses`
--

INSERT INTO `warehouses` (`id`, `name`, `short_code`, `address`, `manager_id`, `capacity`, `used_capacity`, `status`, `created_at`, `updated_at`) VALUES
('WH01', 'Main Warehouse', 'WH-A', '12 Industrial Area, Bhopal', NULL, 5000, 0, 'active', '2026-09-26 08:15:12.919', '2026-09-26 08:20:26.506'),
('WH02', 'Distribution Center', 'WH-B', '45 Logistics Park, Indore', NULL, 3000, 0, 'active', '2026-09-26 08:15:12.925', '2026-09-26 08:20:26.512'),
('WH03', 'Production Store', 'WH-C', 'Industrial Sub-zone 3, Mandideep', NULL, 2000, 0, 'active', '2026-09-26 08:15:12.930', '2026-09-26 08:20:26.517');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `adjustments`
--
ALTER TABLE `adjustments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_adjustments_reference` (`reference`),
  ADD KEY `idx_adj_status` (`status`),
  ADD KEY `adjustments_location_id_idx` (`location_id`);

--
-- Indexes for table `adjustment_items`
--
ALTER TABLE `adjustment_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `adjustment_items_adjustment_id_idx` (`adjustment_id`),
  ADD KEY `adjustment_items_product_id_idx` (`product_id`);

--
-- Indexes for table `alerts`
--
ALTER TABLE `alerts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_alerts_type` (`type`),
  ADD KEY `idx_alerts_resolved` (`is_resolved`),
  ADD KEY `alerts_severity_idx` (`severity`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `audit_logs_action_idx` (`action`),
  ADD KEY `audit_logs_entity_entity_id_idx` (`entity`,`entity_id`),
  ADD KEY `audit_logs_timestamp_idx` (`timestamp`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_categories_name` (`name`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `deliveries`
--
ALTER TABLE `deliveries`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_deliveries_reference` (`reference`),
  ADD KEY `idx_del_customer` (`customer_id`),
  ADD KEY `idx_del_warehouse` (`warehouse_id`),
  ADD KEY `idx_del_status` (`status`);

--
-- Indexes for table `delivery_items`
--
ALTER TABLE `delivery_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_del_items_delivery` (`delivery_id`),
  ADD KEY `idx_del_items_product` (`product_id`);

--
-- Indexes for table `locations`
--
ALTER TABLE `locations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `locations_warehouse_id_code_key` (`warehouse_id`,`code`),
  ADD KEY `locations_warehouse_id_idx` (`warehouse_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_products_sku` (`sku`),
  ADD UNIQUE KEY `uk_products_barcode` (`barcode`),
  ADD KEY `idx_products_category` (`category_id`),
  ADD KEY `idx_products_supplier` (`supplier_id`),
  ADD KEY `products_status_idx` (`status`);

--
-- Indexes for table `receipts`
--
ALTER TABLE `receipts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_receipts_reference` (`reference`),
  ADD KEY `idx_receipts_supplier` (`supplier_id`),
  ADD KEY `idx_receipts_warehouse` (`warehouse_id`),
  ADD KEY `idx_receipts_status` (`status`);

--
-- Indexes for table `receipt_items`
--
ALTER TABLE `receipt_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_rec_items_receipt` (`receipt_id`),
  ADD KEY `idx_rec_items_product` (`product_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `stock`
--
ALTER TABLE `stock`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `stock_product_id_location_id_key` (`product_id`,`location_id`),
  ADD KEY `stock_product_id_idx` (`product_id`),
  ADD KEY `stock_location_id_idx` (`location_id`);

--
-- Indexes for table `stock_movements`
--
ALTER TABLE `stock_movements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `stock_movements_product_id_idx` (`product_id`),
  ADD KEY `stock_movements_movement_type_idx` (`movement_type`),
  ADD KEY `stock_movements_reference_id_idx` (`reference_id`),
  ADD KEY `stock_movements_created_at_idx` (`created_at`);

--
-- Indexes for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `transfers`
--
ALTER TABLE `transfers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_transfers_reference` (`reference`),
  ADD KEY `idx_transfers_status` (`status`),
  ADD KEY `transfers_source_location_id_idx` (`source_location_id`),
  ADD KEY `transfers_destination_location_id_idx` (`destination_location_id`);

--
-- Indexes for table `transfer_items`
--
ALTER TABLE `transfer_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `transfer_items_transfer_id_idx` (`transfer_id`),
  ADD KEY `transfer_items_product_id_idx` (`product_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_users_email` (`email`),
  ADD KEY `idx_users_role` (`role_id`),
  ADD KEY `idx_users_status` (`status`);

--
-- Indexes for table `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD PRIMARY KEY (`session_id`),
  ADD UNIQUE KEY `uk_session_token` (`token`),
  ADD KEY `idx_sessions_user` (`user_id`),
  ADD KEY `idx_sessions_expires` (`expires_at`);

--
-- Indexes for table `warehouses`
--
ALTER TABLE `warehouses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_warehouses_short_code` (`short_code`),
  ADD KEY `idx_warehouses_manager` (`manager_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `adjustment_items`
--
ALTER TABLE `adjustment_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `delivery_items`
--
ALTER TABLE `delivery_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `receipt_items`
--
ALTER TABLE `receipt_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `stock`
--
ALTER TABLE `stock`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `transfer_items`
--
ALTER TABLE `transfer_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD CONSTRAINT `user_sessions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `warehouses`
--
ALTER TABLE `warehouses`
  ADD CONSTRAINT `warehouses_manager_id_fkey` FOREIGN KEY (`manager_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
