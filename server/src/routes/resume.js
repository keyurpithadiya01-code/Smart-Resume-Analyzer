import { Router } from 'express';
import multer from 'multer';
import mongoose from 'mongoose';
import { requireUser } from '../middleware/userAuth.js';
import { extractTextFromBuffer } from '../services/documentParser.js';
import { analyzeForOptimizer, optimizeResume } from '../services/aiResumeAnalyzer.js';
import OptimizedResume from '../models/OptimizedResume.js';
import { generateOptimizedPdf } from '../services/pdfGenerator.js';
import UserResume from '../models/UserResume.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const router = Router();

// 1. Initial Analysis for Optimizer
router.post('/optimizer/analyze', requireUser, upload.single('resume'), async (req, res) => {
  try {
    const { resumeText: bodyText, useSavedResume } = req.body;
    let resumeText = bodyText;
    
    const userId = req.user.userId || req.user.id || req.user._id;

    if (useSavedResume === 'true') {
      const saved = await UserResume.findOne({ userId });
      if (!saved) return res.status(400).json({ error: 'No saved resume found in storage' });
      resumeText = await extractTextFromBuffer(saved.data, saved.mimetype, saved.filename);
    } else if (req.file) {
      resumeText = await extractTextFromBuffer(req.file.buffer, req.file.mimetype, req.file.originalname);
    }

    if (!resumeText) {
       return res.status(400).json({ error: 'No resume text provided.' });
    }

    const result = await analyzeForOptimizer(resumeText, process.env.GOOGLE_API_KEY);
    
    // Result should be { atsScore: number, missingSkills: string[] }
    res.json({
       ...result,
       resumeText // send it back so the client can hold onto it for the next step
    });

  } catch (err) {
    console.error('Optimizer Analysis Error:', err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

// 2. Generate Optimized Resume
router.post('/optimize', requireUser, async (req, res) => {
  try {
    const { resumeText, selectedSkills, atsScore } = req.body;
    
    if (!resumeText) return res.status(400).json({ error: 'Resume text is required.' });
    if (!Array.isArray(selectedSkills)) return res.status(400).json({ error: 'Selected skills must be an array.' });
    
    const userId = req.user.userId || req.user.id || req.user._id;

    const optimizedJson = await optimizeResume(resumeText, selectedSkills, process.env.GOOGLE_API_KEY);

    const savedDoc = await OptimizedResume.create({
      userId,
      originalResumeText: resumeText,
      improvedResume: optimizedJson,
      selectedSkills,
      atsScore: atsScore || 0,
    });

    res.json({
      optimizedResumeId: savedDoc._id,
      optimizedResume: savedDoc.improvedResume
    });

  } catch (err) {
    console.error('Optimize Error:', err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

// 3. Download Optimized Resume as PDF
router.get('/download/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid document ID format' });
    }

    const optResume = await OptimizedResume.findById(id);
    if (!optResume) return res.status(404).json({ error: 'Optimized resume not found' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=optimized_resume.pdf');

    generateOptimizedPdf(optResume.improvedResume, res);
  } catch (err) {
    console.error('Download Error:', err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

export default router;
