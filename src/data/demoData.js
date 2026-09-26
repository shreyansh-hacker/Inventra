// INVENTRA — Realistic Demo Data
// All data is structured to later connect to a real backend API

export const currentUser = {
  id: 'USR-001',
  name: 'Yash Rathore',
  email: 'yash@inventra.io',
  role: 'Admin',
  avatar: 'YR',
  joinedAt: '2025-06-15',
};

export const warehouses = [
  { id: 'WH01', name: 'Main Warehouse', shortCode: 'WH-A', address: '12 Industrial Area, Bhopal', manager: 'Yash Rathore', capacity: 5000, used: 3420 },
  { id: 'WH02', name: 'Distribution Center', shortCode: 'WH-B', address: '45 Logistics Park, Indore', manager: 'Amit Sharma', capacity: 3000, used: 1890 },
];

export const zones = [
  { id: 'Z01', warehouseId: 'WH01', name: 'Storage Zone A', code: 'SZ-A' },
  { id: 'Z02', warehouseId: 'WH01', name: 'Storage Zone B', code: 'SZ-B' },
  { id: 'Z03', warehouseId: 'WH01', name: 'Production Floor', code: 'PF' },
  { id: 'Z04', warehouseId: 'WH01', name: 'Receiving Dock', code: 'RD' },
  { id: 'Z05', warehouseId: 'WH02', name: 'Main Floor', code: 'MF' },
  { id: 'Z06', warehouseId: 'WH02', name: 'Cold Storage', code: 'CS' },
];

export const racks = [
  { id: 'R01', zoneId: 'Z01', name: 'Rack A01', capacity: 500, used: 320 },
  { id: 'R02', zoneId: 'Z01', name: 'Rack A02', capacity: 500, used: 410 },
  { id: 'R03', zoneId: 'Z01', name: 'Rack A03', capacity: 500, used: 180 },
  { id: 'R04', zoneId: 'Z02', name: 'Rack B01', capacity: 400, used: 350 },
  { id: 'R05', zoneId: 'Z02', name: 'Rack B02', capacity: 400, used: 260 },
  { id: 'R06', zoneId: 'Z03', name: 'Rack P01', capacity: 300, used: 120 },
  { id: 'R07', zoneId: 'Z03', name: 'Rack P02', capacity: 300, used: 280 },
  { id: 'R08', zoneId: 'Z04', name: 'Dock R01', capacity: 200, used: 90 },
  { id: 'R09', zoneId: 'Z05', name: 'Rack M01', capacity: 600, used: 540 },
  { id: 'R10', zoneId: 'Z05', name: 'Rack M02', capacity: 600, used: 310 },
  { id: 'R11', zoneId: 'Z06', name: 'Cold R01', capacity: 200, used: 180 },
  { id: 'R12', zoneId: 'Z06', name: 'Cold R02', capacity: 200, used: 50 },
];

export const categories = [
  { id: 'CAT01', name: 'Raw Materials' },
  { id: 'CAT02', name: 'Finished Goods' },
  { id: 'CAT03', name: 'Office Supplies' },
  { id: 'CAT04', name: 'Packaging' },
  { id: 'CAT05', name: 'Electrical Components' },
  { id: 'CAT06', name: 'Hardware' },
  { id: 'CAT07', name: 'Furniture' },
];

export const suppliers = [
  { id: 'SUP01', name: 'Tata Steel Ltd', contact: 'Rajesh Kumar', phone: '+91 98765 43210', email: 'supply@tatasteel.com' },
  { id: 'SUP02', name: 'Havells India', contact: 'Priya Sharma', phone: '+91 87654 32109', email: 'orders@havells.com' },
  { id: 'SUP03', name: 'Asian Paints', contact: 'Vikram Singh', phone: '+91 76543 21098', email: 'b2b@asianpaints.com' },
  { id: 'SUP04', name: 'Godrej Interio', contact: 'Neha Patel', phone: '+91 65432 10987', email: 'supply@godrej.com' },
  { id: 'SUP05', name: 'Polycab Wires', contact: 'Suresh Iyer', phone: '+91 54321 09876', email: 'orders@polycab.com' },
];

export const customers = [
  { id: 'CUS01', name: 'Metro Constructions', address: 'Plot 23, Andheri East, Mumbai' },
  { id: 'CUS02', name: 'Prestige Builders', address: 'Sector 18, Noida, UP' },
  { id: 'CUS03', name: 'NexGen Interiors', address: 'MG Road, Bangalore' },
  { id: 'CUS04', name: 'Prime Electricals', address: 'Karol Bagh, New Delhi' },
  { id: 'CUS05', name: 'SkyHigh Developers', address: 'Hinjewadi, Pune' },
];

