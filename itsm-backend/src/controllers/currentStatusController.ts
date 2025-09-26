import { Request, Response } from 'express';
import { db } from '../config/database';

// 모든 현재상태 조회
export const getAllCurrentStatuses = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await db.query(
      'SELECT id, name, description, color, is_active, created_at, updated_at FROM current_statuses WHERE is_active = true ORDER BY id'
    );
    
    // 색상 정보가 없는 경우 기본 색상 매핑 적용
    const statusesWithColors = result.rows.map(status => {
      if (!status.color) {
        // 기본 색상 매핑 (설정 가능)
        const defaultColors: {[key: string]: string} = {
          '정상작동': 'bg-green-100 text-green-800',
          '오류발생': 'bg-red-100 text-red-800',
          '메시지창': 'bg-blue-100 text-blue-800',
          '부분불능': 'bg-yellow-100 text-yellow-800',
          '전체불능': 'bg-red-200 text-red-900',
          '점검요청': 'bg-purple-100 text-purple-800',
          '기타상태': 'bg-gray-100 text-gray-800'
        };
        
        status.color = defaultColors[status.name] || 'bg-gray-100 text-gray-800';
      }
      
      return status;
    });
    
    res.json({
      success: true,
      data: statusesWithColors
    });
    return;
  } catch (error) {
    console.error('Error fetching current statuses:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch current statuses'
    });
    return;
  }
};

// 특정 현재상태 조회
export const getCurrentStatusById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const result = await db.query(
      'SELECT * FROM current_statuses WHERE id = $1 AND is_active = true',
      [id]
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Current status not found'
      });
      return;
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
    return;
  } catch (error) {
    console.error('Error fetching current status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch current status'
    });
    return;
  }
};

// 새 현재상태 생성
export const createCurrentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, color } = req.body;
    
    if (!name) {
      res.status(400).json({
        success: false,
        error: 'Name is required'
      });
      return;
    }
    
    const result = await db.query(
      'INSERT INTO current_statuses (name, description, color) VALUES ($1, $2, $3) RETURNING *',
      [name, description, color]
    );
    
    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
    return;
  } catch (error: any) {
    console.error('Error creating current status:', error);
    
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({
        success: false,
        error: 'Current status with this name already exists'
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to create current status'
    });
    return;
  }
};

// 현재상태 수정
export const updateCurrentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, color, is_active } = req.body;
    
    const result = await db.query(
      'UPDATE current_statuses SET name = COALESCE($1, name), description = COALESCE($2, description), color = COALESCE($3, color), is_active = COALESCE($4, is_active), updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
      [name, description, color, is_active, id]
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Current status not found'
      });
      return;
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
    return;
  } catch (error: any) {
    console.error('Error updating current status:', error);
    
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({
        success: false,
        error: 'Current status with this name already exists'
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to update current status'
    });
    return;
  }
};

// 현재상태 삭제 (소프트 삭제)
export const deleteCurrentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const result = await db.query(
      'UPDATE current_statuses SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Current status not found'
      });
      return;
    }
    
    res.json({
      success: true,
      message: 'Current status deleted successfully'
    });
    return;
  } catch (error) {
    console.error('Error deleting current status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete current status'
    });
    return;
  }
};
