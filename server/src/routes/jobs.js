import { Router } from 'express';
import {
  searchJobPortals, FEATURED_COMPANIES, MARKET_INSIGHTS,
  buildLinkedInSearchUrl, CITY_JOB_SEATS, AI_SUGGESTIONS, JOB_TYPES,
} from '../config/jobsData.js';

const router = Router();

router.get('/insights', (_req, res) => {
  res.json({
    companies: FEATURED_COMPANIES,
    market: MARKET_INSIGHTS,
    cityJobs: CITY_JOB_SEATS,
    aiSuggestions: AI_SUGGESTIONS,
    jobTypes: JOB_TYPES,
  });
});

router.get('/search', (req, res) => {
  const { title, location, jobTypes, salaryMin, salaryMax } = req.query;
  const options = {
    jobTypes: jobTypes ? String(jobTypes).split(',') : [],
    salaryMin: salaryMin || 0,
    salaryMax: salaryMax || 50,
  };
  const portals = searchJobPortals(title, location, options);
  const linkedInUrl = buildLinkedInSearchUrl(title, location, options);
  res.json({ portals, linkedInUrl, filters: options });
});

export default router;
