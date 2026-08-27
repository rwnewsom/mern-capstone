import express from 'express';
import { verifyToken, verifyAdmin } from './auth_middleware.mjs';
import {
  listUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
  deleteUser,
} from './user_controller.mjs';

const router = express.Router();

router.get('/users', verifyToken, verifyAdmin, listUsers);
router.get('/users/:id', verifyToken, verifyAdmin, getUserById);
router.put('/users/:id/role', verifyToken, verifyAdmin, updateUserRole);
router.put('/users/:id/status', verifyToken, verifyAdmin, updateUserStatus);
router.delete('/users/:id', verifyToken, verifyAdmin, deleteUser);

export default router;
