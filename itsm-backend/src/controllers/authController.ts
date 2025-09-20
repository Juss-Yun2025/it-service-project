import { Request, Response } from 'express';
import { db } from '../config/database';
import { generateToken } from '../utils/jwt';
import { hashPassword, comparePassword } from '../utils/password';
import { User, LoginRequest, RegisterRequest, ApiResponse } from '../types';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password }: LoginRequest = req.body;

    // Find user by email
    const result = await db.query<User>(
      'SELECT * FROM users WHERE email = $1 AND status = $2',
      [email, 'active']
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      } as ApiResponse);
    }

    const user = result.rows[0];

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      } as ApiResponse);
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
      role: user.role
    });

    // Remove password from response
    const { password_hash, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: {
        token,
        user: userWithoutPassword
      },
      message: 'Login successful'
    } as ApiResponse);

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, department, position, role, phone }: RegisterRequest = req.body;

    // Check if user already exists
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      } as ApiResponse);
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Insert new user
    const result = await db.query<User>(
      `INSERT INTO users (email, password_hash, name, department, position, role, phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, email, name, department, position, role, phone, status, created_at, updated_at`,
      [email, passwordHash, name, department, position, role, phone]
    );

    const newUser = result.rows[0];

    res.status(201).json({
      success: true,
      data: newUser,
      message: 'User registered successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      } as ApiResponse);
    }

    const result = await db.query<User>(
      'SELECT id, email, name, department, position, role, phone, status, created_at, updated_at, last_login FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      } as ApiResponse);
    }

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
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { name, department, position, phone } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      } as ApiResponse);
    }

    // Update user profile
    const result = await db.query<User>(
      `UPDATE users 
       SET name = $1, department = $2, position = $3, phone = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING id, email, name, department, position, role, phone, status, created_at, updated_at, last_login`,
      [name, department, position, phone, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      } as ApiResponse);
    }

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
  }
};
