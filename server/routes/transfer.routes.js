import { Router } from 'express';
import {
  getTransfers,
  createTransfer,
  validateTransfer,
  getTransferSuggestions,
  approveSuggestion
} from '../controllers/transfer.controller.js';

const router = Router();

router.get('/', getTransfers);
router.post('/', createTransfer);
router.post('/:id/validate', validateTransfer);
router.get('/suggestions', getTransferSuggestions);
router.post('/suggestions/approve', approveSuggestion);

export default router;
