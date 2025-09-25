import { Request, Response } from 'express';
import { db } from '../config/database';

// 모든 단계 조회
export const getStages = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await db.query(`
      SELECT id, name, description, created_at, updated_at
      FROM stages
      ORDER BY id ASC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('단계 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '단계 조회 중 오류가 발생했습니다.'
    });
  }
};

// 특정 단계 조회
export const getStage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const result = await db.query(`
      SELECT id, name, description, created_at, updated_at
      FROM stages
      WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: '단계를 찾을 수 없습니다.'
      });
      return;
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('단계 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '단계 조회 중 오류가 발생했습니다.'
    });
  }
};

// 새 단계 생성
export const createStage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, sort_order } = req.body;

    if (!name) {
      res.status(400).json({
        success: false,
        error: '단계명은 필수입니다.'
      });
      return;
    }

    const result = await db.query(`
      INSERT INTO stages (name, description, created_at, updated_at)
      VALUES ($1, $2, NOW(), NOW())
      RETURNING id, name, description, created_at, updated_at
    `, [name, description || null]);

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('단계 생성 오류:', error);
    res.status(500).json({
      success: false,
      error: '단계 생성 중 오류가 발생했습니다.'
    });
  }
};

// 단계 수정
export const updateStage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, sort_order } = req.body;

    const result = await db.query(`
      UPDATE stages 
      SET name = COALESCE($1, name),
          description = COALESCE($2, description),
          updated_at = NOW()
      WHERE id = $3
      RETURNING id, name, description, created_at, updated_at
    `, [name, description, id]);

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: '단계를 찾을 수 없습니다.'
      });
      return;
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('단계 수정 오류:', error);
    res.status(500).json({
      success: false,
      error: '단계 수정 중 오류가 발생했습니다.'
    });
  }
};

// 단계 삭제
export const deleteStage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await db.query(`
      DELETE FROM stages 
      WHERE id = $1
      RETURNING id, name
    `, [id]);

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: '단계를 찾을 수 없습니다.'
      });
      return;
    }

    res.json({
      success: true,
      message: '단계가 삭제되었습니다.'
    });
  } catch (error) {
    console.error('단계 삭제 오류:', error);
    res.status(500).json({
      success: false,
      error: '단계 삭제 중 오류가 발생했습니다.'
    });
  }
};
