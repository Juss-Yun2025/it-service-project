import express from 'express';
import { 
  getServiceReport, 
  getServiceStatistics, 
  getInquiryStatistics,
  getDashboardData
} from '../controllers/reportController';
import { authenticateToken, requireManager } from '../middleware/auth';

const router = express.Router();

// All report routes require authentication
router.use(authenticateToken);

// Dashboard data (for all authenticated users)
router.get('/dashboard', getDashboardData);

// Service report (requires manager role or above)
router.get('/service', requireManager, getServiceReport);

// Statistics (requires manager role or above)
router.get('/service-statistics', requireManager, getServiceStatistics);
router.get('/inquiry-statistics', requireManager, getInquiryStatistics);

export default router;
