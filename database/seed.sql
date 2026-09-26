-- =====================================================================
-- INVENTRA — Complete Demo & Initial Seed Data
-- Aligned with INVENTRA Demo Dataset
-- =====================================================================

USE `inventra_db`;

SET FOREIGN_KEY_CHECKS = 0;

-- Clear existing data
TRUNCATE TABLE `user_sessions`;
TRUNCATE TABLE `delivery_items`;
TRUNCATE TABLE `deliveries`;
TRUNCATE TABLE `receipt_items`;
TRUNCATE TABLE `receipts`;
TRUNCATE TABLE `transfers`;
TRUNCATE TABLE `adjustments`;
TRUNCATE TABLE `stock_ledger`;
TRUNCATE TABLE `move_history`;
TRUNCATE TABLE `alerts`;
TRUNCATE TABLE `product_inventory`;
TRUNCATE TABLE `products`;
TRUNCATE TABLE `customers`;
TRUNCATE TABLE `suppliers`;
TRUNCATE TABLE `categories`;
TRUNCATE TABLE `units_of_measure`;
TRUNCATE TABLE `racks`;
TRUNCATE TABLE `zones`;
TRUNCATE TABLE `warehouses`;
TRUNCATE TABLE `users`;
TRUNCATE TABLE `roles`;
TRUNCATE TABLE `system_settings`;

-- ---------------------------------------------------------------------
-- 1. ROLES & USERS
-- ---------------------------------------------------------------------
INSERT INTO `roles` (`id`, `name`, `description`, `permissions`) VALUES
('Admin', 'Inventory Administrator', 'Full system access across all warehouses, operations and configuration', '["*"]'),
('WarehouseManager', 'Warehouse Operations Manager', 'Manage stock movements, receipts, deliveries, transfers, and staff', '["products:read", "products:write", "receipts:*", "deliveries:*", "transfers:*", "adjustments:*"]'),
('Auditor', 'Inventory Quality Auditor', 'Inspect stock counts, audit ledgers, and review discrepancies', '["reports:read", "ledger:read", "adjustments:*"]'),
('InventoryClerk', 'Inventory Clerk', 'Perform stock counts, pick/pack, and record receipts', '["products:read", "receipts:read", "receipts:process", "deliveries:read", "deliveries:pick"]');

INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role_id`, `avatar`, `phone`, `status`, `joined_at`) VALUES
('USR-001', 'Yash Rathore', 'yash@inventra.internal', 'admin@123', 'Admin', 'YR', '+91 98765 00001', 'active', '2025-06-15'),
('USR-002', 'Priya Sharma', 'priya.sharma@inventra.internal', 'manager@123', 'WarehouseManager', 'PS', '+91 98765 00002', 'active', '2025-08-01'),
('USR-003', 'Rahul Verma', 'rahul.verma@inventra.internal', 'auditor@123', 'Auditor', 'RV', '+91 98765 00003', 'active', '2025-09-10');

-- ---------------------------------------------------------------------
-- 2. WAREHOUSES, ZONES & RACKS
-- ---------------------------------------------------------------------
INSERT INTO `warehouses` (`id`, `name`, `short_code`, `address`, `manager_id`, `capacity`, `used_capacity`, `status`) VALUES
('WH01', 'Main Warehouse', 'WH-A', '12 Industrial Area, Bhopal', 'USR-001', 5000, 3420, 'active'),
('WH02', 'Distribution Center', 'WH-B', '45 Logistics Park, Indore', 'USR-002', 3000, 1890, 'active');

INSERT INTO `zones` (`id`, `warehouse_id`, `name`, `code`, `description`) VALUES
('Z01', 'WH01', 'Storage Zone A', 'SZ-A', 'High-density shelving for raw metals & heavy items'),
('Z02', 'WH01', 'Storage Zone B', 'SZ-B', 'Electrical supplies and hardware items'),
('Z03', 'WH01', 'Production Floor', 'PF', 'Active manufacturing staging area'),
('Z04', 'WH01', 'Receiving Dock', 'RD', 'Inbound arrival dock and inspection staging'),
('Z05', 'WH02', 'Main Floor', 'MF', 'Finished furniture & packaged bulk items'),
('Z06', 'WH02', 'Cold Storage', 'CS', 'Temperature-controlled preservation zone');

INSERT INTO `racks` (`id`, `zone_id`, `name`, `capacity`, `used_capacity`, `status`) VALUES
('R01', 'Z01', 'Rack A01', 500, 320, 'active'),
('R02', 'Z01', 'Rack A02', 500, 410, 'active'),
('R03', 'Z01', 'Rack A03', 500, 180, 'active'),
('R04', 'Z02', 'Rack B01', 400, 350, 'active'),
('R05', 'Z02', 'Rack B02', 400, 260, 'active'),
('R06', 'Z03', 'Rack P01', 300, 120, 'active'),
('R07', 'Z03', 'Rack P02', 300, 280, 'active'),
('R08', 'Z04', 'Dock R01', 200, 90, 'active'),
('R09', 'Z05', 'Rack M01', 600, 540, 'active'),
('R10', 'Z05', 'Rack M02', 600, 310, 'active'),
('R11', 'Z06', 'Cold R01', 200, 180, 'active'),
('R12', 'Z06', 'Cold R02', 200, 50, 'active');

-- ---------------------------------------------------------------------
-- 3. UNITS OF MEASURE & CATEGORIES
-- ---------------------------------------------------------------------
INSERT INTO `units_of_measure` (`code`, `name`, `symbol`) VALUES
('kg', 'Kilogram', 'kg'),
('meter', 'Meter', 'm'),
('unit', 'Individual Unit', 'pcs'),
('bucket', 'Bucket Container', 'bkt'),
('bag', 'Heavy Bag', 'bag'),
('piece', 'Pipe / Piece', 'pc');

INSERT INTO `categories` (`id`, `name`, `description`) VALUES
('CAT01', 'Raw Materials', 'Base materials for fabrication and production'),
('CAT02', 'Finished Goods', 'Completed products ready for client delivery'),
('CAT03', 'Office Supplies', 'Operational workplace stationery and equipment'),
('CAT04', 'Packaging', 'Cardboard cartons, strapping and protective wrap'),
('CAT05', 'Electrical Components', 'Cables, breakers, switches, and lighting'),
('CAT06', 'Hardware', 'Industrial safety helmets, fasteners, tools'),
('CAT07', 'Furniture', 'Ergonomic chairs, desks, and storage fixtures');

-- ---------------------------------------------------------------------
-- 4. SUPPLIERS & CUSTOMERS
-- ---------------------------------------------------------------------
INSERT INTO `suppliers` (`id`, `name`, `contact_person`, `phone`, `email`, `address`) VALUES
('SUP01', 'Tata Steel Ltd', 'Rajesh Kumar', '+91 98765 43210', 'supply@tatasteel.com', 'Jamshedpur Works, Jharkhand'),
('SUP02', 'Havells India', 'Priya Sharma', '+91 87654 32109', 'orders@havells.com', 'QRG Towers, Noida, UP'),
('SUP03', 'Asian Paints', 'Vikram Singh', '+91 76543 21098', 'b2b@asianpaints.com', 'Santacruz East, Mumbai'),
('SUP04', 'Godrej Interio', 'Neha Patel', '+91 65432 10987', 'supply@godrej.com', 'Vikhroli, Mumbai, Maharashtra'),
('SUP05', 'Polycab Wires', 'Suresh Iyer', '+91 54321 09876', 'orders@polycab.com', 'Alkapuri, Vadodara, Gujarat');

INSERT INTO `customers` (`id`, `name`, `contact_person`, `phone`, `email`, `address`) VALUES
('CUS01', 'Metro Constructions', 'Arun Mehra', '+91 99887 76655', 'procurement@metroconstructions.in', 'Plot 23, Andheri East, Mumbai'),
('CUS02', 'Prestige Builders', 'Sunita Rao', '+91 98877 66554', 'orders@prestigebuilders.com', 'Sector 18, Noida, UP'),
('CUS03', 'NexGen Interiors', 'Rohan Verma', '+91 97766 55443', 'supply@nexgeninteriors.com', 'MG Road, Bangalore'),
('CUS04', 'Prime Electricals', 'Karan Gupta', '+91 96655 44332', 'prime.electricals@gmail.com', 'Karol Bagh, New Delhi'),
('CUS05', 'SkyHigh Developers', 'Ananya Deshmukh', '+91 95544 33221', 'materials@skyhighdev.com', 'Hinjewadi, Pune');

-- ---------------------------------------------------------------------
-- 5. PRODUCTS
-- ---------------------------------------------------------------------
INSERT INTO `products` (
  `id`, `name`, `sku`, `barcode`, `category_id`, `unit`,
  `cost_price`, `selling_price`, `min_stock`, `max_stock`, `reorder_point`,
  `supplier_id`, `default_warehouse_id`, `default_rack_id`,
  `health_status`, `status`, `last_movement_at`
) VALUES
('PRD01', 'Steel Rod (12mm)', 'STR-001', '8901234567890', 'CAT01', 'kg', 58.00, 72.00, 30, 500, 50, 'SUP01', 'WH01', 'R01', 'critical', 'active', '2026-09-26 09:15:00'),
('PRD02', 'Copper Wire (2.5mm)', 'CPW-002', '8901234567891', 'CAT05', 'meter', 32.00, 45.00, 100, 2000, 200, 'SUP05', 'WH01', 'R04', 'healthy', 'active', '2026-09-25 16:30:00'),
('PRD03', 'Office Chair (Ergonomic)', 'OCH-003', '8901234567892', 'CAT07', 'unit', 8500.00, 12000.00, 10, 100, 20, 'SUP04', 'WH02', 'R09', 'low', 'active', '2026-09-26 08:45:00'),
('PRD04', 'LED Panel Light (18W)', 'LED-004', '8901234567893', 'CAT05', 'unit', 280.00, 420.00, 50, 500, 80, 'SUP02', 'WH01', 'R02', 'healthy', 'active', '2026-09-25 14:20:00'),
('PRD05', 'Paint (Royal Shyne, 20L)', 'PNT-005', '8901234567894', 'CAT01', 'bucket', 4200.00, 5800.00, 15, 150, 30, 'SUP03', 'WH01', 'R05', 'healthy', 'active', '2026-09-24 11:00:00'),
('PRD06', 'MCB Switch (32A)', 'MCB-006', '8901234567895', 'CAT05', 'unit', 145.00, 210.00, 50, 400, 80, 'SUP02', 'WH01', 'R02', 'watch', 'active', '2026-09-26 07:30:00'),
('PRD07', 'Cement (OPC 53 Grade)', 'CMT-007', '8901234567896', 'CAT01', 'bag', 380.00, 450.00, 100, 800, 200, 'SUP01', 'WH01', 'R06', 'healthy', 'active', '2026-09-25 10:45:00'),
('PRD08', 'Desk (Executive Oak)', 'DSK-008', '8901234567897', 'CAT07', 'unit', 12000.00, 18500.00, 5, 40, 10, 'SUP04', 'WH02', 'R09', 'low', 'active', '2026-09-25 09:20:00'),
('PRD09', 'Packaging Box (Large)', 'PKG-009', '8901234567898', 'CAT04', 'unit', 25.00, 40.00, 200, 2000, 400, 'SUP01', 'WH01', 'R08', 'overstock', 'active', '2026-09-23 15:00:00'),
('PRD10', 'PVC Pipe (4 inch)', 'PVC-010', '8901234567899', 'CAT01', 'piece', 180.00, 260.00, 30, 300, 60, 'SUP03', 'WH01', 'R03', 'critical', 'active', '2026-09-22 12:00:00'),
('PRD11', 'Safety Helmet', 'SFH-011', '8901234567900', 'CAT06', 'unit', 350.00, 550.00, 20, 200, 40, 'SUP01', 'WH01', 'R04', 'healthy', 'active', '2026-09-24 08:30:00'),
('PRD12', 'Ceiling Fan (Decorative)', 'CFN-012', '8901234567901', 'CAT05', 'unit', 2200.00, 3400.00, 10, 100, 20, 'SUP02', 'WH02', 'R10', 'healthy', 'active', '2026-09-25 13:15:00');

-- ---------------------------------------------------------------------
-- 6. PRODUCT INVENTORY (Stock per Rack)
-- ---------------------------------------------------------------------
INSERT INTO `product_inventory` (`product_id`, `warehouse_id`, `rack_id`, `on_hand`, `reserved`, `damaged`, `last_counted_at`) VALUES
('PRD01', 'WH01', 'R01', 48, 12, 3, '2026-09-26 09:30:00'),
('PRD02', 'WH01', 'R04', 1450, 200, 0, '2026-09-25 16:30:00'),
('PRD03', 'WH02', 'R09', 18, 6, 1, '2026-09-26 08:45:00'),
('PRD04', 'WH01', 'R02', 234, 30, 0, '2026-09-25 14:20:00'),
('PRD05', 'WH01', 'R05', 67, 10, 2, '2026-09-24 11:00:00'),
('PRD06', 'WH01', 'R02', 62, 15, 0, '2026-09-26 07:30:00'),
('PRD07', 'WH01', 'R06', 540, 50, 0, '2026-09-25 10:45:00'),
('PRD08', 'WH02', 'R09', 7, 3, 0, '2026-09-25 09:20:00'),
('PRD09', 'WH01', 'R08', 1850, 100, 0, '2026-09-23 15:00:00'),
('PRD10', 'WH01', 'R03', 0, 0, 0, '2026-09-22 12:00:00'),
('PRD11', 'WH01', 'R04', 85, 0, 5, '2026-09-24 08:30:00'),
('PRD12', 'WH02', 'R10', 45, 8, 0, '2026-09-25 13:15:00');

-- ---------------------------------------------------------------------
-- 7. RECEIPTS & RECEIPT ITEMS
-- ---------------------------------------------------------------------
INSERT INTO `receipts` (`id`, `reference`, `supplier_id`, `warehouse_id`, `destination_rack_id`, `schedule_date`, `responsible_user_id`, `status`, `notes`, `created_at`, `completed_at`) VALUES
('REC01', 'WH/IN/0001', 'SUP01', 'WH01', 'R01', '2026-09-26', 'USR-001', 'done', 'Regular monthly supply received.', '2026-09-24 08:00:00', '2026-09-26 09:15:00'),
('REC02', 'WH/IN/0002', 'SUP02', 'WH01', 'R02', '2026-09-27', 'USR-002', 'waiting', 'Waiting for supplier dispatch confirmation.', '2026-09-25 10:30:00', NULL),
('REC03', 'WH/IN/0003', 'SUP05', 'WH01', 'R04', '2026-09-25', 'USR-001', 'received', 'Short receipt — 20m missing from shipment. Raised dispute.', '2026-09-23 14:00:00', '2026-09-25 16:30:00'),
('REC04', 'WH/IN/0004', 'SUP04', 'WH02', 'R09', '2026-09-28', 'USR-002', 'draft', '', '2026-09-26 08:00:00', NULL),
('REC05', 'WH/IN/0005', 'SUP03', 'WH01', 'R05', '2026-09-24', 'USR-001', 'done', 'Quality inspection passed.', '2026-09-22 09:00:00', '2026-09-24 11:00:00');

INSERT INTO `receipt_items` (`receipt_id`, `product_id`, `expected_qty`, `received_qty`, `unit`) VALUES
('REC01', 'PRD01', 100, 100, 'kg'),
('REC01', 'PRD07', 200, 200, 'bag'),
('REC02', 'PRD04', 100, 0, 'unit'),
('REC02', 'PRD06', 200, 0, 'unit'),
('REC03', 'PRD02', 500, 480, 'meter'),
('REC04', 'PRD03', 25, 0, 'unit'),
('REC04', 'PRD08', 10, 0, 'unit'),
('REC05', 'PRD05', 40, 40, 'bucket');

-- ---------------------------------------------------------------------
-- 8. DELIVERIES & DELIVERY ITEMS
-- ---------------------------------------------------------------------
INSERT INTO `deliveries` (`id`, `reference`, `customer_id`, `delivery_address`, `warehouse_id`, `schedule_date`, `responsible_user_id`, `status`, `notes`, `created_at`, `completed_at`) VALUES
('DEL01', 'WH/OUT/0001', 'CUS01', 'Plot 23, Andheri East, Mumbai', 'WH01', '2026-09-26', 'USR-001', 'delivered', 'Dispatched with Express Fleet Truck #4', '2026-09-24 09:00:00', '2026-09-26 14:30:00'),
('DEL02', 'WH/OUT/0002', 'CUS03', 'MG Road, Bangalore', 'WH02', '2026-09-27', 'USR-002', 'picking', 'Priority commercial fitout order', '2026-09-25 11:00:00', NULL),
('DEL03', 'WH/OUT/0003', 'CUS04', 'Karol Bagh, New Delhi', 'WH01', '2026-09-28', 'USR-001', 'ready', 'Awaiting customer pickup van', '2026-09-26 07:30:00', NULL),
('DEL04', 'WH/OUT/0004', 'CUS05', 'Hinjewadi, Pune', 'WH01', '2026-09-29', 'USR-001', 'draft', 'Consignment scheduled for weekend delivery', '2026-09-26 10:00:00', NULL);

INSERT INTO `delivery_items` (`delivery_id`, `product_id`, `requested_qty`, `reserved_qty`, `picked_qty`, `packed_qty`, `delivered_qty`, `unit`) VALUES
('DEL01', 'PRD01', 50, 50, 50, 50, 50, 'kg'),
('DEL01', 'PRD07', 100, 100, 100, 100, 100, 'bag'),
('DEL02', 'PRD03', 10, 6, 4, 0, 0, 'unit'),
('DEL02', 'PRD12', 8, 8, 0, 0, 0, 'unit'),
('DEL03', 'PRD04', 50, 50, 0, 0, 0, 'unit'),
('DEL03', 'PRD06', 30, 15, 0, 0, 0, 'unit'),
('DEL04', 'PRD05', 20, 0, 0, 0, 0, 'bucket'),
('DEL04', 'PRD10', 40, 0, 0, 0, 0, 'piece');

-- ---------------------------------------------------------------------
-- 9. TRANSFERS
-- ---------------------------------------------------------------------
INSERT INTO `transfers` (`id`, `reference`, `from_rack_id`, `to_rack_id`, `product_id`, `quantity`, `unit`, `responsible_user_id`, `status`, `notes`, `created_at`, `completed_at`) VALUES
('TRF01', 'WH/INT/0001', 'R01', 'R06', 'PRD01', 20, 'kg', 'USR-001', 'done', 'Material shift to manufacturing floor', '2026-09-25 09:00:00', '2026-09-25 09:45:00'),
('TRF02', 'WH/INT/0002', 'R04', 'R09', 'PRD02', 300, 'meter', 'USR-002', 'moving', 'Inter-warehouse transit from WH01 to WH02', '2026-09-26 08:30:00', NULL),
('TRF03', 'WH/INT/0003', 'R02', 'R07', 'PRD04', 40, 'unit', 'USR-001', 'done', 'Lighting batch replenishment', '2026-09-24 14:00:00', '2026-09-24 14:30:00'),
('TRF04', 'WH/INT/0004', 'R08', 'R01', 'PRD01', 50, 'kg', 'USR-001', 'pending', 'Dock intake transfer to permanent storage', '2026-09-26 10:00:00', NULL);

-- ---------------------------------------------------------------------
-- 10. ADJUSTMENTS
-- ---------------------------------------------------------------------
INSERT INTO `adjustments` (`id`, `reference`, `product_id`, `rack_id`, `system_qty`, `counted_qty`, `difference`, `reason`, `unit`, `responsible_user_id`, `status`, `notes`, `created_at`) VALUES
('ADJ01', 'WH/ADJ/0001', 'PRD01', 'R01', 51, 48, -3, 'Damage', 'kg', 'USR-001', 'applied', '3 kg found damaged due to moisture exposure.', '2026-09-26 09:30:00'),
('ADJ02', 'WH/ADJ/0002', 'PRD11', 'R04', 90, 85, -5, 'Counting Error', 'unit', 'USR-002', 'applied', 'Physical count mismatch found during weekly audit.', '2026-09-24 10:00:00'),
('ADJ03', 'WH/ADJ/0003', 'PRD05', 'R05', 65, 67, 2, 'Found Stock', 'bucket', 'USR-001', 'pending', '2 buckets found behind secondary shelf during cleanup.', '2026-09-26 10:15:00');

-- ---------------------------------------------------------------------
-- 11. STOCK LEDGER (Double-entry transaction history)
-- ---------------------------------------------------------------------
INSERT INTO `stock_ledger` (`id`, `transaction_time`, `product_id`, `rack_id`, `movement_type`, `before_qty`, `change_qty`, `after_qty`, `reference`, `user_id`) VALUES
('SL01', '2026-09-26 10:15:00', 'PRD05', 'R05', 'Adjustment', 65, 2, 67, 'WH/ADJ/0003', 'USR-001'),
('SL02', '2026-09-26 09:30:00', 'PRD01', 'R01', 'Adjustment', 51, -3, 48, 'WH/ADJ/0001', 'USR-001'),
('SL03', '2026-09-26 09:15:00', 'PRD01', 'R01', 'Receipt', 0, 100, 100, 'WH/IN/0001', 'USR-001'),
('SL04', '2026-09-26 09:15:00', 'PRD07', 'R06', 'Receipt', 340, 200, 540, 'WH/IN/0001', 'USR-001'),
('SL05', '2026-09-26 08:45:00', 'PRD03', 'R09', 'Reservation', 18, -6, 12, 'WH/OUT/0002', 'USR-002'),
('SL06', '2026-09-25 16:30:00', 'PRD02', 'R04', 'Receipt', 970, 480, 1450, 'WH/IN/0003', 'USR-001'),
('SL07', '2026-09-25 09:45:00', 'PRD01', 'R01', 'Transfer Out', 70, -20, 50, 'WH/INT/0001', 'USR-001'),
('SL08', '2026-09-25 09:45:00', 'PRD01', 'R06', 'Transfer In', 0, 20, 20, 'WH/INT/0001', 'USR-001'),
('SL09', '2026-09-24 14:30:00', 'PRD04', 'R02', 'Transfer Out', 274, -40, 234, 'WH/INT/0003', 'USR-001'),
('SL10', '2026-09-24 14:30:00', 'PRD04', 'R07', 'Transfer In', 0, 40, 40, 'WH/INT/0003', 'USR-001'),
('SL11', '2026-09-24 11:00:00', 'PRD05', 'R05', 'Receipt', 25, 40, 65, 'WH/IN/0005', 'USR-001'),
('SL12', '2026-09-24 10:00:00', 'PRD11', 'R04', 'Adjustment', 90, -5, 85, 'WH/ADJ/0002', 'USR-002');

-- ---------------------------------------------------------------------
-- 12. MOVE HISTORY
-- ---------------------------------------------------------------------
INSERT INTO `move_history` (`id`, `reference`, `movement_date`, `product_id`, `quantity`, `unit`, `quantity_display`, `from_location`, `to_location`, `operation`, `user_id`, `status`) VALUES
('MV01', 'WH/IN/0001', '2026-09-26 09:15:00', 'PRD01', 100, 'kg', '100 kg', 'Tata Steel Ltd', 'Rack A01', 'Receipt', 'USR-001', 'done'),
('MV02', 'WH/IN/0001', '2026-09-26 09:15:00', 'PRD07', 200, 'bag', '200 bag', 'Tata Steel Ltd', 'Rack P01', 'Receipt', 'USR-001', 'done'),
('MV03', 'WH/ADJ/0001', '2026-09-26 09:30:00', 'PRD01', 3, 'kg', '3 kg', 'Rack A01', 'Damaged', 'Adjustment', 'USR-001', 'applied'),
('MV04', 'WH/OUT/0002', '2026-09-26 08:45:00', 'PRD03', 6, 'unit', '6 unit', 'Rack M01', 'Reserved', 'Reservation', 'USR-002', 'in-progress'),
('MV05', 'WH/INT/0002', '2026-09-26 08:30:00', 'PRD02', 300, 'meter', '300 meter', 'Rack B01', 'Rack M01', 'Transfer', 'USR-002', 'moving'),
('MV06', 'WH/IN/0003', '2026-09-25 16:30:00', 'PRD02', 480, 'meter', '480 meter', 'Polycab Wires', 'Rack B01', 'Receipt', 'USR-001', 'done'),
('MV07', 'WH/INT/0001', '2026-09-25 09:00:00', 'PRD01', 20, 'kg', '20 kg', 'Rack A01', 'Rack P01', 'Transfer', 'USR-001', 'done'),
('MV08', 'WH/OUT/0001', '2026-09-26 14:30:00', 'PRD01', 50, 'kg', '50 kg', 'Rack A01', 'Metro Constructions', 'Delivery', 'USR-001', 'delivered'),
('MV09', 'WH/INT/0003', '2026-09-24 14:00:00', 'PRD04', 40, 'unit', '40 unit', 'Rack A02', 'Rack P02', 'Transfer', 'USR-001', 'done'),
('MV10', 'WH/IN/0005', '2026-09-24 11:00:00', 'PRD05', 40, 'bucket', '40 bucket', 'Asian Paints', 'Rack B02', 'Receipt', 'USR-001', 'done');

-- ---------------------------------------------------------------------
-- 13. SYSTEM ALERTS
-- ---------------------------------------------------------------------
INSERT INTO `alerts` (`id`, `type`, `title`, `description`, `product_id`, `rack_id`, `action_suggested`, `is_resolved`, `created_at`) VALUES
('ALR01', 'critical', 'PVC Pipe (4 inch) — Out of Stock', 'Available: 0 pieces. Reorder point: 60 pieces. No pending receipts.', 'PRD10', 'R03', 'Create replenishment order', 0, '2026-09-26 10:00:00'),
('ALR02', 'critical', 'Steel Rod (12mm) — Below Reorder Level', 'Available: 36 kg. Reorder point: 50 kg. Average weekly usage: 24 kg.', 'PRD01', 'R01', 'Create purchase order', 0, '2026-09-26 09:30:00'),
('ALR03', 'warning', 'Office Chair — Low Stock', 'Available: 12 units. Reorder point: 20 units. Pending delivery for 10 units.', 'PRD03', 'R09', 'Review delivery WH/OUT/0002', 0, '2026-09-26 08:45:00'),
('ALR04', 'warning', 'MCB Switch — Watch Level', 'Available: 47 units. Reorder point: 80 units. Receipt WH/IN/0002 pending (200 units).', 'PRD06', 'R02', 'Follow up on receipt WH/IN/0002', 0, '2026-09-26 07:30:00'),
('ALR05', 'warning', 'Desk (Executive Oak) — Low Stock', 'Available: 4 units. Reorder point: 10 units.', 'PRD08', 'R09', 'Place order with Godrej Interio', 0, '2026-09-25 09:20:00'),
('ALR06', 'info', 'Packaging Box — Overstocked', 'On hand: 1,850 units. Max stock: 2,000 units. Slow movement — 6 days since last use.', 'PRD09', 'R08', 'Review reorder rules', 0, '2026-09-26 06:00:00'),
('ALR07', 'warning', 'Copper Wire Transfer In-Progress', 'Transfer WH/INT/0002: 300m from WH-A to WH-B. Started 1.5 hours ago.', 'PRD02', NULL, 'Confirm transfer completion', 0, '2026-09-26 08:30:00'),
('ALR08', 'info', 'Short Receipt — Copper Wire', 'WH/IN/0003: Expected 500m, received 480m. Difference: -20m.', 'PRD02', 'R04', 'Follow up with Polycab Wires', 0, '2026-09-25 16:30:00'),
('ALR09', 'warning', 'Pending Adjustment Approval', 'WH/ADJ/0003: Found 2 buckets of Paint at Rack B02. Needs approval.', 'PRD05', 'R05', 'Approve adjustment', 0, '2026-09-26 10:15:00');

-- ---------------------------------------------------------------------
-- 14. SYSTEM SETTINGS
-- ---------------------------------------------------------------------
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_group`, `description`) VALUES
('company_name', 'INVENTRA Demo Corp', 'general', 'Organization registered display name'),
('currency', 'INR', 'general', 'Default currency ISO code'),
('currency_symbol', '₹', 'general', 'Currency visual symbol'),
('timezone', 'Asia/Kolkata', 'general', 'Server & transaction reporting timezone'),
('date_format', 'YYYY-MM-DD', 'general', 'Standard system date display format'),
('enable_auto_reorder_alerts', 'true', 'notifications', 'Automatically generate alerts when available stock dips below reorder point'),
('enable_stock_count_reconciliation', 'true', 'inventory', 'Enforce automatic adjustment creation on count discrepancies'),
('barcode_standard', 'EAN-13', 'inventory', 'Default product barcode format standard');

SET FOREIGN_KEY_CHECKS = 1;
