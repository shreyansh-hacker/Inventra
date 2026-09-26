import prisma from '../lib/prisma.js';
import { StockService } from '../services/stock.service.js';

export async function getStockLedger(req, res) {
  try {
    const { productId, movementType, limit = 100, page = 1 } = req.query;

    const where = {};
    if (productId && productId !== 'all') where.productId = productId;
    if (movementType && movementType !== 'all') where.movementType = movementType.toUpperCase();

    const take = Number(limit);
    const skip = (Number(page) - 1) * take;

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        include: {
          product: true,
          fromLocation: { include: { warehouse: true } },
          toLocation: { include: { warehouse: true } },
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      prisma.stockMovement.count({ where })
    ]);

    // Format for frontend Stock Ledger table
    const formatted = movements.map(m => {
      const loc = m.toLocation ? m.toLocation.rack : m.fromLocation ? m.fromLocation.rack : 'Central Hub';
      return {
        id: m.id,
        time: m.createdAt,
        product: m.product?.name || 'Stock Item',
        productId: m.productId,
        location: loc,
        movement: m.movementType === 'RECEIPT' ? 'Receipt' :
                  m.movementType === 'DELIVERY' ? 'Delivery' :
                  m.movementType === 'TRANSFER' ? 'Transfer' : 'Adjustment',
        change: m.quantity,
        reference: m.referenceId,
        user: m.createdBy,
        notes: m.notes,
        unit: m.unit,
      };
    });

    res.json({
      success: true,
      data: formatted,
      pagination: { total, page: Number(page), limit: take }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function getMoveHistory(req, res) {
  try {
    const { product, operation, user, limit = 50 } = req.query;

    const where = {};
    if (operation && operation !== 'all') where.movementType = operation.toUpperCase();

    const movements = await prisma.stockMovement.findMany({
      where,
      include: {
        product: true,
        fromLocation: { include: { warehouse: true } },
        toLocation: { include: { warehouse: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
    });

    const formatted = movements.map(m => {
      const fromDesc = m.fromLocation
        ? `${m.fromLocation.warehouse?.shortCode} / ${m.fromLocation.rack}`
        : 'External Supplier';
      const toDesc = m.toLocation
        ? `${m.toLocation.warehouse?.shortCode} / ${m.toLocation.rack}`
        : 'Customer Delivery';

      return {
        id: m.id,
        reference: m.referenceId,
        date: m.createdAt,
        product: m.product?.name || 'Item',
        quantity: `${Math.abs(m.quantity)} ${m.unit}`,
        from: fromDesc,
        to: toDesc,
        operation: m.movementType === 'RECEIPT' ? 'Receipt' :
                   m.movementType === 'DELIVERY' ? 'Delivery' :
                   m.movementType === 'TRANSFER' ? 'Transfer' : 'Adjustment',
        user: m.createdBy,
        status: 'done',
        notes: m.notes,
      };
    });

    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
