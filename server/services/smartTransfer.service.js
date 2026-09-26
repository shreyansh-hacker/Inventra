import prisma from '../lib/prisma.js';

/**
 * Scan warehouse stock distributions to detect location imbalances
 * and suggest smart internal transfers requiring user confirmation.
 */
export async function getSmartTransferSuggestions() {
  const products = await prisma.product.findMany({
    where: { status: 'active' },
    include: {
      stock: {
        include: {
          location: {
            include: { warehouse: true }
          }
        }
      }
    }
  });

  const suggestions = [];

  for (const product of products) {
    if (product.stock.length < 2) continue;

    // Group stock by warehouse
    const whStockMap = {};
    for (const s of product.stock) {
      const whId = s.location?.warehouseId || 'WH01';
      const whName = s.location?.warehouse?.name || 'Main Warehouse';
      if (!whStockMap[whId]) {
        whStockMap[whId] = {
          warehouseId: whId,
          warehouseName: whName,
          locationId: s.locationId,
          locationCode: s.location?.code,
          available: 0,
          onHand: 0,
          reserved: 0
        };
      }
      whStockMap[whId].available += s.available;
      whStockMap[whId].onHand += s.onHand;
      whStockMap[whId].reserved += s.reserved;
    }

    const whEntries = Object.values(whStockMap);
    if (whEntries.length < 2) continue;

    // Sort warehouses by available stock ascending
    whEntries.sort((a, b) => a.available - b.available);

    const lowest = whEntries[0];
    const highest = whEntries[whEntries.length - 1];

    // Threshold check: if lowest warehouse has very low stock relative to reorder point,
    // and highest warehouse has substantial surplus (more than 3x lowest)
    if (lowest.available < (product.reorderPoint / 2) && highest.available > product.reorderPoint * 2) {
      const suggestedQty = Math.min(
        Math.floor(highest.available / 2),
        Math.max(product.reorderPoint, Math.ceil((highest.available - lowest.available) / 3))
      );

      if (suggestedQty > 0) {
        suggestions.push({
          id: `SUGG-${product.id}-${highest.warehouseId}-${lowest.warehouseId}`,
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          unit: product.unit,
          fromWarehouseId: highest.warehouseId,
          fromWarehouseName: highest.warehouseName,
          fromLocationId: highest.locationId,
          fromLocationCode: highest.locationCode,
          fromAvailable: highest.available,
          toWarehouseId: lowest.warehouseId,
          toWarehouseName: lowest.warehouseName,
          toLocationId: lowest.locationId,
          toLocationCode: lowest.locationCode,
          toAvailable: lowest.available,
          suggestedQuantity: suggestedQty,
          reason: `Stock imbalance detected: ${highest.warehouseName} has ${highest.available} ${product.unit} while ${lowest.warehouseName} is running dangerously low (${lowest.available} ${product.unit}).`,
          status: 'PENDING_APPROVAL',
        });
      }
    }
  }

  return suggestions;
}
