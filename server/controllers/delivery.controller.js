import prisma from '../lib/prisma.js';
import { InventoryService } from '../services/inventory.service.js';

export async function getDeliveries(req, res) {
  try {
    const deliveries = await prisma.delivery.findMany({
      include: {
        customer: true,
        warehouse: true,
        responsibleUser: true,
        items: { include: { product: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = deliveries.map(d => ({
      id: d.id,
      reference: d.reference,
      customer: d.customer?.name || d.customerId,
      customerId: d.customerId,
      address: d.deliveryAddress,
      warehouseId: d.warehouseId,
      warehouse: d.warehouse?.name || 'Main Warehouse',
      scheduleDate: d.scheduleDate ? d.scheduleDate.toISOString().split('T')[0] : '',
      responsible: d.responsibleUser?.name || 'Staff',
      status: d.status.toLowerCase(),
      notes: d.notes || '',
      createdAt: d.createdAt,
      completedAt: d.completedAt,
      items: d.items.map(it => ({
        id: it.id,
        productId: it.productId,
        product: it.product?.name || it.productId,
        requested: it.requestedQty,
        reserved: it.reservedQty,
        picked: it.pickedQty,
        packed: it.packedQty,
        delivered: it.deliveredQty,
        unit: it.unit || it.product?.unit || 'unit',
      }))
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function getDeliveryById(req, res) {
  try {
    const { id } = req.params;
    const d = await prisma.delivery.findUnique({
      where: { id },
      include: {
        customer: true,
        warehouse: true,
        responsibleUser: true,
        items: { include: { product: true } }
      }
    });

    if (!d) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }

    res.json({
      success: true,
      data: {
        id: d.id,
        reference: d.reference,
        customer: d.customer?.name,
        customerId: d.customerId,
        address: d.deliveryAddress,
        warehouseId: d.warehouseId,
        warehouse: d.warehouse?.name,
        scheduleDate: d.scheduleDate ? d.scheduleDate.toISOString().split('T')[0] : '',
        responsible: d.responsibleUser?.name,
        status: d.status.toLowerCase(),
        notes: d.notes,
        createdAt: d.createdAt,
        completedAt: d.completedAt,
        items: d.items.map(it => ({
          id: it.id,
          productId: it.productId,
          product: it.product?.name || it.productId,
          requested: it.requestedQty,
          reserved: it.reservedQty,
          picked: it.pickedQty,
          packed: it.packedQty,
          delivered: it.deliveredQty,
          unit: it.unit,
        }))
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function createDelivery(req, res) {
  try {
    const {
      customerId,
      deliveryAddress,
      warehouseId = 'WH01',
      scheduleDate,
      notes,
      items = [],
    } = req.body;

    const count = await prisma.delivery.count();
    const reference = `WH/OUT/${String(count + 1).padStart(4, '0')}`;
    const id = `DEL${String(count + 1).padStart(2, '0')}`;

    const delivery = await prisma.delivery.create({
      data: {
        id,
        reference,
        customerId: customerId || 'CUS01',
        deliveryAddress: deliveryAddress || 'Customer Site Delivery Location',
        warehouseId,
        scheduleDate: scheduleDate ? new Date(scheduleDate) : new Date(),
        responsibleUserId: req.user?.id || 'USR-001',
        status: 'READY',
        notes: notes || '',
        items: {
          create: items.map(it => ({
            productId: it.productId,
            requestedQty: Number(it.requestedQty || it.requested || 10),
            reservedQty: Number(it.requestedQty || it.requested || 10),
            pickedQty: 0,
            packedQty: 0,
            deliveredQty: 0,
            unit: it.unit || 'unit',
          }))
        }
      },
      include: { items: true }
    });

    res.status(201).json({ success: true, message: 'Delivery order created', data: delivery });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function validateDelivery(req, res) {
  try {
    const { id } = req.params;
    const validated = await InventoryService.validateDelivery({
      deliveryId: id,
      userId: req.user?.name || 'Yash Rathore'
    });
    await InventoryService.onInventoryChanged();

    res.json({ success: true, message: 'Delivery fulfilled and inventory deducted successfully', data: validated });
  } catch (err) {
    console.error('validateDelivery error:', err);
    res.status(400).json({
      success: false,
      message: err.message,
      code: err.code || 'DELIVERY_ERROR',
      shortage: err.shortage || 0,
    });
  }
}
