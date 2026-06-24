import { Router } from 'express';
import multer from 'multer';
import mongoose from 'mongoose';
import { extractTextFromBuffer } from '../services/documentParser.js';
import { analyzeWithGemini, parseResumeToJson } from '../services/aiResumeAnalyzer.js';
import UserResume from '../models/UserResume.js';
import AiAnalysis from '../models/AiAnalysis.js';
import { requireAdmin } from '../middleware/auth.js';
import { requireUser } from '../middleware/userAuth.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const router = Router();

router.post('/analyze', requireUser, upload.single('resume'), async (req, res) => {
  try {
    const { jobRole, jobDescription, resumeText: bodyText, useSavedResume } = req.body;
    let resumeText = bodyText;
    
    if (useSavedResume === 'true') {
      const saved = await UserResume.findOne({ userId: req.user.userId });
      if (!saved) return res.status(400).json({ error: 'No saved resume found in storage' });
      resumeText = await extractTextFromBuffer(saved.data, saved.mimetype, saved.filename);
    } else if (req.file) {
      resumeText = await extractTextFromBuffer(req.file.buffer, req.file.mimetype, req.file.originalname);
    }
    const out = await analyzeWithGemini(resumeText, {
      jobRole,
      jobDescription,
      apiKey: process.env.GOOGLE_API_KEY,
    });
    if (out.error) return res.status(400).json(out);

    // Stamp with authenticated user's ID
    await AiAnalysis.create({
      userId: req.user.userId,
      modelUsed: out.model_used,
      resumeScore: out.resume_score,
      atsScore: out.ats_score,
      jobRole: jobRole || '',
      analysis: out.analysis,
    });

    res.json({
      score: out.resume_score,
      ats_score: out.ats_score,
      full_response: out.analysis,
      model_used: out.model_used,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/parse-to-json', requireUser, upload.single('resume'), async (req, res) => {
  try {
    const { useSavedResume } = req.body;
    let fileBuffer, fileMimetype, fileOriginalname;
    
    if (useSavedResume === 'true') {
      const saved = await UserResume.findOne({ userId: req.user.userId });
      if (!saved) return res.status(400).json({ error: 'No saved resume found in storage' });
      fileBuffer = saved.data;
      fileMimetype = saved.mimetype;
      fileOriginalname = saved.filename;
    } else if (req.file) {
      fileBuffer = req.file.buffer;
      fileMimetype = req.file.mimetype;
      fileOriginalname = req.file.originalname;
    } else {
      return res.status(400).json({ error: 'Resume file is required' });
    }
    const resumeText = await extractTextFromBuffer(fileBuffer, fileMimetype, fileOriginalname);
    const result = await parseResumeToJson(resumeText, process.env.GOOGLE_API_KEY);
    res.json(result);
  } catch (err) {
    console.error('Parse Error:', err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

router.get('/stats', requireUser, async (req, res) => {
  const userObjId = new mongoose.Types.ObjectId(req.user.userId);
  const total = await AiAnalysis.countDocuments({ userId: userObjId });
  const avg = await AiAnalysis.aggregate([
    { $match: { userId: userObjId } },
    { $group: { _id: null, avgScore: { $avg: '$resumeScore' }, avgAts: { $avg: '$atsScore' } } },
  ]);
  const byRole = await AiAnalysis.aggregate([
    { $match: { userId: userObjId } },
    { $group: { _id: '$jobRole', count: { $sum: 1 }, avgScore: { $avg: '$resumeScore' } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);
  res.json({
    total,
    averageScore: Math.round(avg[0]?.avgScore || 0),
    averageAts: Math.round(avg[0]?.avgAts || 0),
    byRole,
  });
});

router.delete('/stats', requireAdmin, async (_req, res) => {
  await AiAnalysis.deleteMany({});
  res.json({ ok: true });
});

export default router;
