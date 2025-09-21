import { Request, Response } from 'express';
import { db } from '../config/database';

// 부서 타입 정의
export interface Department {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// 모든 부서 조회
export const getAllDepartments = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await db.query<Department>(
      'SELECT * FROM departments WHERE is_active = true ORDER BY name ASC'
    );
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({
      success: false,
      error: '부서 목록을 가져오는데 실패했습니다.'
    });
  }
};

// 특정 부서 조회
export const getDepartmentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const result = await db.query<Department>(
      'SELECT * FROM departments WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: '부서를 찾을 수 없습니다.'
      });
      return;
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching department:', error);
    res.status(500).json({
      success: false,
      error: '부서 정보를 가져오는데 실패했습니다.'
    });
  }
};

// 새 부서 생성
export const createDepartment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      res.status(400).json({
        success: false,
        error: '부서명은 필수입니다.'
      });
      return;
    }
    
    const result = await db.query<Department>(
      `INSERT INTO departments (name, description)
       VALUES ($1, $2)
       RETURNING *`,
      [name, description]
    );
    
    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: '부서가 성공적으로 생성되었습니다.'
    });
  } catch (error: any) {
    console.error('Error creating department:', error);
    
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({
        success: false,
        error: '이미 존재하는 부서명입니다.'
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      error: '부서 생성에 실패했습니다.'
    });
  }
};

// 부서 수정
export const updateDepartment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, is_active } = req.body;
    
    if (!name) {
      res.status(400).json({
        success: false,
        error: '부서명은 필수입니다.'
      });
      return;
    }
    
    const result = await db.query<Department>(
      `UPDATE departments 
       SET name = $1, description = $2, is_active = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [name, description, is_active !== undefined ? is_active : true, id]
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: '부서를 찾을 수 없습니다.'
      });
      return;
    }
    
    res.json({
      success: true,
      data: result.rows[0],
      message: '부서가 성공적으로 수정되었습니다.'
    });
  } catch (error: any) {
    console.error('Error updating department:', error);
    
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({
        success: false,
        error: '이미 존재하는 부서명입니다.'
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      error: '부서 수정에 실패했습니다.'
    });
  }
};

// 부서 삭제 (비활성화)
export const deleteDepartment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // 실제 삭제 대신 비활성화
    const result = await db.query<Department>(
      `UPDATE departments 
       SET is_active = false, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: '부서를 찾을 수 없습니다.'
      });
      return;
    }
    
    res.json({
      success: true,
      message: '부서가 성공적으로 비활성화되었습니다.'
    });
  } catch (error) {
    console.error('Error deleting department:', error);
    res.status(500).json({
      success: false,
      error: '부서 삭제에 실패했습니다.'
    });
  }
};