import { Router } from 'express';
import { getReceipts, getReceiptById, createReceipt, validateReceipt } from '../controllers/receipt.controller.js';

const router = Router();

router.get('/', getReceipts);
router.get('/:id', getReceiptById);
router.post('/', createReceipt);
router.post('/:id/validate', validateReceipt);

export default router;
