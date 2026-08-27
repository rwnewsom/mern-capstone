import asyncHandler from 'express-async-handler';
import User from './user_model.mjs';

export const listUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}, '-password');
  res.status(200).json(users);
});

export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id, '-password');
  if (!user) {
    return res.status(404).json({ Error: 'User not found' });
  }

  res.status(200).json(user);
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!role || !['user', 'admin'].includes(role)) {
    return res.status(400).json({ Error: 'Role must be either "user" or "admin"' });
  }

  const user = await User.findByIdAndUpdate(id, { role }, { new: true });
  if (!user) {
    return res.status(404).json({ Error: 'User not found' });
  }

  res.status(200).json(user);
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  if (typeof isActive !== 'boolean') {
    return res.status(400).json({ Error: 'isActive must be a boolean' });
  }

  const user = await User.findByIdAndUpdate(id, { isActive }, { new: true });
  if (!user) {
    return res.status(404).json({ Error: 'User not found' });
  }

  res.status(200).json(user);
});

export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findByIdAndDelete(id);
  if (!user) {
    return res.status(404).json({ Error: 'User not found' });
  }

  res.status(204).send();
});
