import 'dotenv/config';
import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import userAuthRoutes from './routes/userAuth.js';
import configRoutes from './routes/config.js';
import analyzeRoutes from './routes/analyze.js';
import storageRoutes from './routes/storage.js';
import aiRoutes from './routes/ai.js';
import builderRoutes from './routes/builder.js';
import dashboardRoutes from './routes/dashboard.js';
import jobsRoutes from './routes/jobs.js';
import feedbackRoutes from './routes/feedback.js';
import adminDashboardRoutes from './routes/adminDashboardRoutes.js';
import ErrorLog from './models/ErrorLog.js';


const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false }));

// Build allowed origins list from CLIENT_URL env (comma-separated)
const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (curl, mobile apps, Render health checks)
      if (!origin) return callback(null, true);

      // Always allow these patterns
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.endsWith('.onrender.com') ||
        origin.endsWith('.scanlyresume.xyz') ||
        origin === 'https://scanlyresume.xyz' ||
        origin === 'http://localhost:5173' ||
        origin === 'http://localhost:5174'
      ) {
        return callback(null, true);
      }

      console.warn(`[CORS] Blocked origin: ${origin}`);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, gemini: Boolean(process.env.GOOGLE_API_KEY) });
});

app.use('/api/auth', authRoutes);
app.use('/api/auth/user', userAuthRoutes);
app.use('/api/config', configRoutes);
app.use('/api/analyze', analyzeRoutes);
app.use('/api/storage', storageRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/builder', builderRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin', adminDashboardRoutes);

const clientDist = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDist));
app.get(/^(?!\/api).*/, (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'), (err) => {
    if (err) res.status(404).json({ error: 'Client not built. Run npm run build in client/' });
  });
});

app.use(async (err, req, res, next) => {
  console.error('Unhandled Error:', err);
  try {
    await ErrorLog.create({
      message: err.message || 'Internal Server Error',
      stack: err.stack,
      method: req.method,
      url: req.originalUrl
    });
  } catch (e) {
    console.error('Failed to log error:', e);
  }
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

async function start() {
  await connectDB();
  app.listen(PORT, () => console.log(`Server http://localhost:${PORT}`));
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
