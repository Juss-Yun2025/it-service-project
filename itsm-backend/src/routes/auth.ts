import express from 'express';
import { login, register, getProfile, updateProfile } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { validateLogin, validateRegister, validateRequired } from '../middleware/validation';

const router = express.Router();

// Public routes
router.post('/login', validateLogin, login);
router.post('/register', validateRegister, register);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, validateRequired(['name', 'department', 'position']), updateProfile);

export default router;