export const products = [
  {
    id: 'PRD01', name: 'Steel Rod (12mm)', sku: 'STR-001', barcode: '8901234567890',
    category: 'Raw Materials', unit: 'kg', cost: 58, sellingPrice: 72,
    minStock: 30, maxStock: 500, reorderPoint: 50,
    supplier: 'Tata Steel Ltd', supplierId: 'SUP01',
    onHand: 48, reserved: 12, available: 36, damaged: 3,
    location: 'WH-A / SZ-A / Rack A01', warehouseId: 'WH01',
    health: 'critical', status: 'active',
    lastMovement: '2026-09-26 09:15',
  },
  {
    id: 'PRD02', name: 'Copper Wire (2.5mm)', sku: 'CPW-002', barcode: '8901234567891',
    category: 'Electrical Components', unit: 'meter', cost: 32, sellingPrice: 45,
    minStock: 100, maxStock: 2000, reorderPoint: 200,
    supplier: 'Polycab Wires', supplierId: 'SUP05',
    onHand: 1450, reserved: 200, available: 1250, damaged: 0,
    location: 'WH-A / SZ-B / Rack B01', warehouseId: 'WH01',
    health: 'healthy', status: 'active',
    lastMovement: '2026-09-25 16:30',
  },
  {
    id: 'PRD03', name: 'Office Chair (Ergonomic)', sku: 'OCH-003', barcode: '8901234567892',
    category: 'Furniture', unit: 'unit', cost: 8500, sellingPrice: 12000,
    minStock: 10, maxStock: 100, reorderPoint: 20,
    supplier: 'Godrej Interio', supplierId: 'SUP04',
    onHand: 18, reserved: 6, available: 12, damaged: 1,
    location: 'WH-B / MF / Rack M01', warehouseId: 'WH02',
    health: 'low', status: 'active',
    lastMovement: '2026-09-26 08:45',
  },
  {
    id: 'PRD04', name: 'LED Panel Light (18W)', sku: 'LED-004', barcode: '8901234567893',
    category: 'Electrical Components', unit: 'unit', cost: 280, sellingPrice: 420,
    minStock: 50, maxStock: 500, reorderPoint: 80,
    supplier: 'Havells India', supplierId: 'SUP02',
    onHand: 234, reserved: 30, available: 204, damaged: 0,
    location: 'WH-A / SZ-A / Rack A02', warehouseId: 'WH01',
    health: 'healthy', status: 'active',
    lastMovement: '2026-09-25 14:20',
  },
  {
    id: 'PRD05', name: 'Paint (Royal Shyne, 20L)', sku: 'PNT-005', barcode: '8901234567894',
    category: 'Raw Materials', unit: 'bucket', cost: 4200, sellingPrice: 5800,
    minStock: 15, maxStock: 150, reorderPoint: 30,
    supplier: 'Asian Paints', supplierId: 'SUP03',
    onHand: 67, reserved: 10, available: 57, damaged: 2,
    location: 'WH-A / SZ-B / Rack B02', warehouseId: 'WH01',
    health: 'healthy', status: 'active',
    lastMovement: '2026-09-24 11:00',
  },
  {
    id: 'PRD06', name: 'MCB Switch (32A)', sku: 'MCB-006', barcode: '8901234567895',
    category: 'Electrical Components', unit: 'unit', cost: 145, sellingPrice: 210,
    minStock: 50, maxStock: 400, reorderPoint: 80,
    supplier: 'Havells India', supplierId: 'SUP02',
    onHand: 62, reserved: 15, available: 47, damaged: 0,
    location: 'WH-A / SZ-A / Rack A02', warehouseId: 'WH01',
    health: 'watch', status: 'active',
    lastMovement: '2026-09-26 07:30',
  },
  {
    id: 'PRD07', name: 'Cement (OPC 53 Grade)', sku: 'CMT-007', barcode: '8901234567896',
    category: 'Raw Materials', unit: 'bag', cost: 380, sellingPrice: 450,
    minStock: 100, maxStock: 800, reorderPoint: 200,
    supplier: 'Tata Steel Ltd', supplierId: 'SUP01',
    onHand: 540, reserved: 50, available: 490, damaged: 0,
    location: 'WH-A / PF / Rack P01', warehouseId: 'WH01',
    health: 'healthy', status: 'active',
    lastMovement: '2026-09-25 10:45',
  },
  {
    id: 'PRD08', name: 'Desk (Executive Oak)', sku: 'DSK-008', barcode: '8901234567897',
    category: 'Furniture', unit: 'unit', cost: 12000, sellingPrice: 18500,
    minStock: 5, maxStock: 40, reorderPoint: 10,
    supplier: 'Godrej Interio', supplierId: 'SUP04',
    onHand: 7, reserved: 3, available: 4, damaged: 0,
    location: 'WH-B / MF / Rack M01', warehouseId: 'WH02',
    health: 'low', status: 'active',
    lastMovement: '2026-09-25 09:20',
  },
  {
    id: 'PRD09', name: 'Packaging Box (Large)', sku: 'PKG-009', barcode: '8901234567898',
    category: 'Packaging', unit: 'unit', cost: 25, sellingPrice: 40,
    minStock: 200, maxStock: 2000, reorderPoint: 400,
    supplier: 'Tata Steel Ltd', supplierId: 'SUP01',
    onHand: 1850, reserved: 100, available: 1750, damaged: 0,
    location: 'WH-A / RD / Dock R01', warehouseId: 'WH01',
    health: 'overstock', status: 'active',
    lastMovement: '2026-09-23 15:00',
  },
  {
    id: 'PRD10', name: 'PVC Pipe (4 inch)', sku: 'PVC-010', barcode: '8901234567899',
    category: 'Raw Materials', unit: 'piece', cost: 180, sellingPrice: 260,
    minStock: 30, maxStock: 300, reorderPoint: 60,
    supplier: 'Asian Paints', supplierId: 'SUP03',
    onHand: 0, reserved: 0, available: 0, damaged: 0,
    location: 'WH-A / SZ-A / Rack A03', warehouseId: 'WH01',
    health: 'critical', status: 'active',
    lastMovement: '2026-09-22 12:00',
  },
  {
    id: 'PRD11', name: 'Safety Helmet', sku: 'SFH-011', barcode: '8901234567900',
    category: 'Hardware', unit: 'unit', cost: 350, sellingPrice: 550,
    minStock: 20, maxStock: 200, reorderPoint: 40,
    supplier: 'Tata Steel Ltd', supplierId: 'SUP01',
    onHand: 85, reserved: 0, available: 85, damaged: 5,
    location: 'WH-A / SZ-B / Rack B01', warehouseId: 'WH01',
    health: 'healthy', status: 'active',
    lastMovement: '2026-09-24 08:30',
  },
  {
    id: 'PRD12', name: 'Ceiling Fan (Decorative)', sku: 'CFN-012', barcode: '8901234567901',
    category: 'Electrical Components', unit: 'unit', cost: 2200, sellingPrice: 3400,
    minStock: 10, maxStock: 100, reorderPoint: 20,
    supplier: 'Havells India', supplierId: 'SUP02',
    onHand: 45, reserved: 8, available: 37, damaged: 0,
    location: 'WH-B / MF / Rack M02', warehouseId: 'WH02',
    health: 'healthy', status: 'active',
    lastMovement: '2026-09-25 13:15',
  },
];

