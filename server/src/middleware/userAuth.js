import jwt from 'jsonwebtoken';

export function requireUser(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload.isUser) throw new Error('Not a user token');
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function signUserToken(user) {
  return jwt.sign(
    { userId: user._id.toString(), email: user.email, isUser: true },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
}
