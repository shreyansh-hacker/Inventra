import prisma from '../lib/prisma.js';

export async function ensureSeedData() {
  try {
    // 1. Roles
    const roles = [
      { id: 'ADMIN', name: 'Inventory Administrator', description: 'Full system access', permissions: '["*"]' },
      { id: 'INVENTORY_MANAGER', name: 'Warehouse Operations Manager', description: 'Manage stock movements and receipts', permissions: '["products:*", "receipts:*", "deliveries:*"]' },
      { id: 'WAREHOUSE_STAFF', name: 'Warehouse Staff', description: 'Perform counts, pick/pack', permissions: '["receipts:read", "deliveries:read"]' },
      { id: 'VIEWER', name: 'Auditor / Viewer', description: 'Read-only access', permissions: '["reports:read", "ledger:read"]' },
    ];
    for (const role of roles) {
      await prisma.role.upsert({
        where: { id: role.id },
        update: { name: role.name },
        create: role,
      });
    }

    // 2. Categories
    const categories = [
      { id: 'CAT01', name: 'Raw Materials', description: 'Base metals, plastics, chemicals' },
      { id: 'CAT02', name: 'Finished Goods', description: 'Ready for client shipping' },
      { id: 'CAT03', name: 'Packaging', description: 'Cardboard boxes, pallets' },
      { id: 'CAT04', name: 'Electrical Components', description: 'Cables, panels, switches' },
      { id: 'CAT05', name: 'Hardware', description: 'Bolts, screws, fasteners, tools' },
      { id: 'CAT06', name: 'Furniture', description: 'Chairs, desks, fixtures' },
    ];
    for (const cat of categories) {
      await prisma.category.upsert({
        where: { id: cat.id },
        update: { name: cat.name },
        create: cat,
      });
    }

    // 3. Suppliers
    const suppliers = [
      { id: 'SUP01', name: 'Tata Steel Ltd', contactPerson: 'Rajesh Kumar', phone: '+91 98765 43210', email: 'supply@tatasteel.com', address: 'Jamshedpur Works, Jharkhand' },
      { id: 'SUP02', name: 'Havells India', contactPerson: 'Priya Sharma', phone: '+91 87654 32109', email: 'orders@havells.com', address: 'QRG Towers, Noida, UP' },
      { id: 'SUP03', name: 'Asian Paints', contactPerson: 'Vikram Singh', phone: '+91 76543 21098', email: 'b2b@asianpaints.com', address: 'Santacruz East, Mumbai' },
      { id: 'SUP04', name: 'Godrej Interio', contactPerson: 'Neha Patel', phone: '+91 65432 10987', email: 'supply@godrej.com', address: 'Vikhroli, Mumbai' },
      { id: 'SUP05', name: 'Polycab Wires', contactPerson: 'Suresh Iyer', phone: '+91 54321 09876', email: 'orders@polycab.com', address: 'Alkapuri, Vadodara' },
    ];
    for (const sup of suppliers) {
      await prisma.supplier.upsert({
        where: { id: sup.id },
        update: { name: sup.name },
        create: sup,
      });
    }

    // 4. Customers
    const customers = [
      { id: 'CUS01', name: 'Metro Constructions', contactPerson: 'Arun Mehra', phone: '+91 99887 76655', email: 'procurement@metroconstructions.in', address: 'Plot 23, Andheri East, Mumbai' },
      { id: 'CUS02', name: 'NexGen Interiors', contactPerson: 'Rohan Verma', phone: '+91 97766 55443', email: 'supply@nexgeninteriors.com', address: 'MG Road, Bangalore' },
      { id: 'CUS03', name: 'Prime Electricals', contactPerson: 'Karan Gupta', phone: '+91 96655 44332', email: 'prime.electricals@gmail.com', address: 'Karol Bagh, New Delhi' },
      { id: 'CUS04', name: 'SkyHigh Developers', contactPerson: 'Ananya Deshmukh', phone: '+91 95544 33221', email: 'materials@skyhighdev.com', address: 'Hinjewadi, Pune' },
    ];
    for (const cus of customers) {
      await prisma.customer.upsert({
        where: { id: cus.id },
        update: { name: cus.name },
        create: cus,
      });
    }

    // 5. Warehouses
    const warehouses = [
      { id: 'WH01', name: 'Main Warehouse', shortCode: 'WH-A', address: '12 Industrial Area, Bhopal', capacity: 5000 },
      { id: 'WH02', name: 'Distribution Center', shortCode: 'WH-B', address: '45 Logistics Park, Indore', capacity: 3000 },
      { id: 'WH03', name: 'Production Store', shortCode: 'WH-C', address: 'Industrial Sub-zone 3, Mandideep', capacity: 2000 },
    ];
    for (const wh of warehouses) {
      await prisma.warehouse.upsert({
        where: { id: wh.id },
        update: { name: wh.name, capacity: wh.capacity },
        create: wh,
      });
    }

    // 6. Locations (Warehouse -> Zone -> Rack -> Shelf -> Bin)
    const locations = [
      { id: 'LOC-WH01-SZA-R01', warehouseId: 'WH01', zone: 'Storage Zone A', rack: 'Rack A01', shelf: 'S1', bin: 'B1', code: 'WH-A/SZ-A/R01/S1/B1', capacity: 500 },
      { id: 'LOC-WH01-SZA-R02', warehouseId: 'WH01', zone: 'Storage Zone A', rack: 'Rack A02', shelf: 'S1', bin: 'B1', code: 'WH-A/SZ-A/R02/S1/B1', capacity: 500 },
      { id: 'LOC-WH01-SZA-R03', warehouseId: 'WH01', zone: 'Storage Zone A', rack: 'Rack A03', shelf: 'S1', bin: 'B1', code: 'WH-A/SZ-A/R03/S1/B1', capacity: 500 },
      { id: 'LOC-WH01-SZB-R01', warehouseId: 'WH01', zone: 'Storage Zone B', rack: 'Rack B01', shelf: 'S1', bin: 'B1', code: 'WH-A/SZ-B/R01/S1/B1', capacity: 400 },
      { id: 'LOC-WH01-SZB-R02', warehouseId: 'WH01', zone: 'Storage Zone B', rack: 'Rack B02', shelf: 'S1', bin: 'B1', code: 'WH-A/SZ-B/R02/S1/B1', capacity: 400 },
      { id: 'LOC-WH01-PF-P01', warehouseId: 'WH01', zone: 'Production Floor', rack: 'Rack P01', shelf: 'S1', bin: 'B1', code: 'WH-A/PF/P01/S1/B1', capacity: 300 },
      { id: 'LOC-WH01-PF-P02', warehouseId: 'WH01', zone: 'Production Floor', rack: 'Rack P02', shelf: 'S1', bin: 'B1', code: 'WH-A/PF/P02/S1/B1', capacity: 300 },
      { id: 'LOC-WH01-RD-R01', warehouseId: 'WH01', zone: 'Receiving Dock', rack: 'Dock R01', shelf: 'S1', bin: 'B1', code: 'WH-A/RD/R01/S1/B1', capacity: 200 },
      { id: 'LOC-WH02-MF-M01', warehouseId: 'WH02', zone: 'Main Floor', rack: 'Rack M01', shelf: 'S1', bin: 'B1', code: 'WH-B/MF/M01/S1/B1', capacity: 600 },
      { id: 'LOC-WH02-MF-M02', warehouseId: 'WH02', zone: 'Main Floor', rack: 'Rack M02', shelf: 'S1', bin: 'B1', code: 'WH-B/MF/M02/S1/B1', capacity: 600 },
    ];
    for (const loc of locations) {
      await prisma.location.upsert({
        where: { id: loc.id },
        update: { code: loc.code, capacity: loc.capacity },
        create: loc,
      });
    }

    // 7. Base Products
    const products = [
      { id: 'PRD01', name: 'Steel Rod (12mm)', sku: 'STR-001', barcode: '8901234567890', categoryId: 'CAT01', unit: 'kg', cost: 58.00, sellingPrice: 72.00, minStock: 30, maxStock: 500, reorderPoint: 50, supplierId: 'SUP01', defaultWarehouseId: 'WH01', defaultLocationId: 'LOC-WH01-SZA-R01' },
      { id: 'PRD02', name: 'Copper Wire (2.5mm)', sku: 'CPW-002', barcode: '8901234567891', categoryId: 'CAT04', unit: 'meter', cost: 32.00, sellingPrice: 45.00, minStock: 100, maxStock: 2000, reorderPoint: 200, supplierId: 'SUP05', defaultWarehouseId: 'WH01', defaultLocationId: 'LOC-WH01-SZB-R01' },
      { id: 'PRD03', name: 'Office Chair (Ergonomic)', sku: 'OCH-003', barcode: '8901234567892', categoryId: 'CAT06', unit: 'unit', cost: 8500.00, sellingPrice: 12000.00, minStock: 10, maxStock: 100, reorderPoint: 20, supplierId: 'SUP04', defaultWarehouseId: 'WH02', defaultLocationId: 'LOC-WH02-MF-M01' },
      { id: 'PRD04', name: 'LED Panel Light (18W)', sku: 'LED-004', barcode: '8901234567893', categoryId: 'CAT04', unit: 'unit', cost: 280.00, sellingPrice: 420.00, minStock: 50, maxStock: 500, reorderPoint: 80, supplierId: 'SUP02', defaultWarehouseId: 'WH01', defaultLocationId: 'LOC-WH01-SZA-R02' },
      { id: 'PRD05', name: 'Paint (Royal Shyne, 20L)', sku: 'PNT-005', barcode: '8901234567894', categoryId: 'CAT01', unit: 'bucket', cost: 4200.00, sellingPrice: 5800.00, minStock: 15, maxStock: 150, reorderPoint: 30, supplierId: 'SUP03', defaultWarehouseId: 'WH01', defaultLocationId: 'LOC-WH01-SZB-R02' },
      { id: 'PRD06', name: 'MCB Switch (32A)', sku: 'MCB-006', barcode: '8901234567895', categoryId: 'CAT04', unit: 'unit', cost: 145.00, sellingPrice: 210.00, minStock: 50, maxStock: 400, reorderPoint: 80, supplierId: 'SUP02', defaultWarehouseId: 'WH01', defaultLocationId: 'LOC-WH01-SZA-R02' },
      { id: 'PRD07', name: 'Cement (OPC 53 Grade)', sku: 'CMT-007', barcode: '8901234567896', categoryId: 'CAT01', unit: 'bag', cost: 380.00, sellingPrice: 450.00, minStock: 100, maxStock: 800, reorderPoint: 200, supplierId: 'SUP01', defaultWarehouseId: 'WH01', defaultLocationId: 'LOC-WH01-PF-P01' },
      { id: 'PRD08', name: 'Desk (Executive Oak)', sku: 'DSK-008', barcode: '8901234567897', categoryId: 'CAT06', unit: 'unit', cost: 12000.00, sellingPrice: 18500.00, minStock: 5, maxStock: 40, reorderPoint: 10, supplierId: 'SUP04', defaultWarehouseId: 'WH02', defaultLocationId: 'LOC-WH02-MF-M01' },
      { id: 'PRD09', name: 'Packaging Box (Large)', sku: 'PKG-009', barcode: '8901234567898', categoryId: 'CAT03', unit: 'unit', cost: 25.00, sellingPrice: 40.00, minStock: 200, maxStock: 2000, reorderPoint: 400, supplierId: 'SUP01', defaultWarehouseId: 'WH01', defaultLocationId: 'LOC-WH01-RD-R01' },
      { id: 'PRD10', name: 'PVC Pipe (4 inch)', sku: 'PVC-010', barcode: '8901234567899', categoryId: 'CAT01', unit: 'piece', cost: 180.00, sellingPrice: 260.00, minStock: 30, maxStock: 300, reorderPoint: 60, supplierId: 'SUP03', defaultWarehouseId: 'WH01', defaultLocationId: 'LOC-WH01-SZA-R03' },
      { id: 'PRD11', name: 'Safety Helmet', sku: 'SFH-011', barcode: '8901234567900', categoryId: 'CAT05', unit: 'unit', cost: 350.00, sellingPrice: 550.00, minStock: 20, maxStock: 200, reorderPoint: 40, supplierId: 'SUP01', defaultWarehouseId: 'WH01', defaultLocationId: 'LOC-WH01-SZB-R01' },
      { id: 'PRD12', name: 'Ceiling Fan (Decorative)', sku: 'CFN-012', barcode: '8901234567901', categoryId: 'CAT04', unit: 'unit', cost: 2200.00, sellingPrice: 3400.00, minStock: 10, maxStock: 100, reorderPoint: 20, supplierId: 'SUP02', defaultWarehouseId: 'WH02', defaultLocationId: 'LOC-WH02-MF-M02' },
    ];
    for (const prd of products) {
      await prisma.product.upsert({
        where: { id: prd.id },
        update: { name: prd.name, cost: prd.cost, sellingPrice: prd.sellingPrice },
        create: prd,
      });
    }

    // 8. Initial Stocks
    const initialStocks = [
      { productId: 'PRD01', locationId: 'LOC-WH01-SZA-R01', onHand: 48, reserved: 12, damaged: 3, available: 33 },
      { productId: 'PRD02', locationId: 'LOC-WH01-SZB-R01', onHand: 1450, reserved: 200, damaged: 0, available: 1250 },
      { productId: 'PRD03', locationId: 'LOC-WH02-MF-M01', onHand: 18, reserved: 6, damaged: 1, available: 11 },
      { productId: 'PRD04', locationId: 'LOC-WH01-SZA-R02', onHand: 234, reserved: 30, damaged: 0, available: 204 },
      { productId: 'PRD05', locationId: 'LOC-WH01-SZB-R02', onHand: 67, reserved: 10, damaged: 2, available: 55 },
      { productId: 'PRD06', locationId: 'LOC-WH01-SZA-R02', onHand: 62, reserved: 15, damaged: 0, available: 47 },
      { productId: 'PRD07', locationId: 'LOC-WH01-PF-P01', onHand: 540, reserved: 50, damaged: 0, available: 490 },
      { productId: 'PRD08', locationId: 'LOC-WH02-MF-M01', onHand: 7, reserved: 3, damaged: 0, available: 4 },
      { productId: 'PRD09', locationId: 'LOC-WH01-RD-R01', onHand: 1850, reserved: 100, damaged: 0, available: 1750 },
      { productId: 'PRD10', locationId: 'LOC-WH01-SZA-R03', onHand: 0, reserved: 0, damaged: 0, available: 0 },
      { productId: 'PRD11', locationId: 'LOC-WH01-SZB-R01', onHand: 85, reserved: 0, damaged: 5, available: 80 },
      { productId: 'PRD12', locationId: 'LOC-WH02-MF-M02', onHand: 45, reserved: 8, damaged: 0, available: 37 },
    ];
    for (const stk of initialStocks) {
      await prisma.stock.upsert({
        where: {
          productId_locationId: {
            productId: stk.productId,
            locationId: stk.locationId,
          }
        },
        update: { onHand: stk.onHand, reserved: stk.reserved, damaged: stk.damaged, available: stk.available },
        create: stk,
      });
    }

    console.log('✅ Base seed data ensured in MySQL via Prisma.');
  } catch (err) {
    console.error('Seed error:', err.message);
  }
}
