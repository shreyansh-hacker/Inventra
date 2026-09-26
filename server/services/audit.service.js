import prisma from '../lib/prisma.js';

export async function logAudit({ userId, action, entity, entityId, metadata = null, ipAddress = null }) {
  try {
    return await prisma.auditLog.create({
      data: {
        userId: userId || null,
        action,
        entity,
        entityId: String(entityId),
        metadata: metadata ? JSON.stringify(metadata) : null,
        ipAddress: ipAddress || null,
      },
    });
  } catch (err) {
    console.error('Audit log error:', err.message);
  }
}
