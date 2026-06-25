import { Router } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import User from '../models/User.js';
import { createAndStoreOtp, verifyOtp } from '../services/otpService.js';
import { sendOtpEmail } from '../services/emailService.js';
import { requireUser, signUserToken } from '../middleware/userAuth.js';

const router = Router();

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many OTP requests. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many attempts. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/send-otp', otpLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }
    const normalized = email.toLowerCase().trim();

    const existing = await User.findOne({ email: normalized });
    if (existing) {
      return res.status(409).json({ error: 'Email address already registered. Please login.' });
    }

    const otp = await createAndStoreOtp(normalized);
    await sendOtpEmail(normalized, otp);

    res.json({
      ok: true,
      email: normalized,
      message: 'OTP sent to your email address',
    });
  } catch (err) {
    console.error('[send-otp] Error:', err.message);
    // Distinguish email delivery failures from other errors
    if (err.message && err.message.includes('Email delivery failed')) {
      return res.status(500).json({ error: 'Could not send OTP email. Please try again or contact support.' });
    }
    res.status(400).json({ error: err.message });
  }
});

router.post('/signup', authLimiter, async (req, res) => {
  try {
    const { email, otp, password, name = '' } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const normalized = email.toLowerCase().trim();

    const existing = await User.findOne({ email: normalized });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered. Please login.' });
    }

    const verification = await verifyOtp(normalized, otp);
    if (!verification.ok) {
      return res.status(400).json({ error: verification.error });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: normalized,
      password: hashed,
      name: String(name).trim(),
      emailVerified: true,
      lastLogin: new Date(),
    });

    const token = signUserToken(user);
    res.status(201).json({
      token,
      user: { id: user._id, email: user.email, name: user.name, role: user.role },
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const normalized = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalized });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const superEmail = process.env.SUPERADMIN_EMAIL || 'keyurpithadiya01@gmail.com';
    let needsSave = false;
    
    if (user.email === superEmail.toLowerCase().trim() && user.role !== 'superadmin') {
      user.role = 'superadmin';
      needsSave = true;
    }

    user.lastLogin = new Date();
    await user.save();

    const token = signUserToken(user);
    res.json({
      token,
      user: { id: user._id, email: user.email, name: user.name, role: user.role },
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/me', requireUser, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: { id: user._id, phone: user.phone, name: user.name } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/logout', requireUser, (_req, res) => {
  res.json({ ok: true });
});

export default router;
