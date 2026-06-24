import { Router } from 'express';
import mongoose from 'mongoose';
import ExcelJS from 'exceljs';
import Resume from '../models/Resume.js';
import ResumeAnalysis from '../models/ResumeAnalysis.js';
import AiAnalysis from '../models/AiAnalysis.js';
import AdminLog from '../models/AdminLog.js';
import { requireAdmin } from '../middleware/auth.js';
import { requireUser } from '../middleware/userAuth.js';

const router = Router();

// ── Per-user stats builder ─────────────────────────────────────────────────
async function buildUserStats(userId) {
  const userObjId = new mongoose.Types.ObjectId(userId);
  const userFilter = { userId: userObjId };

  const totalResumes = await Resume.countDocuments(userFilter);
  const analyses = await ResumeAnalysis.find(userFilter).lean();
  const avgAts =
    analyses.length > 0
      ? Math.round(analyses.reduce((s, a) => s + (a.atsScore || 0), 0) / analyses.length)
      : 0;
  const highPerforming = analyses.filter((a) => (a.atsScore || 0) >= 70).length;
  const successRate = analyses.length ? Math.round((highPerforming / analyses.length) * 100) : 0;

  const byCategory = await Resume.aggregate([
    { $match: { userId: userObjId, targetCategory: { $ne: '' } } },
    { $group: { _id: '$targetCategory', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  const weekly = await ResumeAnalysis.aggregate([
    { $match: userFilter },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        avgAts: { $avg: '$atsScore' },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: -1 } },
    { $limit: 30 },
  ]);

  return {
    totalResumes,
    avgAts,
    highPerforming,
    successRate,
    byCategory,
    weekly: weekly.reverse(),
    totalAnalyses: analyses.length,
  };
}

// ── User stats (scoped to the requesting user) ─────────────────────────────
router.get('/stats', requireUser, async (req, res) => {
  const userId = req.user.userId || req.user.id || req.user._id;
  res.json(await buildUserStats(userId));
});

// ── User home dashboard (scoped to the requesting user) ───────────────────
router.get('/home', requireUser, async (req, res) => {
  const userId = req.user.userId || req.user.id || req.user._id;
  const userObjId = new mongoose.Types.ObjectId(userId);
  const userFilter = { userId: userObjId };

  const [standardAnalyses, aiAnalyses, totalResumes] = await Promise.all([
    ResumeAnalysis.find(userFilter).sort({ createdAt: -1 }).limit(50).lean(),
    AiAnalysis.find(userFilter).sort({ createdAt: -1 }).limit(50).lean(),
    Resume.countDocuments(userFilter),
  ]);

  const allScores = [
    ...standardAnalyses.map((a) => a.atsScore || 0),
    ...aiAnalyses.map((a) => a.atsScore || 0),
  ].filter((s) => s > 0);

  const totalAnalyses = standardAnalyses.length + aiAnalyses.length;
  const avgAts = allScores.length
    ? Math.round(allScores.reduce((s, n) => s + n, 0) / allScores.length)
    : 0;
  const bestAts = allScores.length ? Math.max(...allScores) : 0;

  const scoreTrend = [
    ...standardAnalyses.map((a) => ({
      id: a._id,
      date: a.createdAt,
      label: new Date(a.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      atsScore: Math.round(a.atsScore || 0),
      type: 'standard',
      role: a.targetRole || 'General',
    })),
    ...aiAnalyses.map((a) => ({
      id: a._id,
      date: a.createdAt,
      label: new Date(a.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      atsScore: Math.round(a.atsScore || 0),
      type: 'ai',
      role: a.jobRole || 'AI Analysis',
    })),
  ]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-20);

  const dailyTrend = await ResumeAnalysis.aggregate([
    { $match: userFilter },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        avgAts: { $avg: '$atsScore' },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $limit: 30 },
  ]);

  const withBreakdown = standardAnalyses.filter((a) => a.formatScore != null);
  const breakdown = withBreakdown.length
    ? {
        format: Math.round(
          withBreakdown.reduce((s, a) => s + (a.formatScore || 0), 0) / withBreakdown.length
        ),
        keywords: Math.round(
          withBreakdown.reduce((s, a) => s + (a.keywordMatchScore || 0), 0) / withBreakdown.length
        ),
        sections: Math.round(
          withBreakdown.reduce((s, a) => s + (a.sectionScore || 0), 0) / withBreakdown.length
        ),
      }
    : null;

  const roleCounts = {};
  standardAnalyses.forEach((a) => {
    const role = a.targetRole || 'Unspecified';
    roleCounts[role] = (roleCounts[role] || 0) + 1;
  });
  const byRole = Object.entries(roleCounts)
    .map(([role, count]) => ({ role, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const recentAnalyses = [
    ...standardAnalyses.slice(0, 10).map((a) => ({
      _id: a._id,
      title: a.targetRole ? `${a.targetRole}` : 'Standard analysis',
      atsScore: a.atsScore,
      keywordScore: a.keywordMatchScore,
      formatScore: a.formatScore,
      missingCount: (a.missingSkills || []).length,
      type: 'standard',
      createdAt: a.createdAt,
    })),
    ...aiAnalyses.slice(0, 5).map((a) => ({
      _id: a._id,
      title: a.jobRole ? `${a.jobRole} (AI)` : 'AI analysis',
      atsScore: a.atsScore,
      keywordScore: null,
      formatScore: null,
      missingCount: null,
      type: 'ai',
      createdAt: a.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 8);

  const topMissingSkills = {};
  standardAnalyses.forEach((a) => {
    (a.missingSkills || []).forEach((skill) => {
      topMissingSkills[skill] = (topMissingSkills[skill] || 0) + 1;
    });
  });
  const frequentGaps = Object.entries(topMissingSkills)
    .map(([skill, count]) => ({ skill, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  res.json({
    summary: {
      totalAnalyses,
      totalResumes,
      avgAts,
      bestAts,
      standardCount: standardAnalyses.length,
      aiCount: aiAnalyses.length,
    },
    scoreTrend,
    dailyTrend: dailyTrend.map((d) => ({
      date: d._id?.slice(5) || d._id,
      fullDate: d._id,
      avgAts: Math.round(d.avgAts || 0),
      count: d.count,
    })),
    breakdown,
    byRole,
    recentAnalyses,
    frequentGaps,
  });
});

// ── Admin-only routes (unchanged — see all data) ──────────────────────────
router.get('/admin/resumes', requireAdmin, async (_req, res) => {
  const resumes = await Resume.find().sort({ createdAt: -1 }).limit(200).lean();
  res.json(resumes);
});

router.get('/admin/logs', requireAdmin, async (_req, res) => {
  const logs = await AdminLog.find().sort({ createdAt: -1 }).limit(100).lean();
  res.json(logs);
});

router.get('/admin/export', requireAdmin, async (_req, res) => {
  const resumes = await Resume.find().lean();
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Resumes');
  sheet.columns = [
    { header: 'Name', key: 'name', width: 20 },
    { header: 'Email', key: 'email', width: 28 },
    { header: 'Phone', key: 'phone', width: 16 },
    { header: 'Role', key: 'targetRole', width: 22 },
    { header: 'Category', key: 'targetCategory', width: 28 },
    { header: 'Created', key: 'createdAt', width: 22 },
  ];
  resumes.forEach((r) => sheet.addRow(r));
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=resumes_export.xlsx');
  await workbook.xlsx.write(res);
  res.end();
});

export default router;
