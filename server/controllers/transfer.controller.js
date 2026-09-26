import prisma from '../lib/prisma.js';
import { InventoryService } from '../services/inventory.service.js';
import { getSmartTransferSuggestions } from '../services/smartTransfer.service.js';

export async function getTransfers(req, res) {
  try {
    const transfers = await prisma.transfer.findMany({
      include: {
        sourceLocation: { include: { warehouse: true } },
        destinationLocation: { include: { warehouse: true } },
        responsibleUser: true,
        items: { include: { product: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = transfers.map(t => {
      const item = t.items[0];
      return {
        id: t.id,
        reference: t.reference,
        from: t.sourceLocation ? `${t.sourceLocation.rack} (${t.sourceLocation.zone})` : 'Dock',
        fromFull: t.sourceLocation ? `${t.sourceLocation.warehouse?.name} → ${t.sourceLocation.zone} → ${t.sourceLocation.rack}` : '',
        to: t.destinationLocation ? `${t.destinationLocation.rack} (${t.destinationLocation.zone})` : 'Rack',
        toFull: t.destinationLocation ? `${t.destinationLocation.warehouse?.name} → ${t.destinationLocation.zone} → ${t.destinationLocation.rack}` : '',
        product: item?.product?.name || 'Stock item',
        productId: item?.productId,
        quantity: item?.quantity || 0,
        unit: item?.unit || item?.product?.unit || 'unit',
        responsible: t.responsibleUser?.name || 'Staff',
        status: t.status.toLowerCase(),
        notes: t.notes,
        createdAt: t.createdAt,
        completedAt: t.completedAt,
      };
    });

    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function createTransfer(req, res) {
  try {
    const {
      sourceLocationId,
      destinationLocationId,
      productId,
      quantity,
      unit = 'unit',
      notes,
    } = req.body;

    if (!sourceLocationId || !destinationLocationId || !productId || !quantity) {
      return res.status(400).json({ success: false, message: 'Source, destination, product and quantity are required' });
    }

    const count = await prisma.transfer.count();
    const reference = `WH/INT/${String(count + 1).padStart(4, '0')}`;
    const id = `TRF${String(count + 1).padStart(2, '0')}`;

    const transfer = await prisma.transfer.create({
      data: {
        id,
        reference,
        sourceLocationId,
        destinationLocationId,
        responsibleUserId: req.user?.id || 'USR-001',
        status: 'READY',
        notes: notes || '',
        items: {
          create: [{
            productId,
            quantity: Number(quantity),
            unit,
          }]
        }
      },
      include: { items: true }
    });

    res.status(201).json({ success: true, message: 'Transfer created', data: transfer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function validateTransfer(req, res) {
  try {
    const { id } = req.params;
    const validated = await InventoryService.executeTransfer({
      transferId: id,
      userId: req.user?.name || 'Yash Rathore'
    });
    await InventoryService.onInventoryChanged();

    res.json({ success: true, message: 'Transfer completed and ledger movements logged', data: validated });
  } catch (err) {
    console.error('validateTransfer error:', err);
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function getTransferSuggestions(req, res) {
  try {
    const suggestions = await getSmartTransferSuggestions();
    res.json({ success: true, data: suggestions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function approveSuggestion(req, res) {
  try {
    const { fromLocationId, toLocationId, productId, quantity, unit } = req.body;

    const count = await prisma.transfer.count();
    const reference = `WH/INT/${String(count + 1).padStart(4, '0')}`;
    const id = `TRF${String(count + 1).padStart(2, '0')}`;

    const transfer = await prisma.transfer.create({
      data: {
        id,
        reference,
        sourceLocationId: fromLocationId,
        destinationLocationId: toLocationId,
        responsibleUserId: req.user?.id || 'USR-001',
        status: 'READY',
        notes: 'Smart Transfer suggestion approved by Manager',
        items: {
          create: [{
            productId,
            quantity: Number(quantity),
            unit: unit || 'unit',
          }]
        }
      }
    });

    // Auto-execute the approved transfer
    const executed = await InventoryService.executeTransfer({
      transferId: transfer.id,
      userId: req.user?.name || 'Manager'
    });
    await InventoryService.onInventoryChanged();

    res.json({ success: true, message: 'Smart transfer approved and executed successfully', data: executed });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
