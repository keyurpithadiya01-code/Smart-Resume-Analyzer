import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function requireUser(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload.isUser) throw new Error('Not a user token');
    
    const user = await User.findById(payload.userId);
    if (!user) throw new Error('User not found');
    if (user.isBanned) return res.status(403).json({ error: 'Account has been banned' });
    if (user.tokenVersion !== payload.tokenVersion) throw new Error('Token expired');
    
    req.user = { ...payload, role: user.role };
    next();
  } catch (err) {
    return res.status(401).json({ error: err.message === 'Account has been banned' ? err.message : 'Invalid or expired token' });
  }
}

export function signUserToken(user) {
  return jwt.sign(
    { userId: user._id.toString(), email: user.email, isUser: true, role: user.role, tokenVersion: user.tokenVersion || 0 },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
}
