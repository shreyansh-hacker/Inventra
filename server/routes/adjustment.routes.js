import { Router } from 'express';
import { getAdjustments, createAdjustment, applyAdjustment } from '../controllers/adjustment.controller.js';

const router = Router();

router.get('/', getAdjustments);
router.post('/', createAdjustment);
router.post('/:id/apply', applyAdjustment);

export default router;
