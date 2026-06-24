import { Router } from 'express';
import multer from 'multer';
import UserResume from '../models/UserResume.js';
import { requireUser } from '../middleware/userAuth.js';

// Setup multer to store the uploaded file in memory
const upload = multer({ 
  storage: multer.memoryStorage(), 
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const router = Router();

// Upload or overwrite the user's resume
router.post('/upload', requireUser, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Resume file is required' });
    }

    const userId = req.user.userId;
    
    // Use findOneAndUpdate with upsert: true to either create or overwrite
    const updatedResume = await UserResume.findOneAndUpdate(
      { userId },
      {
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        data: req.file.buffer
      },
      { new: true, upsert: true }
    );

    res.json({ 
      success: true, 
      message: 'Resume saved successfully',
      metadata: {
        filename: updatedResume.filename,
        size: updatedResume.size
      }
    });
  } catch (err) {
    console.error('Storage Upload Error:', err);
    res.status(500).json({ error: 'Failed to upload resume to storage' });
  }
});

// Get the metadata of the user's stored resume
router.get('/mine', requireUser, async (req, res) => {
  try {
    const userId = req.user.userId;
    // Only select metadata, omit the massive 'data' buffer for fast loading
    const resume = await UserResume.findOne({ userId }).select('filename size mimetype updatedAt');
    
    if (!resume) {
      return res.json({ exists: false });
    }
    
    res.json({
      exists: true,
      metadata: {
        filename: resume.filename,
        size: resume.size,
        updatedAt: resume.updatedAt
      }
    });
  } catch (err) {
    console.error('Storage Get Error:', err);
    res.status(500).json({ error: 'Failed to retrieve resume metadata' });
  }
});

// Download the actual file buffer
router.get('/download', requireUser, async (req, res) => {
  try {
    const userId = req.user.userId;
    const resume = await UserResume.findOne({ userId });
    
    if (!resume) {
      return res.status(404).json({ error: 'No saved resume found' });
    }
    
    res.set('Content-Type', resume.mimetype);
    res.set('Content-Disposition', `attachment; filename="${resume.filename}"`);
    res.send(resume.data);
  } catch (err) {
    console.error('Storage Download Error:', err);
    res.status(500).json({ error: 'Failed to download resume' });
  }
});

export default router;
