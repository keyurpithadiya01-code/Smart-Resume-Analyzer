import axios from 'axios';

// 🔥 THE FIX: Pointing directly to your live Render backend
const api = axios.create({
  baseURL: 'https://smart-resume-analyzer-avad.onrender.com/api'
});

const ADMIN_PATHS = ['/dashboard/admin', '/auth/logout'];

function needsAdminToken(url, method) {
  if (!url) return false;
  if (ADMIN_PATHS.some((p) => url.includes(p))) return true;
  if (url.includes('/ai/stats') && method?.toLowerCase() === 'delete') return true;
  return false;
}

api.interceptors.request.use((config) => {
  const url = config.url || '';
  const adminToken = localStorage.getItem('adminToken');
  const userToken = localStorage.getItem('userToken');

  if (needsAdminToken(url, config.method)) {
    if (adminToken) config.headers.Authorization = `Bearer ${adminToken}`;
  } else if (userToken) {
    config.headers.Authorization = `Bearer ${userToken}`;
  } else if (adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  }

  return config;
});

export default api;