import { Router } from 'express';
import multer from 'multer';
import { extractTextFromBuffer } from '../services/documentParser.js';
import { analyzeResume } from '../services/resumeAnalyzer.js';
import { getRoleInfo } from '../config/staticData.js';
import Resume from '../models/Resume.js';
import ResumeAnalysis from '../models/ResumeAnalysis.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const router = Router();

router.post('/standard', upload.single('resume'), async (req, res) => {
  try {
    const { category, role } = req.body;
    if (!req.file) return res.status(400).json({ error: 'Resume file is required' });
    const rawText = await extractTextFromBuffer(req.file.buffer, req.file.mimetype, req.file.originalname);
    const jobRequirements = getRoleInfo(category, role) || { required_skills: [] };
    const result = analyzeResume(rawText, jobRequirements);

    let resumeDoc = null;
    if (result.document_type === 'resume' && result.email) {
      resumeDoc = await Resume.create({
        name: result.name,
        email: result.email,
        phone: result.phone,
        linkedin: result.linkedin,
        github: result.github,
        targetRole: role || '',
        targetCategory: category || '',
      });
      await ResumeAnalysis.create({
        resumeId: resumeDoc._id,
        atsScore: result.ats_score,
        keywordMatchScore: result.keyword_match?.score,
        formatScore: result.format_score,
        sectionScore: result.section_score,
        missingSkills: result.keyword_match?.missing_skills || [],
        recommendations: result.suggestions,
        fullResult: result,
        targetRole: role,
        targetCategory: category,
      });
    }

    res.json({ result, resumeId: resumeDoc?._id });
  } catch (err) {
    console.error('Analyze Error:', err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

export default router;
