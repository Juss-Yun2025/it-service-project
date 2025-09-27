import express from 'express';
import { 
  createGeneralInquiry, 
  getGeneralInquiries, 
  getGeneralInquiryById, 
  updateGeneralInquiry, 
  answerGeneralInquiry,
  updateGeneralInquiryAnswer,
  deleteGeneralInquiry 
} from '../controllers/inquiryController';
import { authenticateToken, requireTechnician } from '../middleware/auth';
import { validateRequired } from '../middleware/validation';

const router = express.Router();

// All inquiry routes require authentication
router.use(authenticateToken);

// General inquiries
router.post('/', validateRequired(['title', 'content']), createGeneralInquiry);
router.get('/', getGeneralInquiries);
router.get('/:id', getGeneralInquiryById);
router.put('/:id', updateGeneralInquiry);
router.delete('/:id', deleteGeneralInquiry);

// Answer inquiry (requires technician role or above)
router.post('/:id/answer', requireTechnician, validateRequired(['answer_content']), answerGeneralInquiry);

// Update inquiry answer (requires technician role or above)
router.put('/:id/answer', requireTechnician, validateRequired(['answer_content']), updateGeneralInquiryAnswer);

export default router;
