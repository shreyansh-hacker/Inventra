import prisma from '../lib/prisma.js';

export async function getWarehouses(req, res) {
  try {
    const warehouses = await prisma.warehouse.findMany({
      include: {
        locations: {
          include: {
            stock: {
              include: { product: true }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    const formatted = warehouses.map(w => {
      let totalUsed = 0;
      let totalProductsCount = 0;

      w.locations.forEach(loc => {
        loc.stock.forEach(s => {
          totalUsed += s.onHand;
          if (s.onHand > 0) totalProductsCount++;
        });
      });

      return {
        id: w.id,
        name: w.name,
        shortCode: w.shortCode,
        address: w.address,
        capacity: w.capacity,
        used: totalUsed || w.usedCapacity,
        status: w.status,
        locationsCount: w.locations.length,
        productsCount: totalProductsCount,
      };
    });

    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function getInventoryMap(req, res) {
  try {
    const { warehouseId = 'WH01' } = req.query;

    const warehouse = await prisma.warehouse.findUnique({
      where: { id: warehouseId },
      include: {
        locations: {
          include: {
            stock: {
              include: { product: true }
            },
            movementsTo: {
              take: 5,
              orderBy: { createdAt: 'desc' },
              include: { product: true }
            }
          }
        }
      }
    });

    if (!warehouse) {
      return res.status(404).json({ success: false, message: 'Warehouse not found' });
    }

    // Group locations by zone
    const zonesMap = {};
    warehouse.locations.forEach(loc => {
      if (!zonesMap[loc.zone]) {
        zonesMap[loc.zone] = {
          name: loc.zone,
          code: loc.zone.split(' ').map(w => w[0]).join('').toUpperCase(),
          racks: []
        };
      }

      let occupiedUnits = 0;
      const productsInRack = loc.stock
        .filter(s => s.onHand > 0)
        .map(s => {
          occupiedUnits += s.onHand;
          return {
            id: s.product?.id,
            name: s.product?.name,
            sku: s.product?.sku,
            onHand: s.onHand,
            available: s.available,
            unit: s.product?.unit || 'unit',
          };
        });

      const utilization = loc.capacity > 0 ? (occupiedUnits / loc.capacity) : 0;
      let health = 'healthy';
      if (utilization > 0.9) health = 'overstock';
      else if (utilization === 0) health = 'critical';
      else if (utilization < 0.25) health = 'watch';

      zonesMap[loc.zone].racks.push({
        id: loc.id,
        name: loc.rack,
        shelf: loc.shelf,
        bin: loc.bin,
        code: loc.code,
        capacity: loc.capacity,
        used: occupiedUnits,
        available: Math.max(0, loc.capacity - occupiedUnits),
        health,
        productsCount: productsInRack.length,
        products: productsInRack,
        recentMovements: loc.movementsTo.map(m => ({
          id: m.id,
          date: m.createdAt,
          product: m.product?.name,
          quantity: `${m.quantity > 0 ? '+' : ''}${m.quantity}`,
          ref: m.referenceId,
        }))
      });
    });

    res.json({
      success: true,
      data: {
        id: warehouse.id,
        name: warehouse.name,
        code: warehouse.shortCode,
        zones: Object.values(zonesMap),
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
