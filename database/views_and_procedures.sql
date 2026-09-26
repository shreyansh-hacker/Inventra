-- =====================================================================
-- INVENTRA — Analytical Views, Stored Procedures & Triggers
-- Automates Inventory Calculations, Dashboard KPIs & Integrity
-- =====================================================================

USE `inventra_db`;

DELIMITER $$

-- ---------------------------------------------------------------------
-- 1. VIEWS
-- ---------------------------------------------------------------------

-- Product stock summary across all racks & warehouses with computed health
DROP VIEW IF EXISTS `v_product_stock_summary`$$
CREATE VIEW `v_product_stock_summary` AS
SELECT 
  p.id AS product_id,
  p.name AS product_name,
  p.sku,
  p.barcode,
  c.name AS category_name,
  s.name AS supplier_name,
  w.name AS warehouse_name,
  w.short_code AS warehouse_short_code,
  z.code AS zone_code,
  r.name AS rack_name,
  CONCAT(w.short_code, ' / ', z.code, ' / ', r.name) AS full_location,
  p.unit,
  p.cost_price,
  p.selling_price,
  COALESCE(i.on_hand, 0) AS on_hand,
  COALESCE(i.reserved, 0) AS reserved,
  COALESCE(i.damaged, 0) AS damaged,
  COALESCE(i.available, 0) AS available,
  p.min_stock,
  p.max_stock,
  p.reorder_point,
  CASE
    WHEN COALESCE(i.available, 0) = 0 THEN 'critical'
    WHEN COALESCE(i.available, 0) <= p.reorder_point THEN 'low'
    WHEN COALESCE(i.available, 0) > p.max_stock THEN 'overstock'
    WHEN COALESCE(i.available, 0) <= (p.reorder_point * 1.25) THEN 'watch'
    ELSE 'healthy'
  END AS computed_health,
  p.last_movement_at,
  (COALESCE(i.on_hand, 0) * p.cost_price) AS total_inventory_cost_value,
  (COALESCE(i.on_hand, 0) * p.selling_price) AS total_inventory_selling_value
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN suppliers s ON p.supplier_id = s.id
LEFT JOIN product_inventory i ON p.id = i.product_id
LEFT JOIN racks r ON i.rack_id = r.id
LEFT JOIN zones z ON r.zone_id = z.id
LEFT JOIN warehouses w ON i.warehouse_id = w.id$$

-- Real-time Dashboard KPIs view
DROP VIEW IF EXISTS `v_dashboard_kpis`$$
CREATE VIEW `v_dashboard_kpis` AS
SELECT
  (SELECT COALESCE(SUM(i.on_hand * p.cost_price), 0) FROM product_inventory i JOIN products p ON i.product_id = p.id) AS total_stock_value,
  (SELECT COALESCE(SUM(on_hand), 0) FROM product_inventory) AS total_units,
  (SELECT COUNT(*) FROM products WHERE status = 'active') AS total_products,
  (SELECT COUNT(*) FROM v_product_stock_summary WHERE computed_health IN ('low', 'critical')) AS low_stock_count,
  (SELECT COUNT(*) FROM v_product_stock_summary WHERE on_hand = 0) AS out_of_stock_count,
  (SELECT COUNT(*) FROM receipts WHERE status IN ('waiting', 'received')) AS pending_receipts_count,
  (SELECT COUNT(*) FROM deliveries WHERE status IN ('ready', 'picking', 'draft')) AS pending_deliveries_count,
  (SELECT COUNT(*) FROM transfers WHERE status IN ('moving', 'pending')) AS active_transfers_count,
  (SELECT COUNT(*) FROM adjustments WHERE status = 'pending') AS pending_adjustments_count,
  (SELECT COUNT(*) FROM stock_ledger WHERE DATE(transaction_time) = CURRENT_DATE()) AS todays_movements_count$$

-- Warehouse Capacity & Utilization View
DROP VIEW IF EXISTS `v_warehouse_utilization`$$
CREATE VIEW `v_warehouse_utilization` AS
SELECT 
  w.id AS warehouse_id,
  w.name AS warehouse_name,
  w.short_code,
  w.capacity AS total_capacity,
  COALESCE(SUM(i.on_hand), 0) AS total_stored_units,
  ROUND((COALESCE(SUM(i.on_hand), 0) / w.capacity) * 100, 2) AS utilization_percent,
  COUNT(DISTINCT r.id) AS total_racks,
  COUNT(DISTINCT p.id) AS unique_products_stored
