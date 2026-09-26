-- =====================================================================
-- INVENTRA — Useful Operational SQL Queries
-- Ready-to-use queries for backend endpoints and operational reports
-- =====================================================================

USE `inventra_db`;

-- 1. Real-time Dashboard KPI Summary
SELECT * FROM v_dashboard_kpis;

-- 2. Products List with stock levels, computed health, and location
SELECT 
  product_id,
  product_name,
  sku,
  barcode,
  category_name,
  supplier_name,
  full_location,
  on_hand,
  reserved,
  available,
  damaged,
  reorder_point,
  computed_health,
  last_movement_at
FROM v_product_stock_summary
ORDER BY product_name ASC;

-- 3. Critical and Low Stock Items Needing Immediate Reorder
SELECT 
  product_id,
  product_name,
  sku,
  available,
  reorder_point,
  supplier_name,
  computed_health
FROM v_product_stock_summary
WHERE computed_health IN ('critical', 'low')
ORDER BY available ASC;

-- 4. Inbound Receipts with Supplier details and item count
SELECT 
  r.id,
  r.reference,
  s.name AS supplier_name,
  w.name AS warehouse_name,
  r.schedule_date,
  u.name AS responsible_user,
  r.status,
  COUNT(ri.id) AS total_items,
  SUM(ri.expected_qty) AS total_expected_units,
  SUM(ri.received_qty) AS total_received_units
FROM receipts r
JOIN suppliers s ON r.supplier_id = s.id
JOIN warehouses w ON r.warehouse_id = w.id
JOIN users u ON r.responsible_user_id = u.id
LEFT JOIN receipt_items ri ON r.id = ri.receipt_id
GROUP BY r.id, r.reference, s.name, w.name, r.schedule_date, u.name, r.status
ORDER BY r.schedule_date DESC;

-- 5. Outbound Deliveries with Customer details and fulfillment progress
SELECT 
  d.id,
  d.reference,
  c.name AS customer_name,
  w.name AS warehouse_name,
  d.schedule_date,
  u.name AS responsible_user,
  d.status,
  SUM(di.requested_qty) AS total_requested,
  SUM(di.delivered_qty) AS total_delivered
FROM deliveries d
JOIN customers c ON d.customer_id = c.id
JOIN warehouses w ON d.warehouse_id = w.id
JOIN users u ON d.responsible_user_id = u.id
LEFT JOIN delivery_items di ON d.id = di.delivery_id
GROUP BY d.id, d.reference, c.name, w.name, d.schedule_date, u.name, d.status
ORDER BY d.schedule_date DESC;

-- 6. Full Stock Ledger Audit Trail (Double-Entry Log)
SELECT 
  sl.id,
  sl.transaction_time,
  p.name AS product_name,
  r.name AS rack_name,
  sl.movement_type,
  sl.before_qty,
  sl.change_qty,
  sl.after_qty,
  sl.reference,
  u.name AS performed_by
FROM stock_ledger sl
JOIN products p ON sl.product_id = p.id
JOIN racks r ON sl.rack_id = r.id
JOIN users u ON sl.user_id = u.id
ORDER BY sl.transaction_time DESC;

-- 7. Unresolved Stock & Warehouse Alerts
SELECT 
  a.id,
  a.type,
  a.title,
  a.description,
  p.name AS product_name,
  r.name AS location,
  a.action_suggested,
  a.created_at
FROM alerts a
LEFT JOIN products p ON a.product_id = p.id
LEFT JOIN racks r ON a.rack_id = r.id
WHERE a.is_resolved = 0
ORDER BY 
  CASE a.type 
    WHEN 'critical' THEN 1 
    WHEN 'warning' THEN 2 
    ELSE 3 
  END,
  a.created_at DESC;

-- 8. Warehouse Capacity Utilization
SELECT * FROM v_warehouse_utilization;