export const receipts = [
  {
    id: 'REC01', reference: 'WH/IN/0001', supplier: 'Tata Steel Ltd', supplierId: 'SUP01',
    warehouseId: 'WH01', warehouse: 'Main Warehouse', destination: 'Rack A01',
    scheduleDate: '2026-09-26', responsible: 'Yash Rathore',
    status: 'done',
    items: [
      { productId: 'PRD01', product: 'Steel Rod (12mm)', expected: 100, received: 100, difference: 0, unit: 'kg' },
      { productId: 'PRD07', product: 'Cement (OPC 53 Grade)', expected: 200, received: 200, difference: 0, unit: 'bag' },
    ],
    notes: 'Regular monthly supply received.',
    createdAt: '2026-09-24 08:00',
    completedAt: '2026-09-26 09:15',
  },
  {
    id: 'REC02', reference: 'WH/IN/0002', supplier: 'Havells India', supplierId: 'SUP02',
    warehouseId: 'WH01', warehouse: 'Main Warehouse', destination: 'Rack A02',
    scheduleDate: '2026-09-27', responsible: 'Amit Sharma',
    status: 'waiting',
    items: [
      { productId: 'PRD04', product: 'LED Panel Light (18W)', expected: 100, received: 0, difference: -100, unit: 'unit' },
      { productId: 'PRD06', product: 'MCB Switch (32A)', expected: 200, received: 0, difference: -200, unit: 'unit' },
    ],
    notes: 'Waiting for supplier dispatch confirmation.',
    createdAt: '2026-09-25 10:30',
    completedAt: null,
  },
  {
    id: 'REC03', reference: 'WH/IN/0003', supplier: 'Polycab Wires', supplierId: 'SUP05',
    warehouseId: 'WH01', warehouse: 'Main Warehouse', destination: 'Rack B01',
    scheduleDate: '2026-09-25', responsible: 'Yash Rathore',
    status: 'received',
    items: [
      { productId: 'PRD02', product: 'Copper Wire (2.5mm)', expected: 500, received: 480, difference: -20, unit: 'meter' },
    ],
    notes: 'Short receipt — 20m missing from shipment. Raised dispute.',
    createdAt: '2026-09-23 14:00',
    completedAt: '2026-09-25 16:30',
  },
  {
    id: 'REC04', reference: 'WH/IN/0004', supplier: 'Godrej Interio', supplierId: 'SUP04',
    warehouseId: 'WH02', warehouse: 'Distribution Center', destination: 'Rack M01',
    scheduleDate: '2026-09-28', responsible: 'Amit Sharma',
    status: 'draft',
    items: [
      { productId: 'PRD03', product: 'Office Chair (Ergonomic)', expected: 25, received: 0, difference: -25, unit: 'unit' },
      { productId: 'PRD08', product: 'Desk (Executive Oak)', expected: 10, received: 0, difference: -10, unit: 'unit' },
    ],
    notes: '',
    createdAt: '2026-09-26 08:00',
    completedAt: null,
  },
  {
    id: 'REC05', reference: 'WH/IN/0005', supplier: 'Asian Paints', supplierId: 'SUP03',
    warehouseId: 'WH01', warehouse: 'Main Warehouse', destination: 'Rack B02',
    scheduleDate: '2026-09-24', responsible: 'Yash Rathore',
    status: 'done',
    items: [
      { productId: 'PRD05', product: 'Paint (Royal Shyne, 20L)', expected: 40, received: 40, difference: 0, unit: 'bucket' },
    ],
    notes: 'Quality inspection passed.',
    createdAt: '2026-09-22 09:00',
    completedAt: '2026-09-24 11:00',
  },
];

