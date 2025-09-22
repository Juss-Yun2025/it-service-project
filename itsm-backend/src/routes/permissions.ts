import express from 'express';
import {
  getUserPermissions,
  getUserRoles,
  checkPermission,
  assignRole,
  removeRole,
  getAllRoles,
  getAllPermissions
} from '../controllers/permissionController';

const router = express.Router();

// 사용자 권한 조회
router.get('/user/:userId', getUserPermissions);

// 사용자 역할 조회
router.get('/user/:userId/roles', getUserRoles);

// 특정 권한 확인
router.get('/check/:userId/:resource/:action', checkPermission);

// 사용자에게 역할 할당
router.post('/assign-role', assignRole);

// 사용자에서 역할 제거
router.delete('/remove-role', removeRole);

// 모든 역할 목록 조회
router.get('/roles', getAllRoles);

// 모든 권한 목록 조회
router.get('/permissions', getAllPermissions);

export default router;
