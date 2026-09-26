import prisma from '../lib/prisma.js';

export class StockService {
  /**
   * Get complete stock ledger transactions (immutable double-entry trail)
   */
  static async getLedger({ productId, limit = 50, offset = 0 } = {}) {
    const where = {};
    if (productId) where.productId = productId;

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        include: {
          product: true,
          fromLocation: { include: { warehouse: true } },
          toLocation: { include: { warehouse: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.stockMovement.count({ where }),
    ]);

    return { movements, total };
  }

  /**
   * Product-level visual timeline / Stock Journey:
   * Purchased -> Received -> Stored -> Moved -> Reserved -> Delivered / Adjusted
   * Answers: "Why is this product quantity what it is?"
   */
  static async getProductJourney(productId) {
    const movements = await prisma.stockMovement.findMany({
      where: { productId },
      include: {
        fromLocation: { include: { warehouse: true } },
        toLocation: { include: { warehouse: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    let runningBalance = 0;

    return movements.map((m) => {
      runningBalance += m.quantity;

      let type = 'moved';
      let title = `Stock Movement (${m.movementType})`;

      if (m.movementType === 'RECEIPT') {
        type = 'receipt';
        title = `Inbound Receipt: +${m.quantity} ${m.unit}`;
      } else if (m.movementType === 'DELIVERY') {
        type = 'delivered';
        title = `Delivered to Customer: ${m.quantity} ${m.unit}`;
      } else if (m.movementType === 'TRANSFER') {
        type = 'moved';
        title = `Transferred: ${m.quantity} ${m.unit}`;
      } else if (m.movementType === 'ADJUSTMENT') {
        type = 'adjusted';
        title = `Physical Count Adjusted: ${m.quantity > 0 ? '+' : ''}${m.quantity} ${m.unit}`;
      }

      const fromDesc = m.fromLocation ? `${m.fromLocation.warehouse?.shortCode} / ${m.fromLocation.rack}` : 'External Supplier';
      const toDesc = m.toLocation ? `${m.toLocation.warehouse?.shortCode} / ${m.toLocation.rack}` : 'Customer Dispatch';

      return {
        id: m.id,
        type,
        title,
        operation: m.movementType,
        quantity: `${m.quantity > 0 ? '+' : ''}${m.quantity} ${m.unit}`,
        runningBalance: `${runningBalance} ${m.unit}`,
        location: `${fromDesc} → ${toDesc}`,
        reference: m.referenceId,
        user: m.createdBy,
        notes: m.notes,
        time: m.createdAt,
      };
    });
  }

  /**
   * Get multi-location stock breakdown for a product
   */
  static async getProductLocationStock(productId) {
    return await prisma.stock.findMany({
      where: { productId },
      include: {
        location: {
          include: { warehouse: true }
        }
      }
    });
  }
}
