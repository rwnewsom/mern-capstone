import jwt from 'jsonwebtoken';
import { config } from './config.mjs';

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ Error: 'Authorization header missing' });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ Error: 'Token expired' });
    }
    return res.status(401).json({ Error: 'Invalid token' });
  }
};

export const verifyAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ Error: 'Admin access required' });
  }
  next();
};
