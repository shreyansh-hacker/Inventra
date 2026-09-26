import prisma from '../lib/prisma.js';
import { logAudit } from './audit.service.js';
import { syncSystemAlerts } from './alert.service.js';

/**
 * INVENTRA CORE INVENTORY SERVICE
 * All stock-changing transactions pass through this atomic engine.
 * Never allows negative stock silently.
 * Always records immutable stock movements in `stock_movements`.
 */
export class InventoryService {

  /**
   * 1. Validate and execute an Inbound Receipt.
   * Increases onHand stock at destination location, writes movement ledger, updates receipt to DONE.
   */
  static async validateReceipt({ receiptId, userId }) {
    return await prisma.$transaction(async (tx) => {
      const receipt = await tx.receipt.findUnique({
        where: { id: receiptId },
        include: { items: { include: { product: true } }, destinationLocation: true, warehouse: true }
      });

      if (!receipt) {
        throw new Error(`Receipt not found: ${receiptId}`);
      }

      if (receipt.status === 'DONE') {
        throw new Error(`Receipt ${receipt.reference} has already been validated and marked DONE.`);
      }

      // Determine destination location
      let destLocId = receipt.destinationLocationId;
      if (!destLocId) {
        const fallbackLoc = await tx.location.findFirst({
          where: { warehouseId: receipt.warehouseId }
        });
        destLocId = fallbackLoc?.id;
      }

      if (!destLocId) {
        throw new Error(`No destination storage location found for warehouse ${receipt.warehouseId}`);
      }

      // Process each received item
      for (const item of receipt.items) {
        const qtyReceived = item.receivedQty > 0 ? item.receivedQty : item.expectedQty;

        if (qtyReceived <= 0) continue;

        // Upsert stock record at location
        const existingStock = await tx.stock.findUnique({
          where: {
            productId_locationId: {
              productId: item.productId,
              locationId: destLocId,
            }
          }
        });

        if (existingStock) {
          await tx.stock.update({
            where: { id: existingStock.id },
            data: {
              onHand: existingStock.onHand + qtyReceived,
              available: Math.max(0, (existingStock.onHand + qtyReceived) - existingStock.reserved - existingStock.damaged),
              lastCountedAt: new Date(),
            }
          });
        } else {
          await tx.stock.create({
            data: {
              productId: item.productId,
              locationId: destLocId,
              onHand: qtyReceived,
              reserved: 0,
              damaged: 0,
              available: qtyReceived,
              lastCountedAt: new Date(),
            }
          });
        }

        // Update product last movement timestamp
        await tx.product.update({
          where: { id: item.productId },
          data: { lastMovementAt: new Date() }
        });

        // Insert immutable stock movement ledger entry
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            movementType: 'RECEIPT',
            quantity: qtyReceived,
            unit: item.unit || item.product?.unit || 'unit',
            fromLocationId: null, // From external supplier
            toLocationId: destLocId,
            referenceId: receipt.reference,
            notes: `Inbound receipt from ${receipt.supplierId} into location ${destLocId}`,
            createdBy: userId || receipt.responsibleUserId,
          }
        });

        // Update item received qty if not already populated
        await tx.receiptItem.update({
          where: { id: item.id },
          data: {
            receivedQty: qtyReceived,
            difference: qtyReceived - item.expectedQty,
          }
        });
      }

      // Mark receipt DONE
      const updatedReceipt = await tx.receipt.update({
        where: { id: receiptId },
        data: {
          status: 'DONE',
          completedAt: new Date(),
          destinationLocationId: destLocId,
        },
        include: { items: true }
      });

      // Log audit
      await logAudit({
        userId,
        action: 'RECEIPT_VALIDATED',
        entity: 'Receipt',
        entityId: receipt.reference,
        metadata: { receiptId, totalItems: receipt.items.length }
      });

