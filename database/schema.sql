-- =====================================================================
-- INVENTRA — Enterprise Inventory Management System
-- Database Schema: MySQL 8.0+
-- Character Set: utf8mb4 | Collation: utf8mb4_unicode_ci
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `inventra_db`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `inventra_db`;

-- Disable foreign key checks during schema creation
SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------
-- 1. USERS, ROLES & AUTHENTICATION
-- ---------------------------------------------------------------------

DROP TABLE IF EXISTS `user_sessions`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `roles`;

CREATE TABLE `roles` (
  `id` VARCHAR(30) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(255) NULL,
  `permissions` JSON NULL COMMENT 'Array of permission strings',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

CREATE TABLE `users` (
  `id` VARCHAR(20) NOT NULL COMMENT 'e.g. USR-001',
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL DEFAULT '$2b$10$e8w.demo.password.hash.inventra2026',
  `role_id` VARCHAR(30) NOT NULL DEFAULT 'Admin',
  `avatar` VARCHAR(10) NOT NULL DEFAULT 'YR',
  `phone` VARCHAR(30) NULL,
  `status` ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
  `joined_at` DATE NOT NULL DEFAULT (CURRENT_DATE),
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_email` (`email`),
  KEY `idx_users_role` (`role_id`),
  KEY `idx_users_status` (`status`),
  CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `user_sessions` (
  `session_id` VARCHAR(64) NOT NULL,
  `user_id` VARCHAR(20) NOT NULL,
  `token` VARCHAR(255) NOT NULL,
  `remember_me` TINYINT(1) NOT NULL DEFAULT 0,
  `ip_address` VARCHAR(45) NULL,
  `user_agent` VARCHAR(255) NULL,
  `expires_at` DATETIME NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`session_id`),
  UNIQUE KEY `uk_session_token` (`token`),
  KEY `idx_sessions_user` (`user_id`),
  KEY `idx_sessions_expires` (`expires_at`),
  CONSTRAINT `fk_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 2. WAREHOUSE HIERARCHY (Warehouses -> Zones -> Racks)
-- ---------------------------------------------------------------------

DROP TABLE IF EXISTS `racks`;
DROP TABLE IF EXISTS `zones`;
DROP TABLE IF EXISTS `warehouses`;

CREATE TABLE `warehouses` (
  `id` VARCHAR(20) NOT NULL COMMENT 'e.g. WH01',
  `name` VARCHAR(100) NOT NULL,
  `short_code` VARCHAR(20) NOT NULL COMMENT 'e.g. WH-A',
  `address` TEXT NOT NULL,
  `manager_id` VARCHAR(20) NULL,
  `capacity` INT UNSIGNED NOT NULL DEFAULT 5000,
  `used_capacity` INT UNSIGNED NOT NULL DEFAULT 0,
  `status` ENUM('active', 'maintenance', 'inactive') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_warehouses_short_code` (`short_code`),
  KEY `idx_warehouses_manager` (`manager_id`),
  CONSTRAINT `fk_warehouses_manager` FOREIGN KEY (`manager_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `zones` (
  `id` VARCHAR(20) NOT NULL COMMENT 'e.g. Z01',
  `warehouse_id` VARCHAR(20) NOT NULL,
  `name` VARCHAR(100) NOT NULL COMMENT 'e.g. Storage Zone A',
  `code` VARCHAR(20) NOT NULL COMMENT 'e.g. SZ-A, PF, RD, MF, CS',
  `description` VARCHAR(255) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_zone_wh_code` (`warehouse_id`, `code`),
  KEY `idx_zones_warehouse` (`warehouse_id`),
  CONSTRAINT `fk_zones_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `racks` (
  `id` VARCHAR(20) NOT NULL COMMENT 'e.g. R01',
  `zone_id` VARCHAR(20) NOT NULL,
  `name` VARCHAR(100) NOT NULL COMMENT 'e.g. Rack A01, Dock R01',
  `capacity` INT UNSIGNED NOT NULL DEFAULT 500,
  `used_capacity` INT UNSIGNED NOT NULL DEFAULT 0,
  `status` ENUM('active', 'maintenance', 'full') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_racks_zone` (`zone_id`),
  CONSTRAINT `fk_racks_zone` FOREIGN KEY (`zone_id`) REFERENCES `zones` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 3. PRODUCT CATALOG, CATEGORIES, SUPPLIERS & CUSTOMERS
-- ---------------------------------------------------------------------

DROP TABLE IF EXISTS `product_inventory`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `customers`;
DROP TABLE IF EXISTS `suppliers`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `units_of_measure`;

CREATE TABLE `units_of_measure` (
  `code` VARCHAR(20) NOT NULL COMMENT 'kg, meter, unit, bucket, bag, piece',
  `name` VARCHAR(50) NOT NULL,
  `symbol` VARCHAR(10) NOT NULL,
  PRIMARY KEY (`code`)
) ENGINE=InnoDB;

CREATE TABLE `categories` (
  `id` VARCHAR(20) NOT NULL COMMENT 'e.g. CAT01',
  `name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(255) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_categories_name` (`name`)
) ENGINE=InnoDB;

CREATE TABLE `suppliers` (
  `id` VARCHAR(20) NOT NULL COMMENT 'e.g. SUP01',
  `name` VARCHAR(150) NOT NULL,
  `contact_person` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(30) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `address` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_suppliers_name` (`name`),
  KEY `idx_suppliers_email` (`email`)
) ENGINE=InnoDB;

CREATE TABLE `customers` (
  `id` VARCHAR(20) NOT NULL COMMENT 'e.g. CUS01',
  `name` VARCHAR(150) NOT NULL,
  `contact_person` VARCHAR(100) NULL,
  `phone` VARCHAR(30) NULL,
  `email` VARCHAR(150) NULL,
  `address` TEXT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_customers_name` (`name`)
) ENGINE=InnoDB;

CREATE TABLE `products` (
  `id` VARCHAR(20) NOT NULL COMMENT 'e.g. PRD01',
  `name` VARCHAR(150) NOT NULL,
  `sku` VARCHAR(50) NOT NULL,
  `barcode` VARCHAR(50) NOT NULL,
  `category_id` VARCHAR(20) NOT NULL,
  `unit` VARCHAR(20) NOT NULL DEFAULT 'unit',
  `cost_price` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `selling_price` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `min_stock` INT UNSIGNED NOT NULL DEFAULT 10,
  `max_stock` INT UNSIGNED NOT NULL DEFAULT 500,
  `reorder_point` INT UNSIGNED NOT NULL DEFAULT 20,
  `supplier_id` VARCHAR(20) NOT NULL,
  `default_warehouse_id` VARCHAR(20) NOT NULL,
  `default_rack_id` VARCHAR(20) NOT NULL,
  `health_status` ENUM('healthy', 'watch', 'low', 'critical', 'overstock') NOT NULL DEFAULT 'healthy',
  `status` ENUM('active', 'archived', 'discontinued') NOT NULL DEFAULT 'active',
  `last_movement_at` DATETIME NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_products_sku` (`sku`),
  UNIQUE KEY `uk_products_barcode` (`barcode`),
  KEY `idx_products_category` (`category_id`),
  KEY `idx_products_supplier` (`supplier_id`),
  KEY `idx_products_warehouse` (`default_warehouse_id`),
  KEY `idx_products_rack` (`default_rack_id`),
  KEY `idx_products_health` (`health_status`),
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_products_unit` FOREIGN KEY (`unit`) REFERENCES `units_of_measure` (`code`) ON UPDATE CASCADE,
  CONSTRAINT `fk_products_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_products_warehouse` FOREIGN KEY (`default_warehouse_id`) REFERENCES `warehouses` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_products_rack` FOREIGN KEY (`default_rack_id`) REFERENCES `racks` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 4. REAL-TIME INVENTORY & STOCK LEVELS PER RACK
-- ---------------------------------------------------------------------

CREATE TABLE `product_inventory` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` VARCHAR(20) NOT NULL,
  `warehouse_id` VARCHAR(20) NOT NULL,
  `rack_id` VARCHAR(20) NOT NULL,
  `on_hand` INT NOT NULL DEFAULT 0,
  `reserved` INT NOT NULL DEFAULT 0,
  `damaged` INT NOT NULL DEFAULT 0,
  `available` INT GENERATED ALWAYS AS (GREATEST(0, on_hand - reserved - damaged)) STORED,
  `last_counted_at` DATETIME NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_product_warehouse_rack` (`product_id`, `warehouse_id`, `rack_id`),
  KEY `idx_inv_product` (`product_id`),
  KEY `idx_inv_warehouse` (`warehouse_id`),
  KEY `idx_inv_rack` (`rack_id`),
  CONSTRAINT `fk_inv_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_inv_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_inv_rack` FOREIGN KEY (`rack_id`) REFERENCES `racks` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 5. INBOUND RECEIPTS (Supplier -> Warehouse)
-- ---------------------------------------------------------------------

DROP TABLE IF EXISTS `receipt_items`;
DROP TABLE IF EXISTS `receipts`;

CREATE TABLE `receipts` (
  `id` VARCHAR(20) NOT NULL COMMENT 'e.g. REC01',
  `reference` VARCHAR(50) NOT NULL COMMENT 'e.g. WH/IN/0001',
  `supplier_id` VARCHAR(20) NOT NULL,
  `warehouse_id` VARCHAR(20) NOT NULL,
  `destination_rack_id` VARCHAR(20) NOT NULL,
  `schedule_date` DATE NOT NULL,
  `responsible_user_id` VARCHAR(20) NOT NULL,
  `status` ENUM('draft', 'waiting', 'received', 'done', 'cancelled') NOT NULL DEFAULT 'draft',
  `notes` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` DATETIME NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_receipts_reference` (`reference`),
  KEY `idx_receipts_supplier` (`supplier_id`),
  KEY `idx_receipts_warehouse` (`warehouse_id`),
  KEY `idx_receipts_destination` (`destination_rack_id`),
  KEY `idx_receipts_responsible` (`responsible_user_id`),
  KEY `idx_receipts_status` (`status`),
  CONSTRAINT `fk_receipts_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_receipts_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_receipts_rack` FOREIGN KEY (`destination_rack_id`) REFERENCES `racks` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_receipts_user` FOREIGN KEY (`responsible_user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `receipt_items` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `receipt_id` VARCHAR(20) NOT NULL,
  `product_id` VARCHAR(20) NOT NULL,
  `expected_qty` INT NOT NULL,
  `received_qty` INT NOT NULL DEFAULT 0,
  `difference` INT GENERATED ALWAYS AS (received_qty - expected_qty) STORED,
  `unit` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_rec_items_receipt` (`receipt_id`),
  KEY `idx_rec_items_product` (`product_id`),
  CONSTRAINT `fk_rec_items_receipt` FOREIGN KEY (`receipt_id`) REFERENCES `receipts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_rec_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 6. OUTBOUND DELIVERIES (Warehouse -> Customer)
-- ---------------------------------------------------------------------

DROP TABLE IF EXISTS `delivery_items`;
DROP TABLE IF EXISTS `deliveries`;

CREATE TABLE `deliveries` (
  `id` VARCHAR(20) NOT NULL COMMENT 'e.g. DEL01',
  `reference` VARCHAR(50) NOT NULL COMMENT 'e.g. WH/OUT/0001',
  `customer_id` VARCHAR(20) NOT NULL,
  `delivery_address` TEXT NOT NULL,
  `warehouse_id` VARCHAR(20) NOT NULL,
  `schedule_date` DATE NOT NULL,
  `responsible_user_id` VARCHAR(20) NOT NULL,
  `status` ENUM('draft', 'ready', 'picking', 'packed', 'delivered', 'cancelled') NOT NULL DEFAULT 'draft',
  `notes` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` DATETIME NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_deliveries_reference` (`reference`),
  KEY `idx_del_customer` (`customer_id`),
  KEY `idx_del_warehouse` (`warehouse_id`),
  KEY `idx_del_responsible` (`responsible_user_id`),
  KEY `idx_del_status` (`status`),
  CONSTRAINT `fk_del_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_del_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_del_user` FOREIGN KEY (`responsible_user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `delivery_items` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `delivery_id` VARCHAR(20) NOT NULL,
  `product_id` VARCHAR(20) NOT NULL,
  `requested_qty` INT NOT NULL,
  `reserved_qty` INT NOT NULL DEFAULT 0,
  `picked_qty` INT NOT NULL DEFAULT 0,
  `packed_qty` INT NOT NULL DEFAULT 0,
  `delivered_qty` INT NOT NULL DEFAULT 0,
  `unit` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_del_items_delivery` (`delivery_id`),
  KEY `idx_del_items_product` (`product_id`),
  CONSTRAINT `fk_del_items_delivery` FOREIGN KEY (`delivery_id`) REFERENCES `deliveries` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_del_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 7. INTERNAL TRANSFERS (Location A -> Location B)
-- ---------------------------------------------------------------------

DROP TABLE IF EXISTS `transfers`;

CREATE TABLE `transfers` (
  `id` VARCHAR(20) NOT NULL COMMENT 'e.g. TRF01',
  `reference` VARCHAR(50) NOT NULL COMMENT 'e.g. WH/INT/0001',
  `from_rack_id` VARCHAR(20) NOT NULL,
  `to_rack_id` VARCHAR(20) NOT NULL,
  `product_id` VARCHAR(20) NOT NULL,
  `quantity` INT NOT NULL,
  `unit` VARCHAR(20) NOT NULL,
  `responsible_user_id` VARCHAR(20) NOT NULL,
  `status` ENUM('draft', 'pending', 'moving', 'done', 'cancelled') NOT NULL DEFAULT 'draft',
  `notes` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` DATETIME NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_transfers_reference` (`reference`),
  KEY `idx_transfers_from_rack` (`from_rack_id`),
  KEY `idx_transfers_to_rack` (`to_rack_id`),
  KEY `idx_transfers_product` (`product_id`),
  KEY `idx_transfers_user` (`responsible_user_id`),
  KEY `idx_transfers_status` (`status`),
  CONSTRAINT `fk_transfers_from_rack` FOREIGN KEY (`from_rack_id`) REFERENCES `racks` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_transfers_to_rack` FOREIGN KEY (`to_rack_id`) REFERENCES `racks` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_transfers_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_transfers_user` FOREIGN KEY (`responsible_user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 8. STOCK ADJUSTMENTS & RECONCILIATIONS
-- ---------------------------------------------------------------------

DROP TABLE IF EXISTS `adjustments`;

CREATE TABLE `adjustments` (
  `id` VARCHAR(20) NOT NULL COMMENT 'e.g. ADJ01',
  `reference` VARCHAR(50) NOT NULL COMMENT 'e.g. WH/ADJ/0001',
  `product_id` VARCHAR(20) NOT NULL,
  `rack_id` VARCHAR(20) NOT NULL,
  `system_qty` INT NOT NULL,
  `counted_qty` INT NOT NULL,
  `difference` INT NOT NULL,
  `reason` ENUM('Damage', 'Counting Error', 'Found Stock', 'Theft', 'Expired', 'Other') NOT NULL DEFAULT 'Counting Error',
  `unit` VARCHAR(20) NOT NULL,
  `responsible_user_id` VARCHAR(20) NOT NULL,
  `status` ENUM('pending', 'applied', 'rejected') NOT NULL DEFAULT 'pending',
  `notes` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_adjustments_reference` (`reference`),
  KEY `idx_adj_product` (`product_id`),
  KEY `idx_adj_rack` (`rack_id`),
  KEY `idx_adj_user` (`responsible_user_id`),
  KEY `idx_adj_status` (`status`),
  CONSTRAINT `fk_adj_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_adj_rack` FOREIGN KEY (`rack_id`) REFERENCES `racks` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_adj_user` FOREIGN KEY (`responsible_user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 9. IMMUTABLE STOCK LEDGER (Every Stock Change Recorded)
-- ---------------------------------------------------------------------

DROP TABLE IF EXISTS `stock_ledger`;

CREATE TABLE `stock_ledger` (
  `id` VARCHAR(20) NOT NULL COMMENT 'e.g. SL01',
  `transaction_time` DATETIME NOT NULL,
  `product_id` VARCHAR(20) NOT NULL,
  `rack_id` VARCHAR(20) NOT NULL,
  `movement_type` ENUM('Receipt', 'Delivery', 'Transfer In', 'Transfer Out', 'Adjustment', 'Reservation') NOT NULL,
  `before_qty` INT NOT NULL,
  `change_qty` INT NOT NULL,
  `after_qty` INT NOT NULL,
  `reference` VARCHAR(50) NOT NULL,
  `user_id` VARCHAR(20) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_ledger_product` (`product_id`),
  KEY `idx_ledger_rack` (`rack_id`),
  KEY `idx_ledger_time` (`transaction_time`),
  KEY `idx_ledger_ref` (`reference`),
  KEY `idx_ledger_user` (`user_id`),
  CONSTRAINT `fk_ledger_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_ledger_rack` FOREIGN KEY (`rack_id`) REFERENCES `racks` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_ledger_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 10. MOVE HISTORY & AUDIT TRAIL
-- ---------------------------------------------------------------------

DROP TABLE IF EXISTS `move_history`;

CREATE TABLE `move_history` (
  `id` VARCHAR(20) NOT NULL COMMENT 'e.g. MV01',
  `reference` VARCHAR(50) NOT NULL,
  `movement_date` DATETIME NOT NULL,
  `product_id` VARCHAR(20) NOT NULL,
  `quantity` INT NOT NULL,
  `unit` VARCHAR(20) NOT NULL,
  `quantity_display` VARCHAR(50) NOT NULL COMMENT 'e.g. 100 kg, 300 meter',
  `from_location` VARCHAR(150) NOT NULL,
  `to_location` VARCHAR(150) NOT NULL,
  `operation` ENUM('Receipt', 'Delivery', 'Transfer', 'Adjustment', 'Reservation') NOT NULL,
  `user_id` VARCHAR(20) NOT NULL,
  `status` ENUM('done', 'applied', 'in-progress', 'moving', 'delivered', 'pending') NOT NULL DEFAULT 'done',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_move_product` (`product_id`),
  KEY `idx_move_date` (`movement_date`),
  KEY `idx_move_ref` (`reference`),
  KEY `idx_move_user` (`user_id`),
  CONSTRAINT `fk_move_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_move_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 11. ALERTS & NOTIFICATIONS
-- ---------------------------------------------------------------------

DROP TABLE IF EXISTS `alerts`;

CREATE TABLE `alerts` (
  `id` VARCHAR(20) NOT NULL COMMENT 'e.g. ALR01',
  `type` ENUM('critical', 'warning', 'info') NOT NULL DEFAULT 'info',
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `product_id` VARCHAR(20) NULL,
  `rack_id` VARCHAR(20) NULL,
  `action_suggested` VARCHAR(255) NOT NULL,
  `is_resolved` TINYINT(1) NOT NULL DEFAULT 0,
  `resolved_at` DATETIME NULL,
  `resolved_by` VARCHAR(20) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_alerts_type` (`type`),
  KEY `idx_alerts_product` (`product_id`),
  KEY `idx_alerts_rack` (`rack_id`),
  KEY `idx_alerts_resolved` (`is_resolved`),
  CONSTRAINT `fk_alerts_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_alerts_rack` FOREIGN KEY (`rack_id`) REFERENCES `racks` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_alerts_resolved_by` FOREIGN KEY (`resolved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 12. SYSTEM CONFIGURATION & WORKSPACE SETTINGS
-- ---------------------------------------------------------------------

DROP TABLE IF EXISTS `system_settings`;

CREATE TABLE `system_settings` (
  `setting_key` VARCHAR(60) NOT NULL,
  `setting_value` TEXT NOT NULL,
  `setting_group` VARCHAR(40) NOT NULL DEFAULT 'general',
  `description` VARCHAR(255) NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`setting_key`),
  KEY `idx_settings_group` (`setting_group`)
) ENGINE=InnoDB;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
