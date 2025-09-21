import express from 'express';
import {
  getAllServiceRequests,
  getServiceRequestById,
  createServiceRequest,
  updateServiceRequest,
  deleteServiceRequest
} from '../controllers/serviceRequestController';

const router = express.Router();

// 모든 서비스 요청 조회 (페이지네이션 지원)
router.get('/', getAllServiceRequests);

// 특정 서비스 요청 조회
router.get('/:id', getServiceRequestById);

// 서비스 요청 생성
router.post('/', createServiceRequest);

// 서비스 요청 수정
router.put('/:id', updateServiceRequest);

// 서비스 요청 삭제
router.delete('/:id', deleteServiceRequest);

export default router;
