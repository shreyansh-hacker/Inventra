import { Router } from 'express';
import { getStockLedger, getMoveHistory } from '../controllers/ledger.controller.js';

const router = Router();

router.get('/ledger', getStockLedger);
router.get('/movements', getMoveHistory);

export default router;
