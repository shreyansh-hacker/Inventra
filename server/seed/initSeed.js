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

    // 2. Users
    const users = [
      { id: 'USR-001', name: 'Yash Rathore', email: 'yash@inventra.internal', passwordHash: '$2b$10$e8w.demo.password.hash.inventra2026', roleId: 'ADMIN', avatar: 'YR', phone: '+91 98765 00001', status: 'active' },
      { id: 'USR-002', name: 'Priya Sharma', email: 'priya.sharma@inventra.internal', passwordHash: '$2b$10$e8w.demo.password.hash.inventra2026', roleId: 'INVENTORY_MANAGER', avatar: 'PS', phone: '+91 98765 00002', status: 'active' },
      { id: 'USR-003', name: 'Yash Audichya', email: 'yash.audichya@inventra.internal', passwordHash: '$2b$10$e8w.demo.password.hash.inventra2026', roleId: 'ADMIN', avatar: 'YA', phone: '+91 98765 00003', status: 'active' },
    ];
    for (const usr of users) {
      await prisma.user.upsert({
        where: { id: usr.id },
        update: { name: usr.name, email: usr.email, roleId: usr.roleId, avatar: usr.avatar },
        create: usr,
      });
    }

    // 3. Categories
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

    // 4. Suppliers
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

    // 5. Customers
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

    // 6. Warehouses
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

    // 7. Locations
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

    // 8. Base Products
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

    // 9. Initial Stocks
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

    // 10. Receipts (Inbound Orders - 5 receipts, 2 pending: WAITING & DRAFT)
    const receipts = [
      {
        id: 'REC01',
        reference: 'WH/IN/0001',
        supplierId: 'SUP01',
        warehouseId: 'WH01',
        destinationLocationId: 'LOC-WH01-SZA-R01',
        scheduleDate: new Date('2026-09-26'),
        responsibleUserId: 'USR-001',
        status: 'DONE',
        notes: 'Regular monthly steel shipment received and inspected.',
        items: [
          { productId: 'PRD01', expectedQty: 100, receivedQty: 100, difference: 0, unit: 'kg' },
          { productId: 'PRD07', expectedQty: 200, receivedQty: 200, difference: 0, unit: 'bag' }
        ]
      },
      {
        id: 'REC02',
        reference: 'WH/IN/0002',
        supplierId: 'SUP02',
        warehouseId: 'WH01',
        destinationLocationId: 'LOC-WH01-SZA-R02',
        scheduleDate: new Date('2026-09-27'),
        responsibleUserId: 'USR-002',
        status: 'WAITING',
        notes: 'Waiting for supplier dispatch confirmation.',
        items: [
          { productId: 'PRD04', expectedQty: 100, receivedQty: 0, difference: -100, unit: 'unit' },
          { productId: 'PRD06', expectedQty: 200, receivedQty: 0, difference: -200, unit: 'unit' }
        ]
      },
      {
        id: 'REC03',
        reference: 'WH/IN/0003',
        supplierId: 'SUP05',
        warehouseId: 'WH01',
        destinationLocationId: 'LOC-WH01-SZB-R01',
        scheduleDate: new Date('2026-09-25'),
        responsibleUserId: 'USR-001',
        status: 'DONE',
        notes: 'Short receipt — 20m missing from shipment. Raised dispute.',
        items: [
          { productId: 'PRD02', expectedQty: 500, receivedQty: 480, difference: -20, unit: 'meter' }
        ]
      },
      {
        id: 'REC04',
        reference: 'WH/IN/0004',
        supplierId: 'SUP04',
        warehouseId: 'WH02',
        destinationLocationId: 'LOC-WH02-MF-M01',
        scheduleDate: new Date('2026-09-28'),
        responsibleUserId: 'USR-002',
        status: 'DRAFT',
        notes: 'Scheduled furniture replenishment order.',
        items: [
          { productId: 'PRD03', expectedQty: 25, receivedQty: 0, difference: -25, unit: 'unit' },
          { productId: 'PRD08', expectedQty: 10, receivedQty: 0, difference: -10, unit: 'unit' }
        ]
      },
      {
        id: 'REC05',
        reference: 'WH/IN/0005',
        supplierId: 'SUP03',
        warehouseId: 'WH01',
        destinationLocationId: 'LOC-WH01-SZB-R02',
        scheduleDate: new Date('2026-09-24'),
        responsibleUserId: 'USR-001',
        status: 'DONE',
        notes: 'Quality inspection passed.',
        items: [
          { productId: 'PRD05', expectedQty: 40, receivedQty: 40, difference: 0, unit: 'bucket' }
        ]
      }
    ];

    for (const rec of receipts) {
      const { items, ...recData } = rec;
      await prisma.receipt.upsert({
        where: { id: rec.id },
        update: { ...recData },
        create: { ...recData }
      });
      await prisma.receiptItem.deleteMany({ where: { receiptId: rec.id } });
      await prisma.receiptItem.createMany({
        data: items.map(it => ({ ...it, receiptId: rec.id }))
      });
    }

    // 11. Deliveries (Outbound Shipments - 4 deliveries, 3 pending: PICKING, READY, DRAFT)
    const deliveries = [
      {
        id: 'DEL01',
        reference: 'WH/OUT/0001',
        customerId: 'CUS01',
        deliveryAddress: 'Plot 23, Andheri East, Mumbai',
        warehouseId: 'WH01',
        scheduleDate: new Date('2026-09-26'),
        responsibleUserId: 'USR-001',
        status: 'DELIVERED',
        notes: 'Dispatched with Express Fleet Truck #4',
        items: [
          { productId: 'PRD01', requestedQty: 50, reservedQty: 50, pickedQty: 50, packedQty: 50, deliveredQty: 50, unit: 'kg' },
          { productId: 'PRD07', requestedQty: 100, reservedQty: 100, pickedQty: 100, packedQty: 100, deliveredQty: 100, unit: 'bag' }
        ]
      },
      {
        id: 'DEL02',
        reference: 'WH/OUT/0002',
        customerId: 'CUS03',
        deliveryAddress: 'MG Road, Bangalore',
        warehouseId: 'WH02',
        scheduleDate: new Date('2026-09-27'),
        responsibleUserId: 'USR-002',
        status: 'PICKING',
        notes: 'Priority commercial fitout order',
        items: [
          { productId: 'PRD03', requestedQty: 10, reservedQty: 6, pickedQty: 4, packedQty: 0, deliveredQty: 0, unit: 'unit' },
          { productId: 'PRD12', requestedQty: 8, reservedQty: 8, pickedQty: 0, packedQty: 0, deliveredQty: 0, unit: 'unit' }
        ]
      },
      {
        id: 'DEL03',
        reference: 'WH/OUT/0003',
        customerId: 'CUS04',
        deliveryAddress: 'Karol Bagh, New Delhi',
        warehouseId: 'WH01',
        scheduleDate: new Date('2026-09-28'),
        responsibleUserId: 'USR-001',
        status: 'READY',
        notes: 'Awaiting customer pickup van',
        items: [
          { productId: 'PRD04', requestedQty: 50, reservedQty: 50, pickedQty: 0, packedQty: 0, deliveredQty: 0, unit: 'unit' },
          { productId: 'PRD06', requestedQty: 30, reservedQty: 15, pickedQty: 0, packedQty: 0, deliveredQty: 0, unit: 'unit' }
        ]
      },
      {
        id: 'DEL04',
        reference: 'WH/OUT/0004',
        customerId: 'CUS02',
        deliveryAddress: 'MG Road, Bangalore',
        warehouseId: 'WH01',
        scheduleDate: new Date('2026-09-29'),
        responsibleUserId: 'USR-001',
        status: 'DRAFT',
        notes: 'Consignment scheduled for weekend delivery',
        items: [
          { productId: 'PRD05', requestedQty: 20, reservedQty: 0, pickedQty: 0, packedQty: 0, deliveredQty: 0, unit: 'bucket' },
          { productId: 'PRD10', requestedQty: 40, reservedQty: 0, pickedQty: 0, packedQty: 0, deliveredQty: 0, unit: 'piece' }
        ]
      }
    ];

    for (const del of deliveries) {
      const { items, ...delData } = del;
      await prisma.delivery.upsert({
        where: { id: del.id },
        update: { ...delData },
        create: { ...delData }
      });
      await prisma.deliveryItem.deleteMany({ where: { deliveryId: del.id } });
      await prisma.deliveryItem.createMany({
        data: items.map(it => ({ ...it, deliveryId: del.id }))
      });
    }

    // 12. Transfers (Internal Movements - 4 transfers, 1 in-transit: IN_TRANSIT)
    const transfers = [
      {
        id: 'TRF01',
        reference: 'WH/INT/0001',
        sourceLocationId: 'LOC-WH01-SZA-R01',
        destinationLocationId: 'LOC-WH01-PF-P01',
        responsibleUserId: 'USR-001',
        status: 'DONE',
        notes: 'Material shift to manufacturing floor',
        items: [{ productId: 'PRD01', quantity: 20, unit: 'kg' }]
      },
      {
        id: 'TRF02',
        reference: 'WH/INT/0002',
        sourceLocationId: 'LOC-WH01-SZB-R01',
        destinationLocationId: 'LOC-WH02-MF-M01',
        responsibleUserId: 'USR-002',
        status: 'IN_TRANSIT',
        notes: 'Inter-warehouse transit from WH01 to WH02',
        items: [{ productId: 'PRD02', quantity: 300, unit: 'meter' }]
      },
      {
        id: 'TRF03',
        reference: 'WH/INT/0003',
        sourceLocationId: 'LOC-WH01-SZA-R02',
        destinationLocationId: 'LOC-WH01-PF-P02',
        responsibleUserId: 'USR-001',
        status: 'DONE',
        notes: 'Lighting batch replenishment',
        items: [{ productId: 'PRD04', quantity: 40, unit: 'unit' }]
      },
      {
        id: 'TRF04',
        reference: 'WH/INT/0004',
        sourceLocationId: 'LOC-WH01-RD-R01',
        destinationLocationId: 'LOC-WH01-SZA-R01',
        responsibleUserId: 'USR-001',
        status: 'DONE',
        notes: 'Dock intake transfer to permanent storage',
        items: [{ productId: 'PRD01', quantity: 50, unit: 'kg' }]
      }
    ];

    for (const trf of transfers) {
      const { items, ...trfData } = trf;
      await prisma.transfer.upsert({
        where: { id: trf.id },
        update: { ...trfData },
        create: { ...trfData }
      });
      await prisma.transferItem.deleteMany({ where: { transferId: trf.id } });
      await prisma.transferItem.createMany({
        data: items.map(it => ({ ...it, transferId: trf.id }))
      });
    }

    // 13. Adjustments (Cycle counts & Physical corrections - 3 adjustments)
    const adjustments = [
      {
        id: 'ADJ01',
        reference: 'WH/ADJ/0001',
        locationId: 'LOC-WH01-SZA-R01',
        responsibleUserId: 'USR-001',
        reason: 'Damage',
        status: 'APPLIED',
        notes: '3 kg found damaged due to moisture exposure.',
        items: [{ productId: 'PRD01', systemQty: 51, countedQty: 48, difference: -3, unit: 'kg' }]
      },
      {
        id: 'ADJ02',
        reference: 'WH/ADJ/0002',
        locationId: 'LOC-WH01-SZB-R01',
        responsibleUserId: 'USR-002',
        reason: 'Counting Error',
        status: 'APPLIED',
        notes: 'Physical count mismatch found during weekly audit.',
        items: [{ productId: 'PRD11', systemQty: 90, countedQty: 85, difference: -5, unit: 'unit' }]
      },
      {
        id: 'ADJ03',
        reference: 'WH/ADJ/0003',
        locationId: 'LOC-WH01-SZB-R02',
        responsibleUserId: 'USR-001',
        reason: 'Found Stock',
        status: 'DRAFT',
        notes: '2 buckets found behind secondary shelf during cleanup.',
        items: [{ productId: 'PRD05', systemQty: 65, countedQty: 67, difference: 2, unit: 'bucket' }]
      }
    ];

    for (const adj of adjustments) {
      const { items, ...adjData } = adj;
      await prisma.adjustment.upsert({
        where: { id: adj.id },
        update: { ...adjData },
        create: { ...adjData }
      });
      await prisma.adjustmentItem.deleteMany({ where: { adjustmentId: adj.id } });
      await prisma.adjustmentItem.createMany({
        data: items.map(it => ({ ...it, adjustmentId: adj.id }))
      });
    }

    // 14. System Alerts (9 live operational notifications)
    const alerts = [
      { id: 'ALR01', type: 'STOCK_OUT', severity: 'CRITICAL', message: 'PVC Pipe (4 inch) — Out of Stock', reason: 'Available: 0 pieces. Reorder point: 60 pieces. No pending receipts.', recommendedAction: 'Create replenishment purchase order', productId: 'PRD10', locationId: 'LOC-WH01-SZA-R03', status: 'ACTIVE', isResolved: false },
      { id: 'ALR02', type: 'CRITICAL_STOCK', severity: 'CRITICAL', message: 'Steel Rod (12mm) — Below Reorder Level', reason: 'Available: 33 kg. Reorder point: 50 kg. Average weekly usage: 24 kg.', recommendedAction: 'Create purchase order with Tata Steel', productId: 'PRD01', locationId: 'LOC-WH01-SZA-R01', status: 'ACTIVE', isResolved: false },
      { id: 'ALR03', type: 'LOW_STOCK', severity: 'WARNING', message: 'Office Chair (Ergonomic) — Low Stock', reason: 'Available: 11 units. Reorder point: 20 units. Pending delivery for 10 units.', recommendedAction: 'Review outbound delivery WH/OUT/0002', productId: 'PRD03', locationId: 'LOC-WH02-MF-M01', status: 'ACTIVE', isResolved: false },
      { id: 'ALR04', type: 'WATCH_STOCK', severity: 'WARNING', message: 'MCB Switch (32A) — Watch Level', reason: 'Available: 47 units. Reorder point: 80 units. Receipt WH/IN/0002 pending (200 units).', recommendedAction: 'Follow up on receipt WH/IN/0002 with Havells', productId: 'PRD06', locationId: 'LOC-WH01-SZA-R02', status: 'ACTIVE', isResolved: false },
      { id: 'ALR05', type: 'LOW_STOCK', severity: 'WARNING', message: 'Desk (Executive Oak) — Low Stock', reason: 'Available: 4 units. Reorder point: 10 units.', recommendedAction: 'Place restock order with Godrej Interio', productId: 'PRD08', locationId: 'LOC-WH02-MF-M01', status: 'ACTIVE', isResolved: false },
      { id: 'ALR06', type: 'OVERSTOCK', severity: 'INFO', message: 'Packaging Box (Large) — Overstocked', reason: 'On hand: 1,850 units. Max stock: 2,000 units. Slow movement — 6 days since last dispatch.', recommendedAction: 'Review minimum and maximum reorder parameters', productId: 'PRD09', locationId: 'LOC-WH01-RD-R01', status: 'ACTIVE', isResolved: false },
      { id: 'ALR07', type: 'DISCREPANCY', severity: 'WARNING', message: 'Short Receipt — Copper Wire 2.5mm', reason: 'Receipt WH/IN/0003 short by 20 meters. Discrepancy logged.', recommendedAction: 'Raise supplier credit note with Polycab Wires', productId: 'PRD02', locationId: 'LOC-WH01-SZB-R01', status: 'ACTIVE', isResolved: false },
      { id: 'ALR08', type: 'CAPACITY', severity: 'INFO', message: 'Main Warehouse Zone A at 82% Capacity', reason: 'Storage utilization approaching upper threshold across Rack A01-A03.', recommendedAction: 'Initiate smart rebalancing to Storage Zone B', productId: null, locationId: 'LOC-WH01-SZA-R01', status: 'ACTIVE', isResolved: false },
      { id: 'ALR09', type: 'AUDIT', severity: 'INFO', message: 'Quarterly Physical Count Scheduled', reason: 'Zone B periodic cycle count due for completion this week.', recommendedAction: 'Initiate blind count in Stock Count tool', productId: null, locationId: 'LOC-WH01-SZB-R01', status: 'ACTIVE', isResolved: false }
    ];

    for (const alr of alerts) {
      await prisma.alert.upsert({
        where: { id: alr.id },
        update: { message: alr.message, isResolved: alr.isResolved, severity: alr.severity },
        create: alr
      });
    }

    // 15. Stock Movements (Historical & Live Feed)
    const movements = [
      { id: 'MV01', productId: 'PRD01', movementType: 'Receipt', quantity: 100, unit: 'kg', fromLocationId: null, toLocationId: 'LOC-WH01-SZA-R01', referenceId: 'WH/IN/0001', notes: 'Supplier intake from Tata Steel', createdBy: 'Yash Rathore' },
      { id: 'MV02', productId: 'PRD07', movementType: 'Receipt', quantity: 200, unit: 'bag', fromLocationId: null, toLocationId: 'LOC-WH01-PF-P01', referenceId: 'WH/IN/0001', notes: 'Supplier intake from Tata Steel', createdBy: 'Yash Rathore' },
      { id: 'MV03', productId: 'PRD01', movementType: 'Adjustment', quantity: -3, unit: 'kg', fromLocationId: 'LOC-WH01-SZA-R01', toLocationId: null, referenceId: 'WH/ADJ/0001', notes: 'Damaged stock deduction', createdBy: 'Yash Rathore' },
      { id: 'MV04', productId: 'PRD02', movementType: 'Transfer', quantity: 300, unit: 'meter', fromLocationId: 'LOC-WH01-SZB-R01', toLocationId: 'LOC-WH02-MF-M01', referenceId: 'WH/INT/0002', notes: 'Transit to Distribution Center', createdBy: 'Priya Sharma' },
      { id: 'MV05', productId: 'PRD01', movementType: 'Delivery', quantity: -50, unit: 'kg', fromLocationId: 'LOC-WH01-SZA-R01', toLocationId: null, referenceId: 'WH/OUT/0001', notes: 'Dispatched to Metro Constructions', createdBy: 'Yash Rathore' },
      { id: 'MV06', productId: 'PRD04', movementType: 'Transfer', quantity: 40, unit: 'unit', fromLocationId: 'LOC-WH01-SZA-R02', toLocationId: 'LOC-WH01-PF-P02', referenceId: 'WH/INT/0003', notes: 'Production floor restock', createdBy: 'Yash Rathore' },
      { id: 'MV07', productId: 'PRD05', movementType: 'Receipt', quantity: 40, unit: 'bucket', fromLocationId: null, toLocationId: 'LOC-WH01-SZB-R02', referenceId: 'WH/IN/0005', notes: 'Supplier intake from Asian Paints', createdBy: 'Yash Rathore' },
    ];

    for (const mv of movements) {
      await prisma.stockMovement.upsert({
        where: { id: mv.id },
        update: { quantity: mv.quantity },
        create: mv
      });
    }

    console.log('✅ Base seed data ensured in MySQL via Prisma.');
  } catch (err) {
    console.error('Seed error:', err.message);
  }
}
