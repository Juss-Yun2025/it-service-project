import express from 'express';
import { getAllUsers, getUserById, updateUser, deleteUser, resetUserPassword, changeUserPassword } from '../controllers/userController';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { validateRequired } from '../middleware/validation';

const router = express.Router();

// All user routes require authentication
router.use(authenticateToken);

// Get all users (admin only)
router.get('/', requireAdmin, getAllUsers);

// Get user by ID
router.get('/:id', getUserById);

// Update user (admin only or self-update)
router.put('/:id', (req, res, next) => {
  // 사용자가 자신의 정보를 수정하는 경우 허용
  if (req.user && req.user.id === req.params.id) {
    return next();
  }
  // 그 외의 경우 관리자 권한 필요
  return requireAdmin(req, res, next);
}, validateRequired(['name', 'department', 'position']), updateUser);

// Delete user (admin only)
router.delete('/:id', requireAdmin, deleteUser);

// Reset user password (admin only)
router.post('/:id/reset-password', requireAdmin, resetUserPassword);

// Change user password (user can change their own password)
router.post('/:id/change-password', validateRequired(['currentPassword', 'newPassword']), changeUserPassword);

export default router;
