import express from 'express';
import { 
  getFAQIcons, 
  getFAQIconCategories, 
  createFAQIcon, 
  updateFAQIcon, 
  deleteFAQIcon 
} from '../controllers/faqIconController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', getFAQIcons);
router.get('/categories', getFAQIconCategories);

// Admin only routes
router.post('/', authenticateToken, requireAdmin, createFAQIcon);
router.put('/:id', authenticateToken, requireAdmin, updateFAQIcon);
router.delete('/:id', authenticateToken, requireAdmin, deleteFAQIcon);

export default router;