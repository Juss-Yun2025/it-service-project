import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export const generateToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload as any, JWT_SECRET as any, { expiresIn: JWT_EXPIRES_IN } as any);
};

export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, JWT_SECRET as any) as JWTPayload;
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET as any, { expiresIn: '7d' } as any);
};
