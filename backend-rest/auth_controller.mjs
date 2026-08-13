import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from './user_model.mjs';

export const validateAuthInput = (email, password) => {
  const errors = [];

  if (!email || typeof email !== 'string') {
    errors.push('Email is required and must be a string');
  } else {
    const trimmedEmail = email.trim();
    if (!trimmedEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      errors.push('Email must be a valid email address');
    }
  }

  if (!password || typeof password !== 'string') {
    errors.push('Password is required and must be a string');
  } else if (password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  return { isValid: errors.length === 0, errors };
};

export const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { isValid, errors } = validateAuthInput(email, password);
    if (!isValid) {
      return res.status(400).json({ Error: errors.join(', ') });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ Error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    const savedUser = await user.save();

    const token = jwt.sign({ userId: savedUser._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: savedUser._id,
        email: savedUser.email,
      },
    });
  } catch {
    res.status(500).json({ Error: 'Registration failed' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { isValid, errors } = validateAuthInput(email, password);
    if (!isValid) {
      return res.status(400).json({ Error: errors.join(', ') });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ Error: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ Error: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch {
    res.status(500).json({ Error: 'Login failed' });
  }
};
