import { Router } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Resume from '../models/Resume.js';
import UserResume from '../models/UserResume.js';
import ErrorLog from '../models/ErrorLog.js';
import { requireSuperAdmin } from '../middleware/superAdminAuth.js';

const router = Router();

router.use(requireSuperAdmin);

// 1. System Health & Metrics
router.get('/metrics', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalResumesAnalyzed = await Resume.countDocuments();
    // For active sessions, since we don't track them tightly in a DB session store, 
    // we can return a placeholder or estimate (e.g. users created in last 7 days or just omit)
    res.json({ totalUsers, totalResumesAnalyzed, activeSessions: 'N/A' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Error Rate Logs
router.get('/errors', async (req, res) => {
  try {
    // Return last 30 error logs for simple chart
    const logs = await ErrorLog.find().sort({ timestamp: -1 }).limit(100);
    
    // Group by day for simple Recharts data: [{ name: 'MM/DD', errors: count }]
    const dataMap = {};
    logs.forEach(log => {
      const d = new Date(log.timestamp);
      const key = `${d.getMonth() + 1}/${d.getDate()}`;
      dataMap[key] = (dataMap[key] || 0) + 1;
    });

    const chartData = Object.keys(dataMap).map(key => ({ name: key, errors: dataMap[key] })).reverse();
    
    res.json({ logs, chartData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. User Directory & Oversight
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/users/:id/resume', async (req, res) => {
  try {
    const userResume = await UserResume.findOne({ userId: req.params.id });
    if (!userResume || !userResume.data) {
      return res.status(404).json({ error: 'No resume found for this user.' });
    }
    res.set('Content-Type', 'application/pdf');
    res.send(userResume.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Administrative Actions
router.post('/users/:id/ban', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.isBanned = !user.isBanned;
    
    // If banning, let's also force expire session
    if (user.isBanned) {
      user.tokenVersion += 1;
    }
    
    await user.save();
    res.json({ message: user.isBanned ? 'User banned' : 'User unbanned', isBanned: user.isBanned });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/users/:id/reset-password', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Generate a secure temporary password
    const tempPassword = Math.random().toString(36).slice(-8) + 'Aa1!';
    user.password = await bcrypt.hash(tempPassword, 10);
    user.tokenVersion += 1; // Force expire current sessions so they have to login with new password
    await user.save();

    res.json({ message: 'Password reset successful', tempPassword });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/users/:id/force-expire', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.tokenVersion += 1;
    await user.save();

    res.json({ message: 'User session forcefully expired', tokenVersion: user.tokenVersion });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