FROM warehouses w
LEFT JOIN zones z ON w.id = z.warehouse_id
LEFT JOIN racks r ON z.id = r.zone_id
LEFT JOIN product_inventory i ON r.id = i.rack_id
LEFT JOIN products p ON i.product_id = p.id
GROUP BY w.id, w.name, w.short_code, w.capacity$$

-- ---------------------------------------------------------------------
-- 2. STORED PROCEDURES
-- ---------------------------------------------------------------------

-- Procedure: Apply a Stock Adjustment atomically and update the ledger
DROP PROCEDURE IF EXISTS `sp_apply_stock_adjustment`$$
CREATE PROCEDURE `sp_apply_stock_adjustment`(
  IN p_adjustment_id VARCHAR(20),
  IN p_user_id VARCHAR(20)
)
BEGIN
  DECLARE v_product_id VARCHAR(20);
  DECLARE v_rack_id VARCHAR(20);
  DECLARE v_warehouse_id VARCHAR(20);
  DECLARE v_system_qty INT;
  DECLARE v_counted_qty INT;
  DECLARE v_diff INT;
  DECLARE v_ref VARCHAR(50);
  DECLARE v_reason VARCHAR(50);
  DECLARE v_current_on_hand INT;
  DECLARE v_new_on_hand INT;
  DECLARE v_ledger_id VARCHAR(20);

  START TRANSACTION;

  -- Fetch adjustment details
  SELECT product_id, rack_id, system_qty, counted_qty, difference, reference, reason
  INTO v_product_id, v_rack_id, v_system_qty, v_counted_qty, v_diff, v_ref, v_reason
  FROM adjustments
  WHERE id = p_adjustment_id AND status = 'pending'
  FOR UPDATE;

  IF v_product_id IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Pending adjustment not found or already applied.';
  END IF;

  -- Determine warehouse id from rack
  SELECT z.warehouse_id INTO v_warehouse_id
  FROM racks r
  JOIN zones z ON r.zone_id = z.id
  WHERE r.id = v_rack_id;

  -- Get current on-hand in inventory
  SELECT COALESCE(on_hand, 0) INTO v_current_on_hand
  FROM product_inventory
  WHERE product_id = v_product_id AND rack_id = v_rack_id
  FOR UPDATE;

  SET v_new_on_hand = v_current_on_hand + v_diff;
  IF v_new_on_hand < 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Adjustment would result in negative on-hand inventory.';
  END IF;

  -- Update product inventory
  UPDATE product_inventory
  SET on_hand = v_new_on_hand,
      last_counted_at = NOW()
  WHERE product_id = v_product_id AND rack_id = v_rack_id;

  -- Update adjustment record
  UPDATE adjustments
  SET status = 'applied',
      responsible_user_id = p_user_id
  WHERE id = p_adjustment_id;

  -- Generate unique ledger ID
  SET v_ledger_id = CONCAT('SL', LPAD(FLOOR(RAND() * 99999), 5, '0'));

  -- Insert immutable stock ledger entry
  INSERT INTO stock_ledger (
    id, transaction_time, product_id, rack_id, movement_type,
    before_qty, change_qty, after_qty, reference, user_id
  ) VALUES (
    v_ledger_id, NOW(), v_product_id, v_rack_id, 'Adjustment',
    v_current_on_hand, v_diff, v_new_on_hand, v_ref, p_user_id
  );

  -- Log into move history
  INSERT INTO move_history (
    id, reference, movement_date, product_id, quantity, unit,
    quantity_display, from_location, to_location, operation, user_id, status
  )
  SELECT 
    CONCAT('MV', LPAD(FLOOR(RAND() * 99999), 5, '0')),
    v_ref, NOW(), v_product_id, ABS(v_diff), p.unit,
    CONCAT(v_diff, ' ', p.unit),
    r.name,
    CASE WHEN v_diff < 0 THEN 'Damaged/Loss' ELSE 'Found Stock' END,
    'Adjustment',
    p_user_id,
    'applied'
  FROM products p
  JOIN racks r ON r.id = v_rack_id
  WHERE p.id = v_product_id;

  -- Update product last movement
  UPDATE products
  SET last_movement_at = NOW()
  WHERE id = v_product_id;

  COMMIT;
