import { Router } from 'express';
import { getDeliveries, getDeliveryById, createDelivery, validateDelivery } from '../controllers/delivery.controller.js';

const router = Router();

router.get('/', getDeliveries);
router.get('/:id', getDeliveryById);
router.post('/', createDelivery);
router.post('/:id/validate', validateDelivery);

export default router;
