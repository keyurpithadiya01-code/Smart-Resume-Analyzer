import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const raw = JSON.parse(readFileSync(join(__dirname, '../../config/staticData.json'), 'utf-8'));

export const JOB_ROLES = raw.JOB_ROLES;
export const COURSES_BY_CATEGORY = raw.COURSES_BY_CATEGORY;
export const RESUME_VIDEOS = raw.RESUME_VIDEOS;
export const INTERVIEW_VIDEOS = raw.INTERVIEW_VIDEOS;

export function getCoursesForRole(roleName) {
  for (const roles of Object.values(COURSES_BY_CATEGORY)) {
    if (roles[roleName]) return roles[roleName];
  }
  return null;
}

export function getCategoryForRole(roleName) {
  for (const [category, roles] of Object.entries(COURSES_BY_CATEGORY)) {
    if (roles[roleName]) return category;
  }
  return null;
}

export function getRoleInfo(category, role) {
  return JOB_ROLES[category]?.[role] || null;
}

export function listCategories() {
  return Object.keys(JOB_ROLES);
}

export function listRoles(category) {
  return Object.keys(JOB_ROLES[category] || {});
}
