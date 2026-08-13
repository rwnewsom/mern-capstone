import express from 'express';
import { register, login } from './auth_controller.mjs';
import { verifyToken } from './auth_middleware.mjs';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.get('/me', verifyToken, (req, res) => {
  res.status(200).json({ message: 'Token is valid', userId: req.userId });
});

export default router;