END$$

-- Procedure: Complete an internal transfer atomically
DROP PROCEDURE IF EXISTS `sp_complete_transfer`$$
CREATE PROCEDURE `sp_complete_transfer`(
  IN p_transfer_id VARCHAR(20),
  IN p_user_id VARCHAR(20)
)
BEGIN
  DECLARE v_from_rack_id VARCHAR(20);
  DECLARE v_to_rack_id VARCHAR(20);
  DECLARE v_product_id VARCHAR(20);
  DECLARE v_qty INT;
  DECLARE v_ref VARCHAR(50);
  DECLARE v_from_wh_id VARCHAR(20);
  DECLARE v_to_wh_id VARCHAR(20);
  DECLARE v_from_on_hand INT;
  DECLARE v_to_on_hand INT;

  START TRANSACTION;

  -- Fetch transfer details
  SELECT from_rack_id, to_rack_id, product_id, quantity, reference
  INTO v_from_rack_id, v_to_rack_id, v_product_id, v_qty, v_ref
  FROM transfers
  WHERE id = p_transfer_id AND status IN ('pending', 'moving')
  FOR UPDATE;

  IF v_product_id IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Transfer not found or not in transferable state.';
  END IF;

  -- Get source inventory
  SELECT COALESCE(on_hand, 0) INTO v_from_on_hand
  FROM product_inventory
  WHERE product_id = v_product_id AND rack_id = v_from_rack_id
  FOR UPDATE;

  IF v_from_on_hand < v_qty THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient stock at source rack for transfer.';
  END IF;

  -- Deduct from source
  UPDATE product_inventory
  SET on_hand = on_hand - v_qty
  WHERE product_id = v_product_id AND rack_id = v_from_rack_id;

  -- Ensure target inventory row exists and add stock
  SELECT z.warehouse_id INTO v_to_wh_id FROM racks r JOIN zones z ON r.zone_id = z.id WHERE r.id = v_to_rack_id;
  
  INSERT INTO product_inventory (product_id, warehouse_id, rack_id, on_hand, reserved, damaged)
  VALUES (v_product_id, v_to_wh_id, v_to_rack_id, v_qty, 0, 0)
  ON DUPLICATE KEY UPDATE on_hand = on_hand + v_qty;

  -- Record Ledger Out
  INSERT INTO stock_ledger (
    id, transaction_time, product_id, rack_id, movement_type,
    before_qty, change_qty, after_qty, reference, user_id
  ) VALUES (
    CONCAT('SL', LPAD(FLOOR(RAND() * 99999), 5, '0')),
    NOW(), v_product_id, v_from_rack_id, 'Transfer Out',
    v_from_on_hand, -v_qty, (v_from_on_hand - v_qty), v_ref, p_user_id
  );

  -- Record Ledger In
  SELECT COALESCE(on_hand, 0) INTO v_to_on_hand
  FROM product_inventory
  WHERE product_id = v_product_id AND rack_id = v_to_rack_id;

  INSERT INTO stock_ledger (
    id, transaction_time, product_id, rack_id, movement_type,
    before_qty, change_qty, after_qty, reference, user_id
  ) VALUES (
    CONCAT('SL', LPAD(FLOOR(RAND() * 99999), 5, '0')),
    NOW(), v_product_id, v_to_rack_id, 'Transfer In',
    (v_to_on_hand - v_qty), v_qty, v_to_on_hand, v_ref, p_user_id
  );

  -- Update transfer status
  UPDATE transfers
  SET status = 'done',
      completed_at = NOW(),
      responsible_user_id = p_user_id
  WHERE id = p_transfer_id;

  -- Update product movement timestamp
  UPDATE products SET last_movement_at = NOW() WHERE id = v_product_id;

  COMMIT;
END$$

DELIMITER ;
