import prisma from '../lib/prisma.js';
import { syncSystemAlerts } from '../services/alert.service.js';

export async function getAlerts(req, res) {
  try {
    const { type, severity, status } = req.query;

    // Refresh active alerts from live inventory state
    await syncSystemAlerts();

    const where = {};
    if (type && type !== 'all') where.type = type.toUpperCase();
    if (severity && severity !== 'all') where.severity = severity.toUpperCase();
    if (status === 'resolved') where.isResolved = true;
    else where.isResolved = false;

    const alerts = await prisma.alert.findMany({
      where,
      include: {
        product: true,
        location: { include: { warehouse: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = alerts.map(a => ({
      id: a.id,
      type: a.severity.toLowerCase(), // critical, warning, info
      alertType: a.type,
      title: a.message,
      desc: a.reason,
      product: a.product?.name,
      productId: a.productId,
      location: a.location ? `${a.location.warehouse?.shortCode} / ${a.location.rack}` : 'Warehouse',
      time: a.createdAt,
      action: a.recommendedAction,
      isResolved: a.isResolved,
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function resolveAlert(req, res) {
  try {
    const { id } = req.params;

    const alert = await prisma.alert.update({
      where: { id },
      data: {
        isResolved: true,
        status: 'RESOLVED',
        resolvedAt: new Date(),
      }
    });

    res.json({ success: true, message: 'Alert marked as resolved', data: alert });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
