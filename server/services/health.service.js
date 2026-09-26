import prisma from '../lib/prisma.js';

/**
 * Calculate explainable Inventory Health for a given product or list of products.
 * Measurable inputs:
 *  - Available Stock (onHand - reserved - damaged)
 *  - Average Daily Usage (calculated from past 30 days of DELIVERIES / TRANSFER / USAGE, or standard baseline)
 *  - Reorder Point & Min/Max thresholds
 */
export async function calculateProductHealth(productId, productData = null) {
  const product = productData || await prisma.product.findUnique({
    where: { id: productId },
    include: {
      stock: {
        include: { location: { include: { warehouse: true } } }
      }
    }
  });

  if (!product) return null;

  // Total stock across all locations
  const totalOnHand = product.stock.reduce((acc, s) => acc + s.onHand, 0);
  const totalReserved = product.stock.reduce((acc, s) => acc + s.reserved, 0);
  const totalDamaged = product.stock.reduce((acc, s) => acc + s.damaged, 0);
  const totalAvailable = Math.max(0, totalOnHand - totalReserved - totalDamaged);

  // Calculate average daily usage based on last 30 days outbound movements
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const pastDeliveries = await prisma.stockMovement.findMany({
    where: {
      productId: product.id,
      movementType: 'DELIVERY',
      createdAt: { gte: thirtyDaysAgo }
    }
  });

  const totalDelivered30Days = pastDeliveries.reduce((acc, m) => acc + Math.abs(m.quantity), 0);
  // Default to sensible baseline daily usage if newly introduced
  const calculatedDailyUsage = totalDelivered30Days > 0 ? (totalDelivered30Days / 30) : Math.max(1, Math.round(product.reorderPoint / 10));
  const dailyUsage = Math.max(0.5, Math.round(calculatedDailyUsage * 10) / 10);

  // Estimated days remaining
  const daysRemaining = dailyUsage > 0 ? Math.round(totalAvailable / dailyUsage) : 999;

  let health = 'HEALTHY';
  let reason = 'Stock is within optimal operating capacity and reorder safety buffers.';
  let recommendedAction = 'No immediate action required.';

  if (totalOnHand === 0 || totalAvailable === 0) {
    health = 'CRITICAL';
    reason = 'Product is completely out of stock across all warehouse locations.';
    recommendedAction = `Create emergency purchase order with supplier (${product.reorderPoint * 2} ${product.unit}).`;
  } else if (totalAvailable <= product.reorderPoint || daysRemaining <= 3) {
    health = 'CRITICAL';
    reason = `Available stock (${totalAvailable} ${product.unit}) is at or below the safety reorder point (${product.reorderPoint} ${product.unit}). Estimated run-out in ${daysRemaining} days.`;
    recommendedAction = `Trigger replenishment purchase order for ${product.maxStock - totalOnHand} ${product.unit}.`;
  } else if (totalAvailable <= (product.reorderPoint * 1.3) || daysRemaining <= 7) {
    health = 'RISK';
    reason = `Stock levels are approaching minimum safety threshold. Estimated ${daysRemaining} days remaining based on daily consumption of ${dailyUsage} ${product.unit}/day.`;
    recommendedAction = `Prepare purchase requisition with primary supplier.`;
  } else if (totalOnHand > product.maxStock) {
    health = 'EXCESS';
    reason = `Current on-hand inventory (${totalOnHand} ${product.unit}) exceeds maximum capacity threshold (${product.maxStock} ${product.unit}). Capital is tied up.`;
    recommendedAction = `Halt new purchase receipts; review warehouse reorder ceiling.`;
  }

  return {
    productId: product.id,
    productName: product.name,
    sku: product.sku,
    category: product.categoryId,
    unit: product.unit,
    totalOnHand,
    totalReserved,
    totalDamaged,
    totalAvailable,
    reorderPoint: product.reorderPoint,
    minStock: product.minStock,
    maxStock: product.maxStock,
    dailyUsage,
    daysRemaining,
    health, // HEALTHY, RISK, CRITICAL, EXCESS
    reason,
    recommendedAction,
    locations: product.stock.map(s => ({
      locationId: s.locationId,
      code: s.location?.code,
      warehouseId: s.location?.warehouseId,
      warehouseName: s.location?.warehouse?.name,
      zone: s.location?.zone,
      rack: s.location?.rack,
      onHand: s.onHand,
      available: s.available,
    }))
  };
}

/**
 * Calculate health summary across all active products
 */
export async function getOverallHealthDistribution() {
  const products = await prisma.product.findMany({
    where: { status: 'active' },
    include: {
      stock: { include: { location: { include: { warehouse: true } } } }
    }
  });

  const evaluations = await Promise.all(products.map(p => calculateProductHealth(p.id, p)));

  const distribution = {
    HEALTHY: 0,
    RISK: 0,
    CRITICAL: 0,
    EXCESS: 0,
  };

  const actionCenterItems = [];

  evaluations.forEach(ev => {
    if (!ev) return;
    distribution[ev.health] = (distribution[ev.health] || 0) + 1;

    if (ev.health === 'CRITICAL' || ev.health === 'RISK' || ev.health === 'EXCESS') {
      actionCenterItems.push({
        id: `ACT-${ev.productId}`,
        type: ev.health === 'CRITICAL' ? 'Critical Stock' : ev.health === 'RISK' ? 'Low Stock Risk' : 'Excess Inventory',
        severity: ev.health === 'CRITICAL' ? 'critical' : ev.health === 'RISK' ? 'warning' : 'info',
        product: ev.productName,
        productId: ev.productId,
        sku: ev.sku,
        available: `${ev.totalAvailable} ${ev.unit}`,
        dailyUsage: `${ev.dailyUsage} ${ev.unit}/day`,
        daysRemaining: ev.daysRemaining,
        reason: ev.reason,
        action: ev.recommendedAction,
        actionType: ev.totalAvailable <= ev.reorderPoint ? 'CREATE_PURCHASE' : 'REVIEW',
      });
    }
  });

  return {
    distribution,
    actionCenterItems,
    evaluations,
  };
}