export const deliveries = [
  {
    id: 'DEL01', reference: 'WH/OUT/0001', customer: 'Metro Constructions', customerId: 'CUS01',
    address: 'Plot 23, Andheri East, Mumbai',
    warehouseId: 'WH01', warehouse: 'Main Warehouse',
    scheduleDate: '2026-09-26', responsible: 'Yash Rathore',
    status: 'delivered',
    items: [
      { productId: 'PRD01', product: 'Steel Rod (12mm)', requested: 50, reserved: 50, picked: 50, packed: 50, delivered: 50, unit: 'kg' },
      { productId: 'PRD07', product: 'Cement (OPC 53 Grade)', requested: 100, reserved: 100, picked: 100, packed: 100, delivered: 100, unit: 'bag' },
    ],
    createdAt: '2026-09-24 09:00',
    completedAt: '2026-09-26 14:30',
  },
  {
    id: 'DEL02', reference: 'WH/OUT/0002', customer: 'NexGen Interiors', customerId: 'CUS03',
    address: 'MG Road, Bangalore',
    warehouseId: 'WH02', warehouse: 'Distribution Center',
    scheduleDate: '2026-09-27', responsible: 'Amit Sharma',
    status: 'picking',
    items: [
      { productId: 'PRD03', product: 'Office Chair (Ergonomic)', requested: 10, reserved: 6, picked: 4, packed: 0, delivered: 0, unit: 'unit' },
      { productId: 'PRD12', product: 'Ceiling Fan (Decorative)', requested: 8, reserved: 8, picked: 0, packed: 0, delivered: 0, unit: 'unit' },
    ],
    createdAt: '2026-09-25 11:00',
    completedAt: null,
  },
  {
    id: 'DEL03', reference: 'WH/OUT/0003', customer: 'Prime Electricals', customerId: 'CUS04',
    address: 'Karol Bagh, New Delhi',
    warehouseId: 'WH01', warehouse: 'Main Warehouse',
    scheduleDate: '2026-09-28', responsible: 'Yash Rathore',
    status: 'ready',
    items: [
      { productId: 'PRD04', product: 'LED Panel Light (18W)', requested: 50, reserved: 50, picked: 0, packed: 0, delivered: 0, unit: 'unit' },
      { productId: 'PRD06', product: 'MCB Switch (32A)', requested: 30, reserved: 15, picked: 0, packed: 0, delivered: 0, unit: 'unit' },
    ],
    createdAt: '2026-09-26 07:30',
    completedAt: null,
  },
  {
    id: 'DEL04', reference: 'WH/OUT/0004', customer: 'SkyHigh Developers', customerId: 'CUS05',
    address: 'Hinjewadi, Pune',
    warehouseId: 'WH01', warehouse: 'Main Warehouse',
    scheduleDate: '2026-09-29', responsible: 'Yash Rathore',
    status: 'draft',
    items: [
      { productId: 'PRD05', product: 'Paint (Royal Shyne, 20L)', requested: 20, reserved: 0, picked: 0, packed: 0, delivered: 0, unit: 'bucket' },
      { productId: 'PRD10', product: 'PVC Pipe (4 inch)', requested: 40, reserved: 0, picked: 0, packed: 0, delivered: 0, unit: 'piece' },
    ],
    createdAt: '2026-09-26 10:00',
    completedAt: null,
  },
];

