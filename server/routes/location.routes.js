import { Router } from 'express';
import { getWarehouses, getInventoryMap } from '../controllers/location.controller.js';

const router = Router();

router.get('/warehouses', getWarehouses);
router.get('/inventory-map', getInventoryMap);

export default router;
