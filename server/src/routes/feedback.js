import { Router } from 'express';
import Feedback from '../models/Feedback.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const doc = await Feedback.create({
      rating: req.body.rating,
      usabilityScore: req.body.usability_score,
      featureSatisfaction: req.body.feature_satisfaction,
      missingFeatures: req.body.missing_features || '',
      improvementSuggestions: req.body.improvement_suggestions || '',
      userExperience: req.body.user_experience || '',
    });
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/stats', async (_req, res) => {
  const stats = await Feedback.aggregate([
    {
      $group: {
        _id: null,
        avg_rating: { $avg: '$rating' },
        avg_usability: { $avg: '$usabilityScore' },
        avg_satisfaction: { $avg: '$featureSatisfaction' },
        total_responses: { $sum: 1 },
      },
    },
  ]);
  const s = stats[0] || {};
  res.json({
    avg_rating: Number((s.avg_rating || 0).toFixed(2)),
    avg_usability: Number((s.avg_usability || 0).toFixed(2)),
    avg_satisfaction: Number((s.avg_satisfaction || 0).toFixed(2)),
    total_responses: s.total_responses || 0,
  });
});

export default router;