export const transfers = [
  {
    id: 'TRF01', reference: 'WH/INT/0001',
    from: 'Rack A01 (SZ-A)', fromFull: 'Main Warehouse → Storage Zone A → Rack A01',
    to: 'Rack P01 (PF)', toFull: 'Main Warehouse → Production Floor → Rack P01',
    product: 'Steel Rod (12mm)', productId: 'PRD01',
    quantity: 20, unit: 'kg',
    responsible: 'Yash Rathore', status: 'done',
    createdAt: '2026-09-25 09:00', completedAt: '2026-09-25 09:45',
  },
  {
    id: 'TRF02', reference: 'WH/INT/0002',
    from: 'Rack B01 (SZ-B)', fromFull: 'Main Warehouse → Storage Zone B → Rack B01',
    to: 'Rack M01 (MF)', toFull: 'Distribution Center → Main Floor → Rack M01',
    product: 'Copper Wire (2.5mm)', productId: 'PRD02',
    quantity: 300, unit: 'meter',
    responsible: 'Amit Sharma', status: 'moving',
    createdAt: '2026-09-26 08:30', completedAt: null,
  },
  {
    id: 'TRF03', reference: 'WH/INT/0003',
    from: 'Rack A02 (SZ-A)', fromFull: 'Main Warehouse → Storage Zone A → Rack A02',
    to: 'Rack P02 (PF)', toFull: 'Main Warehouse → Production Floor → Rack P02',
    product: 'LED Panel Light (18W)', productId: 'PRD04',
    quantity: 40, unit: 'unit',
    responsible: 'Yash Rathore', status: 'done',
    createdAt: '2026-09-24 14:00', completedAt: '2026-09-24 14:30',
  },
  {
    id: 'TRF04', reference: 'WH/INT/0004',
    from: 'Dock R01 (RD)', fromFull: 'Main Warehouse → Receiving Dock → Dock R01',
    to: 'Rack A01 (SZ-A)', toFull: 'Main Warehouse → Storage Zone A → Rack A01',
    product: 'Steel Rod (12mm)', productId: 'PRD01',
    quantity: 50, unit: 'kg',
    responsible: 'Yash Rathore', status: 'pending',
    createdAt: '2026-09-26 10:00', completedAt: null,
  },
];

export const adjustments = [
  {
    id: 'ADJ01', reference: 'WH/ADJ/0001',
    product: 'Steel Rod (12mm)', productId: 'PRD01', location: 'Rack A01',
    systemQty: 51, countedQty: 48, difference: -3,
    reason: 'Damage', unit: 'kg',
    responsible: 'Yash Rathore', status: 'applied',
    notes: '3 kg found damaged due to moisture exposure.',
    createdAt: '2026-09-26 09:30',
  },
  {
    id: 'ADJ02', reference: 'WH/ADJ/0002',
    product: 'Safety Helmet', productId: 'PRD11', location: 'Rack B01',
    systemQty: 90, countedQty: 85, difference: -5,
    reason: 'Counting Error', unit: 'unit',
    responsible: 'Amit Sharma', status: 'applied',
    notes: 'Physical count mismatch found during weekly audit.',
    createdAt: '2026-09-24 10:00',
  },
  {
    id: 'ADJ03', reference: 'WH/ADJ/0003',
    product: 'Paint (Royal Shyne, 20L)', productId: 'PRD05', location: 'Rack B02',
    systemQty: 65, countedQty: 67, difference: +2,
    reason: 'Found Stock', unit: 'bucket',
    responsible: 'Yash Rathore', status: 'pending',
    notes: '2 buckets found behind secondary shelf during cleanup.',
    createdAt: '2026-09-26 10:15',
  },
];

