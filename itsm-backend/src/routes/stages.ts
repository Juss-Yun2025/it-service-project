import express from 'express';
import {
  getAllStages,
  getStageById,
  createStage,
  updateStage,
  deleteStage,
  getProgressByStageName,
  getNextStage
} from '../controllers/stageController';

const router = express.Router();

// 모든 단계 조회
router.get('/', getAllStages);

// 특정 단계 조회
router.get('/:id', getStageById);

// 새 단계 생성
router.post('/', createStage);

// 단계 수정
router.put('/:id', updateStage);

// 단계 삭제
router.delete('/:id', deleteStage);

// 단계명으로 진행명 조회
router.get('/progress/:stageName', getProgressByStageName);

// 다음 단계 조회
router.get('/next/:currentStageId', getNextStage);

export default router;
