import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db, User } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'smart_blood_connect_jwt_secure_secret_key_2026';

export interface AuthPayload {
  userId: string;
  email: string;
  role: 'donor' | 'hospital' | 'admin';
  name: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthPayload;
  fullUser?: User;
}

export function generateToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function authenticateJWT(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Authentication required. Missing Bearer token.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
    const user = db.users.find(u => u.id === decoded.userId);
    if (!user) {
      return res.status(401).json({ success: false, error: 'User account not found.' });
    }
    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, error: 'Your account has been suspended by administration.' });
    }

    req.user = decoded;
    req.fullUser = user;
    next();
  } catch (err: any) {
    return res.status(401).json({ success: false, error: 'Invalid or expired authentication session.' });
  }
}

export function requireRole(allowedRoles: ('donor' | 'hospital' | 'admin')[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized. Sign in required.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Requires role: ${allowedRoles.join(' or ')}. Your role is: ${req.user.role}.`
      });
    }

    next();
  };
}