export const stockLedger = [
  { id: 'SL01', time: '2026-09-26 10:15', product: 'Paint (Royal Shyne, 20L)', productId: 'PRD05', location: 'Rack B02', movement: 'Adjustment', before: 65, change: +2, after: 67, reference: 'WH/ADJ/0003', user: 'Yash Rathore' },
  { id: 'SL02', time: '2026-09-26 09:30', product: 'Steel Rod (12mm)', productId: 'PRD01', location: 'Rack A01', movement: 'Adjustment', before: 51, change: -3, after: 48, reference: 'WH/ADJ/0001', user: 'Yash Rathore' },
  { id: 'SL03', time: '2026-09-26 09:15', product: 'Steel Rod (12mm)', productId: 'PRD01', location: 'Rack A01', movement: 'Receipt', before: 0, change: +100, after: 100, reference: 'WH/IN/0001', user: 'Yash Rathore' },
  { id: 'SL04', time: '2026-09-26 09:15', product: 'Cement (OPC 53 Grade)', productId: 'PRD07', location: 'Rack P01', movement: 'Receipt', before: 340, change: +200, after: 540, reference: 'WH/IN/0001', user: 'Yash Rathore' },
  { id: 'SL05', time: '2026-09-26 08:45', product: 'Office Chair (Ergonomic)', productId: 'PRD03', location: 'Rack M01', movement: 'Reservation', before: 18, change: -6, after: 12, reference: 'WH/OUT/0002', user: 'Amit Sharma' },
  { id: 'SL06', time: '2026-09-25 16:30', product: 'Copper Wire (2.5mm)', productId: 'PRD02', location: 'Rack B01', movement: 'Receipt', before: 970, change: +480, after: 1450, reference: 'WH/IN/0003', user: 'Yash Rathore' },
  { id: 'SL07', time: '2026-09-25 09:45', product: 'Steel Rod (12mm)', productId: 'PRD01', location: 'Rack A01', movement: 'Transfer Out', before: 70, change: -20, after: 50, reference: 'WH/INT/0001', user: 'Yash Rathore' },
  { id: 'SL08', time: '2026-09-25 09:45', product: 'Steel Rod (12mm)', productId: 'PRD01', location: 'Rack P01', movement: 'Transfer In', before: 0, change: +20, after: 20, reference: 'WH/INT/0001', user: 'Yash Rathore' },
  { id: 'SL09', time: '2026-09-24 14:30', product: 'LED Panel Light (18W)', productId: 'PRD04', location: 'Rack A02', movement: 'Transfer Out', before: 274, change: -40, after: 234, reference: 'WH/INT/0003', user: 'Yash Rathore' },
  { id: 'SL10', time: '2026-09-24 14:30', product: 'LED Panel Light (18W)', productId: 'PRD04', location: 'Rack P02', movement: 'Transfer In', before: 0, change: +40, after: 40, reference: 'WH/INT/0003', user: 'Yash Rathore' },
  { id: 'SL11', time: '2026-09-24 11:00', product: 'Paint (Royal Shyne, 20L)', productId: 'PRD05', location: 'Rack B02', movement: 'Receipt', before: 25, change: +40, after: 65, reference: 'WH/IN/0005', user: 'Yash Rathore' },
  { id: 'SL12', time: '2026-09-24 10:00', product: 'Safety Helmet', productId: 'PRD11', location: 'Rack B01', movement: 'Adjustment', before: 90, change: -5, after: 85, reference: 'WH/ADJ/0002', user: 'Amit Sharma' },
];

