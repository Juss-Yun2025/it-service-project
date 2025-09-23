import express from 'express';
import { 
  createServiceRequest, 
  getServiceRequests, 
  getServiceRequestById, 
  updateServiceRequest, 
  assignServiceRequest,
} from '../controllers/serviceController';
import { authenticateToken, requireTechnician } from '../middleware/auth';
import { validateRequired } from '../middleware/validation';

const router = express.Router();

// All service routes require authentication
router.use(authenticateToken);


// Service requests
router.post('/', validateRequired(['title', 'description', 'priority', 'service_type_id']), createServiceRequest);
router.get('/', getServiceRequests);
router.get('/:id', getServiceRequestById);
router.put('/:id', updateServiceRequest);

// Assignment (requires technician role or above)
router.post('/:id/assign', requireTechnician, validateRequired(['technician_id']), assignServiceRequest);

export default router;
