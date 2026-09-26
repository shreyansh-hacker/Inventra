import { Router } from 'express';
import {
  getDashboardSummary,
  getDashboardHealth,
  getDashboardAlerts,
  getDashboardMovements,
  getDashboardLocationHealth
} from '../controllers/dashboard.controller.js';

const router = Router();

router.get('/summary', getDashboardSummary);
router.get('/health', getDashboardHealth);
router.get('/alerts', getDashboardAlerts);
router.get('/movements', getDashboardMovements);
router.get('/location-health', getDashboardLocationHealth);

export default router;
