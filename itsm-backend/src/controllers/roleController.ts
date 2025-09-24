import { Request, Response } from 'express';
import { db } from '../config/database';
import { ApiResponse } from '../types';

// 모든 역할 조회
export const getAllRoles = async (req: Request, res: Response) => {
  try {
    const result = await db.query(`
      SELECT id, name, description, is_active, created_at, updated_at
      FROM roles 
      WHERE is_active = true
      ORDER BY id
    `);

    res.json({
      success: true,
      data: result.rows,
      message: '역할 목록을 성공적으로 조회했습니다.'
    } as ApiResponse);
  } catch (error) {
    console.error('역할 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '역할 목록 조회에 실패했습니다.'
    } as ApiResponse);
  }
};

// 특정 역할 조회
export const getRoleById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await db.query(`
      SELECT id, name, description, is_active, created_at, updated_at
      FROM roles 
      WHERE id = $1 AND is_active = true
    `, [id]);

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: '역할을 찾을 수 없습니다.'
      } as ApiResponse);
      return;
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: '역할을 성공적으로 조회했습니다.'
    } as ApiResponse);
  } catch (error) {
    console.error('역할 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '역할 조회에 실패했습니다.'
    } as ApiResponse);
  }
};

// 새 역할 생성
export const createRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;

    if (!name) {
      res.status(400).json({
        success: false,
        message: '역할 이름은 필수입니다.'
      } as ApiResponse);
      return;
    }

    const result = await db.query(`
      INSERT INTO roles (name, description, is_active)
      VALUES ($1, $2, true)
      RETURNING id, name, description, is_active, created_at, updated_at
    `, [name, description]);

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: '역할이 성공적으로 생성되었습니다.'
    } as ApiResponse);
  } catch (error) {
    console.error('역할 생성 오류:', error);
    res.status(500).json({
      success: false,
      message: '역할 생성에 실패했습니다.'
    } as ApiResponse);
  }
};

// 역할 수정
export const updateRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, is_active } = req.body;

    const result = await db.query(`
      UPDATE roles 
      SET name = $1, description = $2, is_active = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING id, name, description, is_active, created_at, updated_at
    `, [name, description, is_active, id]);

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: '역할을 찾을 수 없습니다.'
      } as ApiResponse);
      return;
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: '역할이 성공적으로 수정되었습니다.'
    } as ApiResponse);
  } catch (error) {
    console.error('역할 수정 오류:', error);
    res.status(500).json({
      success: false,
      message: '역할 수정에 실패했습니다.'
    } as ApiResponse);
  }
};

// 역할 삭제
export const deleteRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await db.query(`
      UPDATE roles 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, name, description, is_active, created_at, updated_at
    `, [id]);

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: '역할을 찾을 수 없습니다.'
      } as ApiResponse);
      return;
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: '역할이 성공적으로 삭제되었습니다.'
    } as ApiResponse);
  } catch (error) {
    console.error('역할 삭제 오류:', error);
    res.status(500).json({
      success: false,
      message: '역할 삭제에 실패했습니다.'
    } as ApiResponse);
  }
};
