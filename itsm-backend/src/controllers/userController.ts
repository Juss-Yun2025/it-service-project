import { Request, Response } from 'express';
import { db } from '../config/database';
import { hashPassword, generateRandomPassword } from '../utils/password';
import { generatePasswordResetToken } from '../utils/generators';
import { User, ApiResponse, SearchParams } from '../types';

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,  // 기본 limit을 10으로 설정 (페이지네이션)
      search,
      name,  // name 파라미터 추가
      status,
      department,
      role,
      roleId,
      startDate,
      endDate,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query as any;

    const offset = (Number(page) - 1) * Number(limit);
    let whereConditions = ['1=1'];
    const queryParams: any[] = [];
    let paramIndex = 1;

    // Build WHERE conditions
    if (search) {
      whereConditions.push(`(u.name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    if (name) {
      whereConditions.push(`u.name ILIKE $${paramIndex}`);
      queryParams.push(`%${name}%`);
      paramIndex++;
    }

    if (status) {
      whereConditions.push(`u.status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }

    if (department) {
      whereConditions.push(`u.department = $${paramIndex}`);
      queryParams.push(department);
      paramIndex++;
    }

    // role 필터는 user_roles 테이블을 통해 처리
    if (role) {
      whereConditions.push(`EXISTS (
        SELECT 1 FROM user_roles ur 
        JOIN roles r ON ur.role_id = r.id 
        WHERE ur.user_id = u.id AND r.name = $${paramIndex} AND r.is_active = true
      )`);
      queryParams.push(role);
      paramIndex++;
    }

    // roleId 필터는 user_roles 테이블을 통해 처리 (role보다 우선)
    if (roleId) {
      whereConditions.push(`EXISTS (
        SELECT 1 FROM user_roles ur 
        WHERE ur.user_id = u.id AND ur.role_id = $${paramIndex}
      )`);
      queryParams.push(roleId);
      paramIndex++;
    }

    if (startDate) {
      whereConditions.push(`u.created_at >= $${paramIndex}::date`);
      queryParams.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      // endDate에 시간을 추가하여 해당 날짜의 끝까지 포함
      whereConditions.push(`u.created_at < $${paramIndex}::date + interval '1 day'`);
      queryParams.push(endDate);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    // Get total count
    const countResult = await db.query(
      `SELECT COUNT(*) FROM users u WHERE ${whereClause}`,
      queryParams
    );
    const total = parseInt(countResult.rows[0].count);

    // Get users with pagination and roles
    const usersResult = await db.query(
      `SELECT u.id, u.email, u.name, u.department, u.position, u.phone, u.status, 
              u.created_at, u.updated_at, u.last_login,
              COALESCE(
                STRING_AGG(r.name, ', ' ORDER BY r.name), 
                ''
              ) as roles
       FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.id AND r.is_active = true
       WHERE ${whereClause}
       GROUP BY u.id, u.email, u.name, u.department, u.position, u.phone, u.status, 
                u.created_at, u.updated_at, u.last_login
       ORDER BY ${sortBy.replace(/users\./g, 'u.')} ${sortOrder}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...queryParams, limit, offset]
    );

    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      success: true,
      data: usersResult.rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages
      },
      message: 'Users retrieved successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  

    return;}
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await db.query<User>(
      'SELECT id, email, name, department, position, phone, status, created_at, updated_at, last_login FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      } as ApiResponse);
    

      return;}

    res.json({
      success: true,
      data: result.rows[0],
      message: 'User retrieved successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  

    return;}
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, department, position, phone, role, status } = req.body;

    // 연락처 유효성 검사
    if (phone && phone.trim() !== '') {
      const phoneRegex = /^010-\d{4}-\d{4}$/;
      if (!phoneRegex.test(phone)) {
        res.status(400).json({
          success: false,
          message: '연락처 형식이 올바르지 않습니다. (예: 010-1234-5678)'
        } as ApiResponse);
        return;
      }
    }

    // Check if user exists
    const existingUser = await db.query(
      'SELECT id FROM users WHERE id = $1',
      [id]
    );

    if (existingUser.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      } as ApiResponse);
    

      return;}

    // Update user - status가 제공되지 않으면 기존 값 유지
    let updateQuery;
    let queryParams;
    
    if (status !== undefined && status !== null) {
      // status가 제공된 경우
      updateQuery = `UPDATE users 
                     SET name = $1, department = $2, position = $3, phone = $4, status = $5, updated_at = CURRENT_TIMESTAMP
                     WHERE id = $6
                     RETURNING id, email, name, department, position, phone, status, created_at, updated_at, last_login`;
      queryParams = [name, department, position, phone, status, id];
    } else {
      // status가 제공되지 않은 경우 - 기존 status 유지
      updateQuery = `UPDATE users 
                     SET name = $1, department = $2, position = $3, phone = $4, updated_at = CURRENT_TIMESTAMP
                     WHERE id = $5
                     RETURNING id, email, name, department, position, phone, status, created_at, updated_at, last_login`;
      queryParams = [name, department, position, phone, id];
    }
    
    const result = await db.query<User>(updateQuery, queryParams);

    // 권한 업데이트 (role이 제공된 경우)
    if (role) {
      // 기존 권한 모두 제거
      await db.query('DELETE FROM user_roles WHERE user_id = $1', [id]);
      
      // 새 권한 할당
      const roleResult = await db.query('SELECT id FROM roles WHERE name = $1', [role]);
      if (roleResult.rows.length > 0) {
        await db.query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)', [id, roleResult.rows[0].id]);
      }
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'User updated successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  

    return;}
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if user exists
    const existingUser = await db.query(
      'SELECT id FROM users WHERE id = $1',
      [id]
    );

    if (existingUser.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      } as ApiResponse);
    

      return;}

    // Soft delete by setting status to inactive
    await db.query(
      'UPDATE users SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['inactive', id]
    );

    res.json({
      success: true,
      message: 'User deleted successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  

    return;}
};

export const resetUserPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if user exists
    const existingUser = await db.query<User>(
      'SELECT id, email FROM users WHERE id = $1',
      [id]
    );

    if (existingUser.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      } as ApiResponse);
    

      return;}

    // Generate new temporary password
    const tempPassword = generateRandomPassword(12);
    const hashedPassword = await hashPassword(tempPassword);

    // Update user password
    await db.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedPassword, id]
    );

    // Store password reset token
    const resetToken = generatePasswordResetToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours

    await db.query(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [id, resetToken, expiresAt]
    );

    res.json({
      success: true,
      data: {
        temporaryPassword: tempPassword,
        resetToken: resetToken,
        expiresAt: expiresAt
      },
      message: 'Password reset successfully. Please provide the temporary password to the user.'
    } as ApiResponse);

  } catch (error) {
    console.error('Reset user password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  

  return;}
};

// 사용자 비밀번호 변경 (현재 비밀번호 확인 후 변경)
export const changeUserPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    // 입력값 검증
    if (!currentPassword || !newPassword) {
      res.status(400).json({
        success: false,
        message: '현재 비밀번호와 새 비밀번호를 모두 입력해주세요.'
      } as ApiResponse);
      return;
    }

    // 새 비밀번호 강도 검증
    if (newPassword.length < 8) {
      res.status(400).json({
        success: false,
        message: '새 비밀번호는 8자 이상이어야 합니다.'
      } as ApiResponse);
      return;
    }

    // 영문, 숫자, 특수문자 포함 검증
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      res.status(400).json({
        success: false,
        message: '새 비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다.'
      } as ApiResponse);
      return;
    }

    // 사용자 존재 확인 및 현재 비밀번호 검증
    const user = await db.query<User>(
      'SELECT id, password_hash FROM users WHERE id = $1',
      [id]
    );

    if (user.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      } as ApiResponse);
      return;
    }

    // 현재 비밀번호 확인
    const bcrypt = require('bcrypt');
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.rows[0].password_hash);
    
    if (!isCurrentPasswordValid) {
      res.status(400).json({
        success: false,
        message: '현재 비밀번호가 올바르지 않습니다.'
      } as ApiResponse);
      return;
    }

    // 새 비밀번호 해시화
    const hashedNewPassword = await hashPassword(newPassword);

    // 비밀번호 업데이트
    await db.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedNewPassword, id]
    );

    res.status(200).json({
      success: true,
      message: '비밀번호가 성공적으로 변경되었습니다.'
    } as ApiResponse);

  } catch (error) {
    console.error('Change user password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
};
