import { Router } from 'express';
import {
  JOB_ROLES, RESUME_VIDEOS, INTERVIEW_VIDEOS,
  listCategories, listRoles, getCoursesForRole, getCategoryForRole, getRoleInfo,
} from '../config/staticData.js';
import { JOB_SUGGESTIONS, LOCATION_SUGGESTIONS, EXPERIENCE_RANGES } from '../config/jobsData.js';

const router = Router();

router.get('/job-roles', (_req, res) => {
  res.json({ categories: listCategories(), roles: JOB_ROLES });
});

router.get('/courses/:role', (req, res) => {
  const courses = getCoursesForRole(req.params.role);
  const category = getCategoryForRole(req.params.role);
  const roleInfo = category ? getRoleInfo(category, req.params.role) : null;
  res.json({ courses, category, roleInfo });
});

router.get('/videos', (_req, res) => {
  res.json({ resume: RESUME_VIDEOS, interview: INTERVIEW_VIDEOS });
});

router.get('/suggestions', (_req, res) => {
  res.json({ jobs: JOB_SUGGESTIONS, locations: LOCATION_SUGGESTIONS, experience: EXPERIENCE_RANGES });
});

export default router;
