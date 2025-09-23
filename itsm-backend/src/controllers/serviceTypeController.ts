import { Request, Response } from 'express';
import { db } from '../config/database';

// 모든 서비스 유형 조회
export const getAllServiceTypes = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await db.query(`
      SELECT id, name, description, color, is_active, sort_order, created_at, updated_at
      FROM service_types 
      WHERE is_active = true
      ORDER BY sort_order, name
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get service types error:', error);
    res.status(500).json({
      success: false,
      message: '서비스 유형 목록을 가져오는데 실패했습니다.'
    });
  }
};

// 서비스 유형 ID로 조회
export const getServiceTypeById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const result = await db.query(`
      SELECT id, name, description, color, is_active, sort_order, created_at, updated_at
      FROM service_types 
      WHERE id = $1 AND is_active = true
    `, [id]);

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: '서비스 유형을 찾을 수 없습니다.'
      });
      return;
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get service type error:', error);
    res.status(500).json({
      success: false,
      message: '서비스 유형 정보를 가져오는데 실패했습니다.'
    });
  }
};

// 서비스 유형 생성
export const createServiceType = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, color, sort_order } = req.body;

    if (!name) {
      res.status(400).json({
        success: false,
        message: '서비스 유형명은 필수입니다.'
      });
      return;
    }

    const result = await db.query(`
      INSERT INTO service_types (name, description, color, sort_order)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [name, description, color || 'blue', sort_order || 0]);

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create service type error:', error);
    res.status(500).json({
      success: false,
      message: '서비스 유형 생성에 실패했습니다.'
    });
  }
};

// 서비스 유형 수정
export const updateServiceType = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, color, sort_order, is_active } = req.body;

    const updateFields = [];
    const updateValues = [];
    let paramCount = 0;

    if (name !== undefined) {
      paramCount++;
      updateFields.push(`name = $${paramCount}`);
      updateValues.push(name);
    }

    if (description !== undefined) {
      paramCount++;
      updateFields.push(`description = $${paramCount}`);
      updateValues.push(description);
    }

    if (color !== undefined) {
      paramCount++;
      updateFields.push(`color = $${paramCount}`);
      updateValues.push(color);
    }

    if (sort_order !== undefined) {
      paramCount++;
      updateFields.push(`sort_order = $${paramCount}`);
      updateValues.push(sort_order);
    }

    if (is_active !== undefined) {
      paramCount++;
      updateFields.push(`is_active = $${paramCount}`);
      updateValues.push(is_active);
    }

    if (updateFields.length === 0) {
      res.status(400).json({
        success: false,
        message: '수정할 데이터가 없습니다.'
      });
      return;
    }

    paramCount++;
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateValues.push(id);

    const result = await db.query(`
      UPDATE service_types 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `, updateValues);

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: '서비스 유형을 찾을 수 없습니다.'
      });
      return;
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update service type error:', error);
    res.status(500).json({
      success: false,
      message: '서비스 유형 수정에 실패했습니다.'
    });
  }
};

// 서비스 유형 삭제 (소프트 삭제)
export const deleteServiceType = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await db.query(`
      UPDATE service_types 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: '서비스 유형을 찾을 수 없습니다.'
      });
      return;
    }

    res.json({
      success: true,
      message: '서비스 유형이 삭제되었습니다.'
    });
  } catch (error) {
    console.error('Delete service type error:', error);
    res.status(500).json({
      success: false,
      message: '서비스 유형 삭제에 실패했습니다.'
    });
  }
};
