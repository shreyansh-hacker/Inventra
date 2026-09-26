import prisma from '../lib/prisma.js';
import { InventoryService } from '../services/inventory.service.js';

export async function getReceipts(req, res) {
  try {
    const receipts = await prisma.receipt.findMany({
      include: {
        supplier: true,
        warehouse: true,
        destinationLocation: true,
        responsibleUser: true,
        items: { include: { product: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = receipts.map(r => ({
      id: r.id,
      reference: r.reference,
      supplier: r.supplier?.name || r.supplierId,
      supplierId: r.supplierId,
      warehouseId: r.warehouseId,
      warehouse: r.warehouse?.name || 'Main Warehouse',
      destination: r.destinationLocation ? `${r.destinationLocation.rack} (${r.destinationLocation.zone})` : 'Dock R01',
      scheduleDate: r.scheduleDate ? r.scheduleDate.toISOString().split('T')[0] : '',
      responsible: r.responsibleUser?.name || 'Staff',
      status: r.status.toLowerCase(),
      notes: r.notes || '',
      createdAt: r.createdAt,
      completedAt: r.completedAt,
      items: r.items.map(it => ({
        id: it.id,
        productId: it.productId,
        product: it.product?.name || it.productId,
        expected: it.expectedQty,
        received: it.receivedQty,
        difference: it.difference,
        unit: it.unit || it.product?.unit || 'unit',
      }))
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function getReceiptById(req, res) {
  try {
    const { id } = req.params;
    const r = await prisma.receipt.findUnique({
      where: { id },
      include: {
        supplier: true,
        warehouse: true,
        destinationLocation: true,
        responsibleUser: true,
        items: { include: { product: true } }
      }
    });

    if (!r) {
      return res.status(404).json({ success: false, message: 'Receipt not found' });
    }

    res.json({
      success: true,
      data: {
        id: r.id,
        reference: r.reference,
        supplier: r.supplier?.name || r.supplierId,
        supplierId: r.supplierId,
        warehouseId: r.warehouseId,
        warehouse: r.warehouse?.name,
        destination: r.destinationLocation?.rack || 'Dock R01',
        destinationLocationId: r.destinationLocationId,
        scheduleDate: r.scheduleDate ? r.scheduleDate.toISOString().split('T')[0] : '',
        responsible: r.responsibleUser?.name,
        status: r.status.toLowerCase(),
        notes: r.notes,
        createdAt: r.createdAt,
        completedAt: r.completedAt,
        items: r.items.map(it => ({
          id: it.id,
          productId: it.productId,
          product: it.product?.name || it.productId,
          expected: it.expectedQty,
          received: it.receivedQty,
          difference: it.difference,
          unit: it.unit,
        }))
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function createReceipt(req, res) {
  try {
    const {
      supplierId,
      warehouseId = 'WH01',
      destinationLocationId,
      scheduleDate,
      notes,
      items = [],
    } = req.body;

    const count = await prisma.receipt.count();
    const reference = `WH/IN/${String(count + 1).padStart(4, '0')}`;
    const id = `REC${String(count + 1).padStart(2, '0')}`;

    // Find destination location if not provided
    let destLocId = destinationLocationId;
    if (!destLocId) {
      const loc = await prisma.location.findFirst({ where: { warehouseId } });
      destLocId = loc?.id;
    }

    const receipt = await prisma.receipt.create({
      data: {
        id,
        reference,
        supplierId: supplierId || 'SUP01',
        warehouseId,
        destinationLocationId: destLocId,
        scheduleDate: scheduleDate ? new Date(scheduleDate) : new Date(),
        responsibleUserId: req.user?.id || 'USR-001',
        status: 'READY',
        notes: notes || '',
        items: {
          create: items.map(it => ({
            productId: it.productId,
            expectedQty: Number(it.expectedQty || it.expected || 100),
            receivedQty: 0,
            difference: -Number(it.expectedQty || it.expected || 100),
            unit: it.unit || 'unit',
          }))
        }
      },
      include: { items: true }
    });

    res.status(201).json({ success: true, message: 'Receipt created', data: receipt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function validateReceipt(req, res) {
  try {
    const { id } = req.params;
    const validated = await InventoryService.validateReceipt({
      receiptId: id,
      userId: req.user?.name || 'Yash Rathore'
    });
    await InventoryService.onInventoryChanged();

    res.json({ success: true, message: 'Receipt validated and stock ledger updated successfully', data: validated });
  } catch (err) {
    console.error('validateReceipt error:', err);
    res.status(400).json({ success: false, message: err.message });
  }
}
