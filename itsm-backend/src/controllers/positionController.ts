import { Request, Response } from 'express';
import { db } from '../config/database';

// 모든 직급 조회
export const getAllPositions = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = `
      SELECT id, name, description, sort_order, is_active, created_at, updated_at
      FROM positions
      WHERE is_active = true
      ORDER BY sort_order ASC, name ASC
    `;
    
    const result = await db.query(query);
    
    res.json({
      success: true,
      data: result.rows,
      message: 'Positions fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching positions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch positions'
    });
  }
};

// 특정 직급 조회
export const getPositionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT id, name, description, sort_order, is_active, created_at, updated_at
      FROM positions
      WHERE id = $1 AND is_active = true
    `;
    
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Position not found'
      });
      return;
    }
    
    res.json({
      success: true,
      data: result.rows[0],
      message: 'Position fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching position:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch position'
    });
  }
};

// 새 직급 생성
export const createPosition = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, sort_order } = req.body;
    
    const query = `
      INSERT INTO positions (name, description, sort_order)
      VALUES ($1, $2, $3)
      RETURNING id, name, description, sort_order, is_active, created_at, updated_at
    `;
    
    const result = await db.query(query, [name, description, sort_order]);
    
    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Position created successfully'
    });
  } catch (error) {
    console.error('Error creating position:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create position'
    });
  }
};

// 직급 수정
export const updatePosition = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, sort_order, is_active } = req.body;
    
    const query = `
      UPDATE positions
      SET name = $1, description = $2, sort_order = $3, is_active = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING id, name, description, sort_order, is_active, created_at, updated_at
    `;
    
    const result = await db.query(query, [name, description, sort_order, is_active, id]);
    
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Position not found'
      });
      return;
    }
    
    res.json({
      success: true,
      data: result.rows[0],
      message: 'Position updated successfully'
    });
  } catch (error) {
    console.error('Error updating position:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update position'
    });
  }
};

// 직급 삭제 (비활성화)
export const deletePosition = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const query = `
      UPDATE positions
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, name, description, sort_order, is_active, created_at, updated_at
    `;
    
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Position not found'
      });
      return;
    }
    
    res.json({
      success: true,
      data: result.rows[0],
      message: 'Position deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting position:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete position'
    });
  }
};