      return updatedReceipt;
    });
  }

  /**
   * 2. Validate and dispatch an Outbound Delivery.
   * Decreases stock at source location, verifies shortages, logs movement ledger, marks delivery DONE.
   */
  static async validateDelivery({ deliveryId, userId }) {
    return await prisma.$transaction(async (tx) => {
      const delivery = await tx.delivery.findUnique({
        where: { id: deliveryId },
        include: { items: { include: { product: true } }, warehouse: true }
      });

      if (!delivery) {
        throw new Error(`Delivery not found: ${deliveryId}`);
      }

      if (delivery.status === 'DONE' || delivery.status === 'DELIVERED') {
        throw new Error(`Delivery ${delivery.reference} is already completed.`);
      }

      // Verify availability across all items before making any modifications
      for (const item of delivery.items) {
        const qtyToDeliver = item.requestedQty;

        // Find available stock in warehouse
        const stocks = await tx.stock.findMany({
          where: {
            productId: item.productId,
            location: { warehouseId: delivery.warehouseId }
          },
          include: { location: true }
        });

        const totalAvailable = stocks.reduce((acc, s) => acc + s.available, 0);

        if (totalAvailable < qtyToDeliver) {
          const shortage = qtyToDeliver - totalAvailable;
          const err = new Error(
            `Insufficient stock for ${item.product?.name || item.productId}. Requested: ${qtyToDeliver}, Available in warehouse: ${totalAvailable}. Shortage: ${shortage}`
          );
          err.code = 'INSUFFICIENT_STOCK';
          err.shortage = shortage;
          throw err;
        }
      }

      // Stock is guaranteed available, deduct atomically
      for (const item of delivery.items) {
        let remainingToDeduct = item.requestedQty;

        const stocks = await tx.stock.findMany({
          where: {
            productId: item.productId,
            location: { warehouseId: delivery.warehouseId },
            available: { gt: 0 }
          },
          orderBy: { onHand: 'desc' }
        });

        for (const stockRecord of stocks) {
          if (remainingToDeduct <= 0) break;

          const deductFromThis = Math.min(stockRecord.available, remainingToDeduct);

          await tx.stock.update({
            where: { id: stockRecord.id },
            data: {
              onHand: stockRecord.onHand - deductFromThis,
              reserved: Math.max(0, stockRecord.reserved - deductFromThis),
              available: Math.max(0, (stockRecord.onHand - deductFromThis) - Math.max(0, stockRecord.reserved - deductFromThis) - stockRecord.damaged),
            }
          });

          // Create ledger entry
          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              movementType: 'DELIVERY',
              quantity: -deductFromThis,
              unit: item.unit || item.product?.unit || 'unit',
              fromLocationId: stockRecord.locationId,
              toLocationId: null, // Out to customer
              referenceId: delivery.reference,
              notes: `Outbound delivery to customer ${delivery.customerId}`,
              createdBy: userId || delivery.responsibleUserId,
            }
          });

          remainingToDeduct -= deductFromThis;
        }

        // Update product last movement
        await tx.product.update({
          where: { id: item.productId },
          data: { lastMovementAt: new Date() }
        });

        // Mark item delivered
        await tx.deliveryItem.update({
          where: { id: item.id },
          data: {
            pickedQty: item.requestedQty,
            packedQty: item.requestedQty,
            deliveredQty: item.requestedQty,
          }
        });
      }

      // Mark delivery DELIVERED / DONE
      const updatedDelivery = await tx.delivery.update({
        where: { id: deliveryId },
        data: {
          status: 'DELIVERED',
          completedAt: new Date(),
        },
        include: { items: true }
      });

      // Audit log
      await logAudit({
        userId,
        action: 'DELIVERY_VALIDATED',
        entity: 'Delivery',
        entityId: delivery.reference,
        metadata: { deliveryId, totalItems: delivery.items.length }
      });

      return updatedDelivery;
    });
  }

  /**
   * 3. Execute an Internal Transfer.
   * Source stock -= quantity; Destination stock += quantity.
   * Company-wide total stock remains identical.
   */
  static async executeTransfer({ transferId, userId }) {
    return await prisma.$transaction(async (tx) => {
      const transfer = await tx.transfer.findUnique({
        where: { id: transferId },
        include: { items: { include: { product: true } }, sourceLocation: true, destinationLocation: true }
      });

      if (!transfer) {
        throw new Error(`Transfer not found: ${transferId}`);
      }

      if (transfer.status === 'DONE') {
        throw new Error(`Transfer ${transfer.reference} is already completed.`);
      }

      for (const item of transfer.items) {
        // Check source stock
        const sourceStock = await tx.stock.findUnique({
          where: {
            productId_locationId: {
              productId: item.productId,
              locationId: transfer.sourceLocationId
            }
          }
        });

        if (!sourceStock || sourceStock.available < item.quantity) {
          const available = sourceStock?.available || 0;
          throw new Error(
            `Insufficient stock at source location (${transfer.sourceLocation?.code || transfer.sourceLocationId}) for ${item.product?.name}. Requested: ${item.quantity}, Available: ${available}`
          );
        }

        // Deduct from source
        await tx.stock.update({
          where: { id: sourceStock.id },
          data: {
            onHand: sourceStock.onHand - item.quantity,
            available: Math.max(0, (sourceStock.onHand - item.quantity) - sourceStock.reserved - sourceStock.damaged)
          }
        });

        // Add to destination
        const destStock = await tx.stock.findUnique({
          where: {
            productId_locationId: {
              productId: item.productId,
              locationId: transfer.destinationLocationId
            }
          }
        });

        if (destStock) {
          await tx.stock.update({
            where: { id: destStock.id },
            data: {
              onHand: destStock.onHand + item.quantity,
              available: Math.max(0, (destStock.onHand + item.quantity) - destStock.reserved - destStock.damaged)
            }
          });
        } else {
          await tx.stock.create({
            data: {
              productId: item.productId,
              locationId: transfer.destinationLocationId,
              onHand: item.quantity,
              reserved: 0,
              damaged: 0,
              available: item.quantity,
            }
          });
        }

        // Create unified ledger movement
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            movementType: 'TRANSFER',
            quantity: item.quantity,
            unit: item.unit || item.product?.unit || 'unit',
            fromLocationId: transfer.sourceLocationId,
            toLocationId: transfer.destinationLocationId,
            referenceId: transfer.reference,
            notes: `Internal transfer from ${transfer.sourceLocation?.code} to ${transfer.destinationLocation?.code}`,
            createdBy: userId || transfer.responsibleUserId,
          }
        });

        // Update product movement timestamp
        await tx.product.update({
          where: { id: item.productId },
          data: { lastMovementAt: new Date() }
        });
      }

      // Mark transfer DONE
      const updatedTransfer = await tx.transfer.update({
        where: { id: transferId },
        data: {
          status: 'DONE',
          completedAt: new Date(),
        }
      });

      // Audit log
      await logAudit({
        userId,
        action: 'TRANSFER_COMPLETED',
        entity: 'Transfer',
        entityId: transfer.reference,
        metadata: { transferId }
      });

      return updatedTransfer;
    });
  }

  /**
   * 4. Apply a Physical Stock Adjustment.
   * Compares system qty vs counted qty. Never overwrites history; creates an ADJUSTMENT movement.
   */
  static async applyAdjustment({ adjustmentId, userId }) {
    return await prisma.$transaction(async (tx) => {
      const adjustment = await tx.adjustment.findUnique({
        where: { id: adjustmentId },
        include: { items: { include: { product: true } }, location: true }
      });

      if (!adjustment) {
        throw new Error(`Adjustment record not found: ${adjustmentId}`);
      }

      if (adjustment.status === 'APPLIED') {
        throw new Error(`Adjustment ${adjustment.reference} has already been applied.`);
      }

      for (const item of adjustment.items) {
        const diff = item.difference; // difference = counted - system
        if (diff === 0) continue;

        const currentStock = await tx.stock.findUnique({
          where: {
            productId_locationId: {
              productId: item.productId,
              locationId: adjustment.locationId,
            }
          }
        });

        const currentOnHand = currentStock ? currentStock.onHand : 0;
        const newOnHand = Math.max(0, currentOnHand + diff);

        if (currentStock) {
          // If damaged stock was flagged, track in damaged column
          const damagedAdjustment = adjustment.reason === 'DAMAGE' && diff < 0 ? Math.abs(diff) : 0;

          await tx.stock.update({
            where: { id: currentStock.id },
            data: {
              onHand: newOnHand,
              damaged: currentStock.damaged + damagedAdjustment,
              available: Math.max(0, newOnHand - currentStock.reserved - (currentStock.damaged + damagedAdjustment)),
              lastCountedAt: new Date(),
            }
          });
        } else {
          await tx.stock.create({
            data: {
              productId: item.productId,
              locationId: adjustment.locationId,
              onHand: newOnHand,
              reserved: 0,
              damaged: adjustment.reason === 'DAMAGE' ? Math.abs(diff) : 0,
              available: newOnHand,
              lastCountedAt: new Date(),
            }
          });
        }

        // Immutable ledger recording
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            movementType: 'ADJUSTMENT',
            quantity: diff,
            unit: item.unit || item.product?.unit || 'unit',
            fromLocationId: diff < 0 ? adjustment.locationId : null,
            toLocationId: diff > 0 ? adjustment.locationId : null,
            referenceId: adjustment.reference,
            notes: `Physical reconciliation: ${adjustment.reason}. Counted: ${item.countedQty}, System was: ${item.systemQty}. Diff: ${diff > 0 ? '+' : ''}${diff}`,
            createdBy: userId || adjustment.responsibleUserId,
          }
        });

        // Update product last movement
        await tx.product.update({
          where: { id: item.productId },
          data: { lastMovementAt: new Date() }
        });
      }

      // Mark adjustment APPLIED
      const updatedAdjustment = await tx.adjustment.update({
        where: { id: adjustmentId },
        data: {
          status: 'APPLIED',
          appliedAt: new Date(),
        }
      });

      // Audit log
      await logAudit({
        userId,
        action: 'ADJUSTMENT_APPLIED',
        entity: 'Adjustment',
        entityId: adjustment.reference,
        metadata: { adjustmentId, reason: adjustment.reason }
      });

      return updatedAdjustment;
    });
  }

  /**
   * 5. Post-operation Trigger: recalculate system alerts & update health indices
   */
  static async onInventoryChanged() {
    try {
      await syncSystemAlerts();
    } catch (err) {
      console.warn('Alert sync error after stock change:', err.message);
    }
  }
}
