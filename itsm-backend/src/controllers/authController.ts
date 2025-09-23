import { Request, Response } from 'express';
import { db } from '../config/database';
import { generateToken } from '../utils/jwt';
import { hashPassword, comparePassword } from '../utils/password';
import { User, LoginRequest, RegisterRequest, ApiResponse } from '../types';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginRequest = req.body;
    
    console.log('Login attempt:', { email, passwordLength: password?.length });

    // Find user by email
    const result = await db.query<User>(
      'SELECT * FROM users WHERE email = $1 AND status = $2',
      [email, 'active']
    );

    console.log('Database query result:', { 
      email, 
      rowsFound: result.rows.length,
      userEmail: result.rows[0]?.email,
      userStatus: result.rows[0]?.status
    });

    if (result.rows.length === 0) {
      console.log('No user found or inactive status');
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      } as ApiResponse);
      return;
    }

    const user = result.rows[0];
    
    // Get user roles from user_roles table
    const roleResult = await db.query(
      'SELECT r.name FROM roles r JOIN user_roles ur ON r.id = ur.role_id WHERE ur.user_id = $1',
      [user.id]
    );
    
    const userRoles = roleResult.rows.map(row => row.name);
    const primaryRole = userRoles[0] || '일반사용자'; // 기본 역할
    
    console.log('User found:', { 
      id: user.id, 
      email: user.email, 
      name: user.name,
      roles: userRoles,
      primaryRole: primaryRole,
      status: user.status,
      hashPreview: user.password_hash?.substring(0, 20)
    });

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    console.log('Password verification:', { 
      isPasswordValid, 
      providedPassword: password,
      storedHash: user.password_hash?.substring(0, 20)
    });
    
    if (!isPasswordValid) {
      console.log('Password verification failed');
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      } as ApiResponse);
      return;
    }

    // Update last login
    await db.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: primaryRole
    });

    // Remove password from response
    const { password_hash, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: {
        token,
        user: {
          ...userWithoutPassword,
          role: primaryRole
        }
      },
      message: 'Login successful'
    } as ApiResponse);

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  

    return;}
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, department, position, role, phone }: RegisterRequest = req.body;

    // Check if user already exists
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      } as ApiResponse);
      return;
    }

    // Map English role to Korean role for database constraint
    const roleMapping: { [key: string]: string } = {
      'user': '일반사용자',
      'technician': '조치담당자',
      'assignment_manager': '배정담당자',
      'service_manager': '관리매니저',
      'system_admin': '시스템관리'
    };

    const koreanRole = roleMapping[role] || '일반사용자';

    // Hash password
    const passwordHash = await hashPassword(password);

    // Insert new user
    const result = await db.query<User>(
      `INSERT INTO users (email, password_hash, name, department, position, role, phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, email, name, department, position, role, phone, status, created_at, updated_at`,
      [email, passwordHash, name, department, position, koreanRole, phone]
    );

    const newUser = result.rows[0];

    res.status(201).json({
      success: true,
      data: newUser,
      message: 'User registered successfully'
    } as ApiResponse);

  


    return;} catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  

    return;}
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      } as ApiResponse);
    

      return;}

    const result = await db.query<User>(
      'SELECT id, email, name, department, position, role, phone, status, created_at, updated_at, last_login FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      } as ApiResponse);
    

      return;}

    const user = result.rows[0];

    res.json({
      success: true,
      data: user,
      message: 'Profile retrieved successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  

    return;}
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { name, department, position, phone } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      } as ApiResponse);
    

      return;}

    // Update user profile
    const result = await db.query<User>(
      `UPDATE users 
       SET name = $1, department = $2, position = $3, phone = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING id, email, name, department, position, role, phone, status, created_at, updated_at, last_login`,
      [name, department, position, phone, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      } as ApiResponse);
    

      return;}

    const updatedUser = result.rows[0];

    res.json({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  

    return;}
};
