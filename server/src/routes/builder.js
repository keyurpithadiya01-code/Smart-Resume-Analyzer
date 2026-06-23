import { Router } from 'express';
import { generateResumeDocx } from '../services/resumeBuilder.js';
import Resume from '../models/Resume.js';

const router = Router();

router.post('/generate', async (req, res) => {
  try {
    const data = req.body;
    const p = data.personal_info || {};
    if (!p.email) return res.status(400).json({ error: 'Email is required' });

    const buffer = await generateResumeDocx(data);
    const name = (p.full_name || 'resume').replace(/\s+/g, '_');

    await Resume.create({
      name: p.full_name || 'Unknown',
      email: p.email,
      phone: p.phone || '',
      linkedin: p.linkedin || '',
      portfolio: p.portfolio || '',
      summary: data.summary || '',
      targetRole: data.target_role || '',
      education: data.education,
      experience: data.experience,
      projects: data.projects,
      skills: data.skills,
      template: data.template || 'Modern',
      formData: data,
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${name}_resume.docx"`);
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
