import express from 'express';
import {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole
} from '../controllers/roleController';

const router = express.Router();

// 모든 역할 조회
router.get('/', getAllRoles);

// 특정 역할 조회
router.get('/:id', getRoleById);

// 새 역할 생성
router.post('/', createRole);

// 역할 수정
router.put('/:id', updateRole);

// 역할 삭제
router.delete('/:id', deleteRole);

export default router;
