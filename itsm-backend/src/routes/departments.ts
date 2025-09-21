import express from 'express';
import { 
  getAllDepartments, 
  getDepartmentById, 
  createDepartment, 
  updateDepartment, 
  deleteDepartment 
} from '../controllers/departmentController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// 모든 라우트에 인증 미들웨어 적용
router.use(authenticateToken);

// 부서 목록 조회
router.get('/', getAllDepartments);

// 특정 부서 조회
router.get('/:id', getDepartmentById);

// 새 부서 생성
router.post('/', createDepartment);

// 부서 수정
router.put('/:id', updateDepartment);

// 부서 삭제 (비활성화)
router.delete('/:id', deleteDepartment);

export default router;
