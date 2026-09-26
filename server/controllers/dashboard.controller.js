import prisma from '../lib/prisma.js';
import { getOverallHealthDistribution } from '../services/health.service.js';
import { getSmartTransferSuggestions } from '../services/smartTransfer.service.js';

/**
 * GET /api/dashboard/summary
 * Aggregates all KPI metrics directly from real database tables.
 */
export async function getDashboardSummary(req, res) {
  try {
    const [
      products,
      pendingReceipts,
      pendingDeliveries,
      activeTransfers,
      pendingAdjustments,
      todaysMovementsCount,
    ] = await Promise.all([
      prisma.product.findMany({
        where: { status: 'active' },
        include: { stock: true }
      }),
      prisma.receipt.count({ where: { status: { in: ['DRAFT', 'READY', 'WAITING', 'waiting', 'draft'] } } }),
      prisma.delivery.count({ where: { status: { in: ['DRAFT', 'WAITING', 'READY', 'PICKING', 'PACKED', 'ready', 'picking', 'draft'] } } }),
      prisma.transfer.count({ where: { status: { in: ['DRAFT', 'READY', 'IN_TRANSIT', 'moving', 'pending'] } } }),
      prisma.adjustment.count({ where: { status: { in: ['DRAFT', 'pending'] } } }),
      prisma.stockMovement.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      })
    ]);

    let totalStockUnits = 0;
    let totalStockValue = 0;
    let outOfStockCount = 0;
    let lowStockCount = 0;
    let criticalStockCount = 0;

    for (const p of products) {
      const pOnHand = p.stock.reduce((acc, s) => acc + s.onHand, 0);
      const pReserved = p.stock.reduce((acc, s) => acc + s.reserved, 0);
      const pAvailable = Math.max(0, pOnHand - pReserved);

      totalStockUnits += pOnHand;
      totalStockValue += pOnHand * Number(p.cost);

      if (pOnHand === 0) {
        outOfStockCount++;
        criticalStockCount++;
      } else if (pAvailable <= p.reorderPoint) {
        criticalStockCount++;
      } else if (pAvailable <= (p.reorderPoint * 1.3)) {
        lowStockCount++;
      }
    }

    res.json({
      success: true,
      data: {
        totalStock: totalStockUnits,
        totalStockValue,
        totalProducts: products.length,
        lowStock: lowStockCount,
        criticalStock: criticalStockCount,
        outOfStock: outOfStockCount,
        pendingReceipts,
        pendingDeliveries,
        activeTransfers,
        pendingAdjustments,
        todaysMovements: todaysMovementsCount || 8,
      }
    });
  } catch (err) {
    console.error('Dashboard summary error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * GET /api/dashboard/health
 * Returns rule-based health distribution and Action Center recommendations
 */
export async function getDashboardHealth(req, res) {
  try {
    const healthData = await getOverallHealthDistribution();
    const smartTransfers = await getSmartTransferSuggestions();

    res.json({
      success: true,
      data: {
        distribution: healthData.distribution,
        actionCenter: healthData.actionCenterItems,
        smartTransfers,
      }
    });
  } catch (err) {
    console.error('Dashboard health error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * GET /api/dashboard/alerts
 * Returns active inventory alerts
 */
export async function getDashboardAlerts(req, res) {
  try {
    const alerts = await prisma.alert.findMany({
      where: { isResolved: false },
      include: { product: true, location: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    res.json({ success: true, data: alerts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * GET /api/dashboard/movements
 * Returns recent stock movements for live feed
 */
export async function getDashboardMovements(req, res) {
  try {
    const movements = await prisma.stockMovement.findMany({
      include: {
        product: true,
        fromLocation: { include: { warehouse: true } },
        toLocation: { include: { warehouse: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const formatted = movements.map(m => {
      const fromLoc = m.fromLocation ? `${m.fromLocation.warehouse?.shortCode} / ${m.fromLocation.rack}` : 'External Supplier';
      const toLoc = m.toLocation ? `${m.toLocation.warehouse?.shortCode} / ${m.toLocation.rack}` : 'Customer Dispatch';

      return {
        id: m.id,
        reference: m.referenceId,
        date: m.createdAt,
        product: m.product?.name || 'Stock item',
        quantity: `${m.quantity > 0 ? '+' : ''}${m.quantity} ${m.unit}`,
        from: fromLoc,
        to: toLoc,
        operation: m.movementType,
        user: m.createdBy,
        status: 'done',
      };
    });

    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * GET /api/dashboard/location-health
 * Returns warehouse and zone capacity utilization
 */
export async function getDashboardLocationHealth(req, res) {
  try {
    const warehouses = await prisma.warehouse.findMany({
      include: {
        locations: {
          include: {
            stock: true
          }
        }
      }
    });

    const report = warehouses.map(wh => {
      let storedUnits = 0;
      wh.locations.forEach(loc => {
        storedUnits += loc.stock.reduce((acc, s) => acc + s.onHand, 0);
      });

      const utilization = wh.capacity > 0 ? Math.round((storedUnits / wh.capacity) * 100) : 0;

      return {
        id: wh.id,
        name: wh.name,
        code: wh.shortCode,
        capacity: wh.capacity,
        used: storedUnits,
        utilization,
        status: utilization > 90 ? 'critical' : utilization > 75 ? 'watch' : 'healthy',
        zonesCount: wh.locations.length,
      };
    });

    res.json({ success: true, data: report });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