export const moveHistory = [
  { id: 'MV01', reference: 'WH/IN/0001', date: '2026-09-26 09:15', product: 'Steel Rod (12mm)', quantity: '100 kg', from: 'Tata Steel Ltd', to: 'Rack A01', operation: 'Receipt', user: 'Yash Rathore', status: 'done' },
  { id: 'MV02', reference: 'WH/IN/0001', date: '2026-09-26 09:15', product: 'Cement (OPC 53 Grade)', quantity: '200 bag', from: 'Tata Steel Ltd', to: 'Rack P01', operation: 'Receipt', user: 'Yash Rathore', status: 'done' },
  { id: 'MV03', reference: 'WH/ADJ/0001', date: '2026-09-26 09:30', product: 'Steel Rod (12mm)', quantity: '3 kg', from: 'Rack A01', to: 'Damaged', operation: 'Adjustment', user: 'Yash Rathore', status: 'applied' },
  { id: 'MV04', reference: 'WH/OUT/0002', date: '2026-09-26 08:45', product: 'Office Chair (Ergonomic)', quantity: '6 unit', from: 'Rack M01', to: 'Reserved', operation: 'Reservation', user: 'Amit Sharma', status: 'in-progress' },
  { id: 'MV05', reference: 'WH/INT/0002', date: '2026-09-26 08:30', product: 'Copper Wire (2.5mm)', quantity: '300 meter', from: 'Rack B01', to: 'Rack M01', operation: 'Transfer', user: 'Amit Sharma', status: 'moving' },
  { id: 'MV06', reference: 'WH/IN/0003', date: '2026-09-25 16:30', product: 'Copper Wire (2.5mm)', quantity: '480 meter', from: 'Polycab Wires', to: 'Rack B01', operation: 'Receipt', user: 'Yash Rathore', status: 'done' },
  { id: 'MV07', reference: 'WH/INT/0001', date: '2026-09-25 09:00', product: 'Steel Rod (12mm)', quantity: '20 kg', from: 'Rack A01', to: 'Rack P01', operation: 'Transfer', user: 'Yash Rathore', status: 'done' },
  { id: 'MV08', reference: 'WH/OUT/0001', date: '2026-09-26 14:30', product: 'Steel Rod (12mm)', quantity: '50 kg', from: 'Rack A01', to: 'Metro Constructions', operation: 'Delivery', user: 'Yash Rathore', status: 'delivered' },
  { id: 'MV09', reference: 'WH/INT/0003', date: '2026-09-24 14:00', product: 'LED Panel Light (18W)', quantity: '40 unit', from: 'Rack A02', to: 'Rack P02', operation: 'Transfer', user: 'Yash Rathore', status: 'done' },
  { id: 'MV10', reference: 'WH/IN/0005', date: '2026-09-24 11:00', product: 'Paint (Royal Shyne, 20L)', quantity: '40 bucket', from: 'Asian Paints', to: 'Rack B02', operation: 'Receipt', user: 'Yash Rathore', status: 'done' },
];

export const alerts = [
  { id: 'ALR01', type: 'critical', title: 'PVC Pipe (4 inch) — Out of Stock', desc: 'Available: 0 pieces. Reorder point: 60 pieces. No pending receipts.', product: 'PVC Pipe (4 inch)', productId: 'PRD10', location: 'Rack A03', time: '2026-09-26 10:00', action: 'Create replenishment order' },
  { id: 'ALR02', type: 'critical', title: 'Steel Rod (12mm) — Below Reorder Level', desc: 'Available: 36 kg. Reorder point: 50 kg. Average weekly usage: 24 kg.', product: 'Steel Rod (12mm)', productId: 'PRD01', location: 'Rack A01', time: '2026-09-26 09:30', action: 'Create purchase order' },
  { id: 'ALR03', type: 'warning', title: 'Office Chair — Low Stock', desc: 'Available: 12 units. Reorder point: 20 units. Pending delivery for 10 units.', product: 'Office Chair (Ergonomic)', productId: 'PRD03', location: 'Rack M01', time: '2026-09-26 08:45', action: 'Review delivery WH/OUT/0002' },
  { id: 'ALR04', type: 'warning', title: 'MCB Switch — Watch Level', desc: 'Available: 47 units. Reorder point: 80 units. Receipt WH/IN/0002 pending (200 units).', product: 'MCB Switch (32A)', productId: 'PRD06', location: 'Rack A02', time: '2026-09-26 07:30', action: 'Follow up on receipt WH/IN/0002' },
  { id: 'ALR05', type: 'warning', title: 'Desk (Executive Oak) — Low Stock', desc: 'Available: 4 units. Reorder point: 10 units.', product: 'Desk (Executive Oak)', productId: 'PRD08', location: 'Rack M01', time: '2026-09-25 09:20', action: 'Place order with Godrej Interio' },
  { id: 'ALR06', type: 'info', title: 'Packaging Box — Overstocked', desc: 'On hand: 1,850 units. Max stock: 2,000 units. Slow movement — 6 days since last use.', product: 'Packaging Box (Large)', productId: 'PRD09', location: 'Dock R01', time: '2026-09-26 06:00', action: 'Review reorder rules' },
  { id: 'ALR07', type: 'warning', title: 'Copper Wire Transfer In-Progress', desc: 'Transfer WH/INT/0002: 300m from WH-A to WH-B. Started 1.5 hours ago.', product: 'Copper Wire (2.5mm)', productId: 'PRD02', location: 'In Transit', time: '2026-09-26 08:30', action: 'Confirm transfer completion' },
  { id: 'ALR08', type: 'info', title: 'Short Receipt — Copper Wire', desc: 'WH/IN/0003: Expected 500m, received 480m. Difference: -20m.', product: 'Copper Wire (2.5mm)', productId: 'PRD02', location: 'Rack B01', time: '2026-09-25 16:30', action: 'Follow up with Polycab Wires' },
  { id: 'ALR09', type: 'warning', title: 'Pending Adjustment Approval', desc: 'WH/ADJ/0003: Found 2 buckets of Paint at Rack B02. Needs approval.', product: 'Paint (Royal Shyne, 20L)', productId: 'PRD05', location: 'Rack B02', time: '2026-09-26 10:15', action: 'Approve adjustment' },
];

