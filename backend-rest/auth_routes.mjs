import express from 'express';
import { register, login } from './auth_controller.mjs';
import { verifyToken } from './auth_middleware.mjs';
import { authLimiter } from './rate_limiter.mjs';

const router = express.Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);

router.get('/me', verifyToken, (req, res) => {
  res.status(200).json({ message: 'Token is valid', userId: req.userId });
});

export default router;
