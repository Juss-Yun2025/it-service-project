import { Request, Response } from 'express';
import { db } from '../config/database';

// 사용자의 권한 조회
export const getUserPermissions = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const query = `
      SELECT DISTINCT p.name, p.resource, p.action, p.description
      FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      JOIN user_roles ur ON rp.role_id = ur.role_id
      WHERE ur.user_id = $1 AND p.is_active = true
      ORDER BY p.resource, p.action
    `;
    
    const result = await db.query(query, [userId]);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('사용자 권한 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '사용자 권한을 조회하는데 실패했습니다.'
    });
  }
};

// 사용자의 역할 조회
export const getUserRoles = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const query = `
      SELECT r.id, r.name, r.description
      FROM roles r
      JOIN user_roles ur ON r.id = ur.role_id
      WHERE ur.user_id = $1 AND r.is_active = true
      ORDER BY r.name
    `;
    
    const result = await db.query(query, [userId]);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('사용자 역할 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '사용자 역할을 조회하는데 실패했습니다.'
    });
  }
};

// 특정 권한 확인
export const checkPermission = async (req: Request, res: Response) => {
  try {
    const { userId, resource, action } = req.params;
    
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
    
    res.json({
      success: true,
      hasPermission
    });
  } catch (error) {
    console.error('권한 확인 오류:', error);
    res.status(500).json({
      success: false,
      message: '권한 확인에 실패했습니다.'
    });
  }
};

// 사용자에게 역할 할당
export const assignRole = async (req: Request, res: Response) => {
  try {
    const { userId, roleId } = req.body;
    
    const query = `
      INSERT INTO user_roles (user_id, role_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, role_id) DO NOTHING
      RETURNING id
    `;
    
    const result = await db.query(query, [userId, roleId]);
    
    res.json({
      success: true,
      message: '역할이 성공적으로 할당되었습니다.',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('역할 할당 오류:', error);
    res.status(500).json({
      success: false,
      message: '역할 할당에 실패했습니다.'
    });
  }
};

// 사용자에서 역할 제거
export const removeRole = async (req: Request, res: Response) => {
  try {
    const { userId, roleId } = req.body;
    
    const query = `
      DELETE FROM user_roles
      WHERE user_id = $1 AND role_id = $2
    `;
    
    await db.query(query, [userId, roleId]);
    
    res.json({
      success: true,
      message: '역할이 성공적으로 제거되었습니다.'
    });
  } catch (error) {
    console.error('역할 제거 오류:', error);
    res.status(500).json({
      success: false,
      message: '역할 제거에 실패했습니다.'
    });
  }
};

// 모든 역할 목록 조회
export const getAllRoles = async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT id, name, description, is_active, created_at, updated_at
      FROM roles
      WHERE is_active = true
      ORDER BY name
    `;
    
    const result = await db.query(query);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('역할 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '역할 목록을 조회하는데 실패했습니다.'
    });
  }
};

// 모든 권한 목록 조회
export const getAllPermissions = async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT id, name, description, resource, action, is_active, created_at, updated_at
      FROM permissions
      WHERE is_active = true
      ORDER BY resource, action
    `;
    
    const result = await db.query(query);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('권한 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '권한 목록을 조회하는데 실패했습니다.'
    });
  }
};