// Dashboard computed metrics
export const dashboardMetrics = {
  totalStockValue: 2847650,
  totalUnits: 4356,
  totalProducts: 12,
  lowStock: 4,
  outOfStock: 1,
  pendingReceipts: 2,
  pendingDeliveries: 3,
  activeTransfers: 1,
  stockAdjustments: 3,
  todaysMovements: 8,
};

export const healthDistribution = {
  healthy: 6,
  watch: 1,
  low: 2,
  critical: 2,
  overstock: 1,
};

export const flowData = {
  received: 8,
  stored: 142,
  reserved: 26,
  moving: 11,
  delivered: 64,
};

// Stock Journey for Steel Rod (example product)
export const steelRodJourney = [
  { type: 'receipt', title: 'Received from Tata Steel Ltd', qty: '+100 kg', location: 'Receiving Dock → Rack A01', time: '2026-09-26 09:15', ref: 'WH/IN/0001', user: 'Yash Rathore' },
  { type: 'stored', title: 'Stored at Rack A01', qty: '100 kg', location: 'WH-A / SZ-A / Rack A01', time: '2026-09-26 09:20', ref: 'WH/IN/0001', user: 'System' },
  { type: 'moved', title: 'Transferred to Production Floor', qty: '-20 kg', location: 'Rack A01 → Rack P01', time: '2026-09-25 09:00', ref: 'WH/INT/0001', user: 'Yash Rathore' },
  { type: 'reserved', title: 'Reserved for Delivery', qty: '-12 kg', location: 'Rack A01 (Reserved)', time: '2026-09-26 07:30', ref: 'WH/OUT/0003', user: 'System' },
  { type: 'delivered', title: 'Delivered to Metro Constructions', qty: '-50 kg', location: 'Rack A01 → Customer', time: '2026-09-26 14:30', ref: 'WH/OUT/0001', user: 'Yash Rathore' },
  { type: 'adjusted', title: 'Damaged Stock Adjusted', qty: '-3 kg', location: 'Rack A01', time: '2026-09-26 09:30', ref: 'WH/ADJ/0001', user: 'Yash Rathore' },
];

export const warehouseHierarchy = {
  id: 'WH01',
  name: 'Main Warehouse',
  code: 'WH-A',
  zones: [
    {
      id: 'Z01', name: 'Storage Zone A', code: 'SZ-A',
      racks: [
        { id: 'R01', name: 'Rack A01', health: 'critical', products: 3, capacity: 500, used: 320 },
        { id: 'R02', name: 'Rack A02', health: 'healthy', products: 2, capacity: 500, used: 410 },
        { id: 'R03', name: 'Rack A03', health: 'critical', products: 0, capacity: 500, used: 0 },
      ]
    },
    {
      id: 'Z02', name: 'Storage Zone B', code: 'SZ-B',
      racks: [
        { id: 'R04', name: 'Rack B01', health: 'healthy', products: 2, capacity: 400, used: 350 },
        { id: 'R05', name: 'Rack B02', health: 'healthy', products: 1, capacity: 400, used: 260 },
      ]
    },
    {
      id: 'Z03', name: 'Production Floor', code: 'PF',
      racks: [
        { id: 'R06', name: 'Rack P01', health: 'healthy', products: 2, capacity: 300, used: 120 },
        { id: 'R07', name: 'Rack P02', health: 'watch', products: 1, capacity: 300, used: 280 },
      ]
    },
    {
      id: 'Z04', name: 'Receiving Dock', code: 'RD',
      racks: [
        { id: 'R08', name: 'Dock R01', health: 'overstock', products: 1, capacity: 200, used: 190 },
      ]
    },
  ]
};
