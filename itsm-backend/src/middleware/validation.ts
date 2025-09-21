import { Request, Response, NextFunction } from 'express';

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  // Password must be at least 8 characters long
  return password.length >= 8;
};

export const validateRequired = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const missingFields: string[] = [];

    for (const field of fields) {
      if (!req.body[field] || req.body[field].toString().trim() === '') {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
      return;
    }

    next();
  };
};

export const validateLogin = (req: Request, res: Response, next: NextFunction): void => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
    return;
  }

  if (!validateEmail(email)) {
    res.status(400).json({
      success: false,
      message: 'Invalid email format'
    });
    return;
  }

  next();
};

export const validateRegister = (req: Request, res: Response, next: NextFunction): void => {
  const { email, password, name, department, position, role } = req.body;

  if (!email || !password || !name || !department || !position || !role) {
    res.status(400).json({
      success: false,
      message: 'All fields are required'
    });
    return;
  }

  if (!validateEmail(email)) {
    res.status(400).json({
      success: false,
      message: 'Invalid email format'
    });
    return;
  }

  if (!validatePassword(password)) {
    res.status(400).json({
      success: false,
      message: 'Password must be at least 8 characters long'
    });
    return;
  }

  const validRoles = ['user', 'technician', 'assignment_manager', 'service_manager', 'system_admin'];
  if (!validRoles.includes(role)) {
    res.status(400).json({
      success: false,
      message: 'Invalid role'
    });
    return;
  }

  next();
};
