import express from 'express';
import { getStages, getStage, createStage, updateStage, deleteStage } from '../controllers/stageController';

const router = express.Router();

// GET /api/stages - 모든 단계 조회
router.get('/', getStages);

// GET /api/stages/:id - 특정 단계 조회
router.get('/:id', getStage);

// POST /api/stages - 새 단계 생성
router.post('/', createStage);

// PUT /api/stages/:id - 단계 수정
router.put('/:id', updateStage);

// DELETE /api/stages/:id - 단계 삭제
router.delete('/:id', deleteStage);

export default router;
