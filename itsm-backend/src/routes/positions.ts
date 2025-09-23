import express from 'express';
import { getAllPositions, getPositionById, createPosition, updatePosition, deletePosition } from '../controllers/positionController';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { validateRequired } from '../middleware/validation';

const router = express.Router();

// 모든 직급 조회 (인증 필요)
router.get('/', authenticateToken, getAllPositions);

// 특정 직급 조회 (인증 필요)
router.get('/:id', authenticateToken, getPositionById);

// 새 직급 생성 (관리자만)
router.post('/', authenticateToken, requireAdmin, validateRequired(['name']), createPosition);

// 직급 수정 (관리자만)
router.put('/:id', authenticateToken, requireAdmin, validateRequired(['name']), updatePosition);

// 직급 삭제 (관리자만)
router.delete('/:id', authenticateToken, requireAdmin, deletePosition);

export default router;
