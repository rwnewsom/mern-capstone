import jwt from 'jsonwebtoken';
import { config } from '../../config.mjs';

// Mints real, verifiable JWTs directly (rather than going through
// POST /auth/login) so route tests don't get throttled by authLimiter
// (5 requests/15min) just for test setup.
export const signToken = (userId, role = 'user', options = {}) =>
  jwt.sign({ userId, role }, config.jwt.secret, { expiresIn: '1h', ...options });
