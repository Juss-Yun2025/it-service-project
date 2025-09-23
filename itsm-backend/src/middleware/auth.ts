import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWTPayload, User } from '../types';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ 
      success: false, 
      message: 'Access token required' 
    });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }

    const decoded = jwt.verify(token, secret) as JWTPayload;
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };
    
    next();
  } catch (error) {
    res.status(403).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
    return;
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ 
        success: false, 
        message: 'Insufficient permissions' 
      });
      return;
    }

    next();
  };
};

export const requireAdmin = requireRole(['시스템관리']);
export const requireManager = requireRole(['관리매니저', '시스템관리']);
export const requireTechnician = requireRole(['조치담당자', '배정담당자', '관리매니저', '시스템관리']);
export const requireUser = requireRole(['일반사용자', '조치담당자', '배정담당자', '관리매니저', '시스템관리']);
