import prisma from '../lib/prisma.js';
import { calculateProductHealth } from '../services/health.service.js';
import { StockService } from '../services/stock.service.js';
import { logAudit } from '../services/audit.service.js';

export async function getProducts(req, res) {
  try {
    const { category, warehouse, health, search } = req.query;

    const where = { status: 'active' };

    if (category && category !== 'All') {
      where.categoryId = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
        { barcode: { contains: search } }
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        supplier: true,
        stock: {
          include: {
            location: {
              include: { warehouse: true }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    const evaluated = await Promise.all(
      products.map(async (p) => {
        const healthDetails = await calculateProductHealth(p.id, p);

        // Location text summary
        const primaryStock = p.stock[0];
        const locationText = primaryStock?.location
          ? `${primaryStock.location.warehouse?.shortCode} / ${primaryStock.location.zone} / ${primaryStock.location.rack}`
          : 'Central Storage';

        return {
          id: p.id,
          name: p.name,
          sku: p.sku,
          barcode: p.barcode,
          category: p.category?.name || p.categoryId,
          categoryId: p.categoryId,
          unit: p.unit,
          cost: Number(p.cost),
          sellingPrice: Number(p.sellingPrice),
          minStock: p.minStock,
          maxStock: p.maxStock,
          reorderPoint: p.reorderPoint,
          supplier: p.supplier?.name || p.supplierId,
          supplierId: p.supplierId,
          onHand: healthDetails.totalOnHand,
          reserved: healthDetails.totalReserved,
          available: healthDetails.totalAvailable,
          damaged: healthDetails.totalDamaged,
          location: locationText,
          warehouseId: primaryStock?.location?.warehouseId || 'WH01',
          health: healthDetails.health.toLowerCase(),
          healthReason: healthDetails.reason,
          recommendedAction: healthDetails.recommendedAction,
          status: p.status,
          lastMovement: p.lastMovementAt || p.updatedAt,
        };
      })
    );

    // Filter by health status if requested
    let result = evaluated;
    if (health && health !== 'all') {
      result = evaluated.filter(p => p.health === health.toLowerCase());
    }

    // Filter by warehouse if requested
    if (warehouse && warehouse !== 'All') {
      result = result.filter(p => p.warehouseId === warehouse);
    }

    res.json({ success: true, data: result });
  } catch (err) {
    console.error('getProducts error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function getProductById(req, res) {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        supplier: true,
        stock: {
          include: {
            location: {
              include: { warehouse: true }
            }
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found', code: 'PRODUCT_NOT_FOUND' });
    }

    const healthDetails = await calculateProductHealth(product.id, product);
    const journey = await StockService.getProductJourney(product.id);

    const primaryStock = product.stock[0];
    const locationText = primaryStock?.location
      ? `${primaryStock.location.warehouse?.shortCode} / ${primaryStock.location.zone} / ${primaryStock.location.rack}`
      : 'Central Storage';

    res.json({
      success: true,
      data: {
        id: product.id,
        name: product.name,
        sku: product.sku,
        barcode: product.barcode,
        category: product.category?.name || product.categoryId,
        categoryId: product.categoryId,
        unit: product.unit,
        cost: Number(product.cost),
        sellingPrice: Number(product.sellingPrice),
        minStock: product.minStock,
        maxStock: product.maxStock,
        reorderPoint: product.reorderPoint,
        supplier: product.supplier?.name || product.supplierId,
        supplierId: product.supplierId,
        onHand: healthDetails.totalOnHand,
        reserved: healthDetails.totalReserved,
        available: healthDetails.totalAvailable,
        damaged: healthDetails.totalDamaged,
        location: locationText,
        warehouseId: primaryStock?.location?.warehouseId || 'WH01',
        health: healthDetails.health.toLowerCase(),
        healthReason: healthDetails.reason,
        recommendedAction: healthDetails.recommendedAction,
        status: product.status,
        lastMovement: product.lastMovementAt || product.updatedAt,
        locations: product.stock.map(s => ({
          locationId: s.locationId,
          warehouseName: s.location?.warehouse?.name,
          warehouseCode: s.location?.warehouse?.shortCode,
          zone: s.location?.zone,
          rack: s.location?.rack,
          shelf: s.location?.shelf,
          bin: s.location?.bin,
          code: s.location?.code,
          onHand: s.onHand,
          available: s.available,
          reserved: s.reserved,
          damaged: s.damaged,
        })),
        journey,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function createProduct(req, res) {
  try {
    const {
      name,
      sku,
      barcode,
      categoryId,
      unit = 'unit',
      initialStock = 0,
      cost = 0,
      sellingPrice = 0,
      reorderPoint = 20,
      minStock = 10,
      maxStock = 500,
      supplierId,
      defaultWarehouseId = 'WH01',
    } = req.body;

    if (!name || !sku) {
      return res.status(400).json({ success: false, message: 'Name and SKU are required' });
    }

    // Check SKU collision
    const existing = await prisma.product.findUnique({ where: { sku: sku.trim() } });
    if (existing) {
      return res.status(409).json({ success: false, message: `Product with SKU ${sku} already exists`, code: 'DUPLICATE_SKU' });
    }

    // Auto-generate barcode if missing
    const generatedBarcode = barcode || '890' + Math.floor(1000000000 + Math.random() * 9000000000);
    const newId = 'PRD' + Math.floor(10 + Math.random() * 90);

    const product = await prisma.$transaction(async (tx) => {
      // Find default location for default warehouse
      const location = await tx.location.findFirst({
        where: { warehouseId: defaultWarehouseId }
      });

      const created = await tx.product.create({
        data: {
          id: newId,
          name: name.trim(),
          sku: sku.trim(),
          barcode: generatedBarcode,
          categoryId: categoryId || 'CAT01',
          unit,
          initialStock: Number(initialStock) || 0,
          cost: Number(cost),
          sellingPrice: Number(sellingPrice),
          reorderPoint: Number(reorderPoint),
          minStock: Number(minStock),
          maxStock: Number(maxStock),
          supplierId: supplierId || 'SUP01',
          defaultWarehouseId,
          defaultLocationId: location?.id || null,
          status: 'active',
        }
      });

      // If initial stock was provided, create initial stock record and ledger entry
      if (initialStock > 0 && location) {
        await tx.stock.create({
          data: {
            productId: created.id,
            locationId: location.id,
            onHand: Number(initialStock),
            available: Number(initialStock),
            reserved: 0,
            damaged: 0,
            lastCountedAt: new Date(),
          }
        });

        await tx.stockMovement.create({
          data: {
            productId: created.id,
            movementType: 'RECEIPT',
            quantity: Number(initialStock),
            unit,
            fromLocationId: null,
            toLocationId: location.id,
            referenceId: 'INITIAL-STOCK',
            notes: 'Initial inventory onboard registration',
            createdBy: req.user?.name || 'Admin',
          }
        });
      }

      return created;
    });

    await logAudit({
      userId: req.user?.id,
      action: 'PRODUCT_CREATED',
      entity: 'Product',
      entityId: product.id,
      metadata: { name: product.name, sku: product.sku, initialStock }
    });

    res.status(201).json({ success: true, message: 'Product created successfully', data: product });
  } catch (err) {
    console.error('createProduct error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const data = req.body;

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        cost: data.cost !== undefined ? Number(data.cost) : undefined,
        sellingPrice: data.sellingPrice !== undefined ? Number(data.sellingPrice) : undefined,
        reorderPoint: data.reorderPoint !== undefined ? Number(data.reorderPoint) : undefined,
        minStock: data.minStock !== undefined ? Number(data.minStock) : undefined,
        maxStock: data.maxStock !== undefined ? Number(data.maxStock) : undefined,
        categoryId: data.categoryId,
        supplierId: data.supplierId,
      }
    });

    await logAudit({
      userId: req.user?.id,
      action: 'PRODUCT_UPDATED',
      entity: 'Product',
      entityId: id,
      metadata: data
    });

    res.json({ success: true, message: 'Product updated successfully', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function deleteProduct(req, res) {
  try {
    const { id } = req.params;

    // Check if product has historical transactions
    const movementsCount = await prisma.stockMovement.count({
      where: { productId: id }
    });

    if (movementsCount > 0) {
      // Soft-archive to preserve immutable ledger integrity
      await prisma.product.update({
        where: { id },
        data: { status: 'archived' }
      });
      return res.json({ success: true, message: 'Product has historical ledger movements and was archived safely.', archived: true });
    }

    await prisma.product.delete({ where: { id } });
    res.json({ success: true, message: 'Product removed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
