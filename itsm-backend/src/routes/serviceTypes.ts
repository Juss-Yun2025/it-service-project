import express from 'express';
import { 
  getAllServiceTypes, 
  getServiceTypeById, 
  createServiceType, 
  updateServiceType, 
  deleteServiceType 
} from '../controllers/serviceTypeController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// 모든 라우트에 인증 미들웨어 적용
router.use(authenticateToken);

// 서비스 유형 목록 조회
router.get('/', getAllServiceTypes);

// 서비스 유형 ID로 조회
router.get('/:id', getServiceTypeById);

// 서비스 유형 생성 (관리자만)
router.post('/', createServiceType);

// 서비스 유형 수정 (관리자만)
router.put('/:id', updateServiceType);

// 서비스 유형 삭제 (관리자만)
router.delete('/:id', deleteServiceType);

export default router;
