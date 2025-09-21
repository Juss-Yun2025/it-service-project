import express from 'express';
import {
  getAllCurrentStatuses,
  getCurrentStatusById,
  createCurrentStatus,
  updateCurrentStatus,
  deleteCurrentStatus
} from '../controllers/currentStatusController';

const router = express.Router();

// 모든 현재상태 조회
router.get('/', getAllCurrentStatuses);

// 특정 현재상태 조회
router.get('/:id', getCurrentStatusById);

// 새 현재상태 생성
router.post('/', createCurrentStatus);

// 현재상태 수정
router.put('/:id', updateCurrentStatus);

// 현재상태 삭제
router.delete('/:id', deleteCurrentStatus);

export default router;
