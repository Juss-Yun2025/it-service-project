import { Request, Response, NextFunction } from 'express';
import { db } from '../config/database';

// 권한 검증 미들웨어
export const requirePermission = (resource: string, action: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // JWT 토큰에서 사용자 ID 추출 (auth 미들웨어에서 설정됨)
      const userId = (req as any).user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '인증이 필요합니다.'
        });
      }

      // 사용자의 권한 확인
      const query = `
        SELECT COUNT(*) as count
        FROM permissions p
        JOIN role_permissions rp ON p.id = rp.permission_id
        JOIN user_roles ur ON rp.role_id = ur.role_id
        WHERE ur.user_id = $1 
          AND p.resource = $2 
          AND p.action = $3 
          AND p.is_active = true
      `;
      
      const result = await db.query(query, [userId, resource, action]);
      const hasPermission = parseInt(result.rows[0].count) > 0;
      
      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: '해당 작업을 수행할 권한이 없습니다.'
        });
      }
      
      next();
    } catch (error) {
      console.error('권한 검증 오류:', error);
      res.status(500).json({
        success: false,
        message: '권한 검증에 실패했습니다.'
      });
    }
  };
};

// 역할 검증 미들웨어
export const requireRole = (roleName: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '인증이 필요합니다.'
        });
      }

      // 사용자의 역할 확인
      const query = `
        SELECT COUNT(*) as count
        FROM roles r
        JOIN user_roles ur ON r.id = ur.role_id
        WHERE ur.user_id = $1 
          AND r.name = $2 
          AND r.is_active = true
      `;
      
      const result = await db.query(query, [userId, roleName]);
      const hasRole = parseInt(result.rows[0].count) > 0;
      
      if (!hasRole) {
        return res.status(403).json({
          success: false,
          message: `${roleName} 권한이 필요합니다.`
        });
      }
      
      next();
    } catch (error) {
      console.error('역할 검증 오류:', error);
      res.status(500).json({
        success: false,
        message: '역할 검증에 실패했습니다.'
      });
    }
  };
};

// 시스템관리자 권한 검증
export const requireSystemAdmin = requireRole('시스템관리자');

// 관리매니저 권한 검증
export const requireManager = requireRole('관리매니저');

// 배정담당자 권한 검증
export const requireAssigner = requireRole('배정담당자');

// 조치담당자 권한 검증
export const requireTechnician = requireRole('조치담당자');
