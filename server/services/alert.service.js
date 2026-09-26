import prisma from '../lib/prisma.js';

/**
 * Scan inventory state, pending receipts, pending deliveries, and transfers
 * to generate and synchronize active alerts without duplicates.
 */
export async function syncSystemAlerts() {
  const products = await prisma.product.findMany({
    where: { status: 'active' },
    include: {
      stock: { include: { location: { include: { warehouse: true } } } }
    }
  });

  for (const product of products) {
    const totalOnHand = product.stock.reduce((acc, s) => acc + s.onHand, 0);
    const totalReserved = product.stock.reduce((acc, s) => acc + s.reserved, 0);
    const totalAvailable = Math.max(0, totalOnHand - totalReserved);

    // 1. OUT_OF_STOCK Alert
    if (totalOnHand === 0) {
      const existing = await prisma.alert.findFirst({
        where: { productId: product.id, type: 'OUT_OF_STOCK', isResolved: false }
      });
      if (!existing) {
        await prisma.alert.create({
          data: {
            type: 'OUT_OF_STOCK',
            severity: 'CRITICAL',
            productId: product.id,
            locationId: product.stock[0]?.locationId || null,
            message: `${product.name} — Completely Out of Stock`,
            reason: `0 ${product.unit} available across all facilities. Reorder threshold is ${product.reorderPoint} ${product.unit}.`,
            recommendedAction: `Issue emergency supplier purchase order.`,
            status: 'ACTIVE',
            isResolved: false
          }
        });
      }
    } else {
      // Auto-resolve OUT_OF_STOCK if stock has returned
      await prisma.alert.updateMany({
        where: { productId: product.id, type: 'OUT_OF_STOCK', isResolved: false },
        data: { isResolved: true, status: 'RESOLVED', resolvedAt: new Date() }
      });
    }

    // 2. CRITICAL_STOCK / LOW_STOCK Alert
    if (totalAvailable > 0 && totalAvailable <= product.reorderPoint) {
      const existing = await prisma.alert.findFirst({
        where: { productId: product.id, type: 'CRITICAL_STOCK', isResolved: false }
      });
      if (!existing) {
        await prisma.alert.create({
          data: {
            type: 'CRITICAL_STOCK',
            severity: 'CRITICAL',
            productId: product.id,
            locationId: product.stock[0]?.locationId || null,
            message: `${product.name} — Below Reorder Point`,
            reason: `Available stock (${totalAvailable} ${product.unit}) has breached safety reorder level (${product.reorderPoint} ${product.unit}).`,
            recommendedAction: `Create replenishment purchase order.`,
            status: 'ACTIVE',
            isResolved: false
          }
        });
      }
    } else if (totalAvailable > product.reorderPoint) {
      await prisma.alert.updateMany({
        where: { productId: product.id, type: 'CRITICAL_STOCK', isResolved: false },
        data: { isResolved: true, status: 'RESOLVED', resolvedAt: new Date() }
      });
    }

    // 3. OVERSTOCK Alert
    if (totalOnHand > product.maxStock) {
      const existing = await prisma.alert.findFirst({
        where: { productId: product.id, type: 'OVERSTOCK', isResolved: false }
      });
      if (!existing) {
        await prisma.alert.create({
          data: {
            type: 'OVERSTOCK',
            severity: 'INFO',
            productId: product.id,
            locationId: product.stock[0]?.locationId || null,
            message: `${product.name} — Overstocked (${totalOnHand} ${product.unit})`,
            reason: `Current stock exceeds maximum capacity limit of ${product.maxStock} ${product.unit}.`,
            recommendedAction: `Pause upcoming receipts and review ordering parameters.`,
            status: 'ACTIVE',
            isResolved: false
          }
        });
      }
    } else {
      await prisma.alert.updateMany({
        where: { productId: product.id, type: 'OVERSTOCK', isResolved: false },
        data: { isResolved: true, status: 'RESOLVED', resolvedAt: new Date() }
      });
    }
  }

  // 4. TRANSFER_PENDING / IN_TRANSIT Alerts
  const activeTransfers = await prisma.transfer.findMany({
    where: { status: 'IN_TRANSIT' },
    include: { items: { include: { product: true } } }
  });

  for (const trf of activeTransfers) {
    const existing = await prisma.alert.findFirst({
      where: { message: { contains: trf.reference }, isResolved: false }
    });
    if (!existing) {
      const prdName = trf.items[0]?.product?.name || 'Stock item';
      await prisma.alert.create({
        data: {
          type: 'TRANSFER_PENDING',
          severity: 'WARNING',
          message: `Transfer ${trf.reference} In-Transit (${prdName})`,
          reason: `Internal transfer ${trf.reference} is currently in moving status. Custody awaiting arrival receipt.`,
          recommendedAction: `Inspect arrival and confirm transfer completion.`,
          status: 'ACTIVE',
          isResolved: false
        }
      });
    }
  }

  return await prisma.alert.findMany({
    where: { isResolved: false },
    include: { product: true, location: true },
    orderBy: { createdAt: 'desc' }
  });
}
