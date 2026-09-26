import prisma from '../lib/prisma.js';
import { InventoryService } from '../services/inventory.service.js';

export async function getAdjustments(req, res) {
  try {
    const adjustments = await prisma.adjustment.findMany({
      include: {
        location: { include: { warehouse: true } },
        responsibleUser: true,
        items: { include: { product: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = adjustments.map(a => {
      const item = a.items[0];
      return {
        id: a.id,
        reference: a.reference,
        product: item?.product?.name || 'Stock item',
        productId: item?.productId,
        location: a.location ? a.location.rack : 'Rack A01',
        locationCode: a.location?.code,
        systemQty: item?.systemQty || 0,
        countedQty: item?.countedQty || 0,
        difference: item?.difference || 0,
        reason: a.reason,
        unit: item?.unit || 'unit',
        responsible: a.responsibleUser?.name || 'Staff',
        status: a.status.toLowerCase(),
        notes: a.notes,
        createdAt: a.createdAt,
      };
    });

    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function createAdjustment(req, res) {
  try {
    const {
      productId,
      locationId,
      systemQty,
      countedQty,
      reason = 'COUNTING_ERROR',
      notes,
      unit = 'unit',
    } = req.body;

    if (!productId || !locationId || countedQty === undefined) {
      return res.status(400).json({ success: false, message: 'Product, location, and counted quantity are required' });
    }

    const count = await prisma.adjustment.count();
    const reference = `WH/ADJ/${String(count + 1).padStart(4, '0')}`;
    const id = `ADJ${String(count + 1).padStart(2, '0')}`;

    // Get current system quantity from stock table if not provided
    let actualSystemQty = systemQty;
    if (actualSystemQty === undefined) {
      const stock = await prisma.stock.findUnique({
        where: {
          productId_locationId: { productId, locationId }
        }
      });
      actualSystemQty = stock ? stock.onHand : 0;
    }

    const difference = Number(countedQty) - Number(actualSystemQty);

    const adjustment = await prisma.adjustment.create({
      data: {
        id,
        reference,
        locationId,
        responsibleUserId: req.user?.id || 'USR-001',
        reason,
        status: 'DRAFT',
        notes: notes || '',
        items: {
          create: [{
            productId,
            systemQty: Number(actualSystemQty),
            countedQty: Number(countedQty),
            difference,
            unit,
          }]
        }
      },
      include: { items: true }
    });

    res.status(201).json({ success: true, message: 'Adjustment recorded', data: adjustment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function applyAdjustment(req, res) {
  try {
    const { id } = req.params;
    const applied = await InventoryService.applyAdjustment({
      adjustmentId: id,
      userId: req.user?.name || 'Yash Rathore'
    });
    await InventoryService.onInventoryChanged();

    res.json({ success: true, message: 'Stock adjustment applied and ledger reconciled', data: applied });
  } catch (err) {
    console.error('applyAdjustment error:', err);
    res.status(400).json({ success: false, message: err.message });
  }
}
