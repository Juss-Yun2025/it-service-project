import { Request, Response } from 'express';
import { db } from '../config/database';

// 모든 단계 조회
export const getAllStages = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await db.query(
      'SELECT * FROM stages WHERE is_active = true ORDER BY id'
    );
    
    res.json({
      success: true,
      data: result.rows
    });
    return;
  } catch (error) {
    console.error('Error fetching stages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stages'
    });
    return;
  }
};

// 특정 단계 조회
export const getStageById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const result = await db.query(
      'SELECT * FROM stages WHERE id = $1 AND is_active = true',
      [id]
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Stage not found'
      });
      return;
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
    return;
  } catch (error) {
    console.error('Error fetching stage:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stage'
    });
    return;
  }
};

// 새 단계 생성
export const createStage = async (req: Request, res: Response): Promise<void> => {
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
      'INSERT INTO stages (name, description, color) VALUES ($1, $2, $3) RETURNING *',
      [name, description, color]
    );
    
    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
    return;
  } catch (error: any) {
    console.error('Error creating stage:', error);
    
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({
        success: false,
        error: 'Stage with this name already exists'
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to create stage'
    });
    return;
  }
};

// 단계 수정
export const updateStage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, color, is_active } = req.body;
    
    const result = await db.query(
      'UPDATE stages SET name = COALESCE($1, name), description = COALESCE($2, description), color = COALESCE($3, color), is_active = COALESCE($4, is_active), updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
      [name, description, color, is_active, id]
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Stage not found'
      });
      return;
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
    return;
  } catch (error: any) {
    console.error('Error updating stage:', error);
    
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({
        success: false,
        error: 'Stage with this name already exists'
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to update stage'
    });
    return;
  }
};

// 단계 삭제 (소프트 삭제)
export const deleteStage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const result = await db.query(
      'UPDATE stages SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Stage not found'
      });
      return;
    }
    
    res.json({
      success: true,
      message: 'Stage deleted successfully'
    });
    return;
  } catch (error) {
    console.error('Error deleting stage:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete stage'
    });
    return;
  }
};

// 단계명으로 진행명 조회
export const getProgressByStageName = async (req: Request, res: Response): Promise<void> => {
  try {
    const { stageName } = req.params;
    
    const result = await db.query(
      'SELECT progress_name FROM stages WHERE name = $1 AND is_active = true',
      [stageName]
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Stage not found'
      });
      return;
    }
    
    res.json({
      success: true,
      data: result.rows[0].progress_name
    });
    return;
  } catch (error) {
    console.error('Error fetching progress by stage name:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch progress by stage name'
    });
    return;
  }
};

// 다음 단계 조회
export const getNextStage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { currentStageId } = req.params;
    
    // 현재 단계 정보 조회
    const currentStageResult = await db.query(
      'SELECT id, name FROM stages WHERE id = $1 AND is_active = true',
      [currentStageId]
    );

    if (currentStageResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Current stage not found'
      });
      return;
    }

    // 다음 단계 조회 (id가 현재 단계보다 큰 첫 번째 활성 단계)
    const nextStageResult = await db.query(
      'SELECT id, name, description, color, progress_name FROM stages WHERE id > $1 AND is_active = true ORDER BY id LIMIT 1',
      [currentStageId]
    );

    if (nextStageResult.rows.length === 0) {
      res.json({
        success: true,
        data: null,
        message: 'No next stage available'
      });
      return;
    }

    res.json({
      success: true,
      data: nextStageResult.rows[0]
    });
    return;
  } catch (error) {
    console.error('Error fetching next stage:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch next stage'
    });
    return;
  }
};