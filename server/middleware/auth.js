import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';

const JWT_SECRET = process.env.JWT_SECRET || 'inventra_jwt_super_secret_key_2026_enterprise';

export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // In development, if no token, allow default admin or return 401
      return res.status(401).json({ success: false, message: 'Authorization token required', code: 'UNAUTHORIZED' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { role: true },
    });

    if (!user || user.status !== 'active') {
      return res.status(401).json({ success: false, message: 'User not active or session expired', code: 'UNAUTHORIZED' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token', code: 'INVALID_TOKEN' });
  }
}

export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    const userRole = req.user.roleId || req.user.role?.id;
    if (!allowedRoles.includes(userRole) && userRole !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Forbidden: Insufficient permissions', code: 'FORBIDDEN' });
    }
    next();
  };
}

export { JWT_SECRET };
