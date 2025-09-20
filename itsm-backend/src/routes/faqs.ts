import express from 'express';
import { 
  getFAQs, 
  getFAQById, 
  createFAQ, 
  updateFAQ, 
  deleteFAQ,
  getFAQCategories,
  getPopularFAQs
} from '../controllers/faqController';
import { authenticateToken, requireManager } from '../middleware/auth';
import { validateRequired } from '../middleware/validation';

const router = express.Router();

// All FAQ routes require authentication
router.use(authenticateToken);

// Public FAQ routes (for all authenticated users)
router.get('/', getFAQs);
router.get('/categories', getFAQCategories);
router.get('/popular', getPopularFAQs);
router.get('/:id', getFAQById);

// Management routes (require manager role or above)
router.post('/', requireManager, validateRequired(['question', 'answer']), createFAQ);
router.put('/:id', requireManager, updateFAQ);
router.delete('/:id', requireManager, deleteFAQ);

export default router;
