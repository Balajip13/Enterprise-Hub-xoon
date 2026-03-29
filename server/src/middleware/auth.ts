import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err: any, decoded: any) => {
    if (err) {
      console.warn('[auth] Token verification failed:', err.message);
      return res.status(401).json({ message: 'Unauthorized. Invalid or expired token.' });
    }
    
    // Normalize user object to ensure 'id' is always present
    req.user = {
      id: decoded.id || decoded.userId || decoded._id,
      role: decoded.role
    };
    
    next();
  });
};

export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized. User not authenticated.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Forbidden: Access denied. Role '${req.user.role}' does not have required permissions.` 
      });
    }

    next();
  };
};
