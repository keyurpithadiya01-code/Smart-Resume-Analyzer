import { requireUser } from './userAuth.js';

export const requireSuperAdmin = [
  requireUser,
  (req, res, next) => {
    if (req.user && req.user.role === 'superadmin') {
      next();
    } else {
      res.status(403).json({ error: 'Access denied. Superadmin privileges required.' });
    }
  }
];
