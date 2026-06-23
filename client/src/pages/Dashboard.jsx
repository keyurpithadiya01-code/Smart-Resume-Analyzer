import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import api from '../api/client';
import PageHeader from '../components/PageHeader';
import Reveal from '../components/Reveal';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [adminResumes, setAdminResumes] = useState([]);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    api.get('/dashboard/stats').then(({ data }) => setStats(data));
    if (isAdmin) {
      api.get('/dashboard/admin/resumes').then(({ data }) => setAdminResumes(data));
      api.get('/dashboard/admin/logs').then(({ data }) => setLogs(data));
    }
  }, [isAdmin]);

  async function exportExcel() {
    const { data } = await api.get('/dashboard/admin/export', { responseType: 'blob' });
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resumes_export.xlsx';
    a.click();
  }

  if (!stats) {
    return (
      <div className="page-container">
        <p className="text-[#6b7785]">Loading reports…</p>
      </div>
    );
  }

  const categoryData = (stats.byCategory || []).map((c) => ({
    name: c._id?.slice(0, 12) || 'Other',
    count: c.count,
  }));

  return (
    <div className="page-container">
      <PageHeader
        eyebrow="Scanly · Reports"
        title="Reports"
        subtitle="Analytics and admin tools for your resume data."
      />
      <Reveal>
      <div className="bento-grid cols-4">
        {[
          ['Total Resumes', stats.totalResumes],
          ['Avg ATS %', stats.avgAts],
          ['High Performing', stats.highPerforming],
          ['Success Rate %', stats.successRate],
        ].map(([label, val]) => (
          <div key={label} className="stat-tile">
            <p className="stat-tile-value">{val}</p>
            <p className="stat-tile-label">{label}</p>
          </div>
        ))}
      </div>
      </Reveal>
      {categoryData.length > 0 && (
        <Reveal delay={80}>
        <div className="modern-card h-72 mt-6">
          <h3 className="section-card-title">By Category</h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={categoryData}>
              <XAxis dataKey="name" stroke="#6b7785" fontSize={11} />
              <YAxis stroke="#6b7785" fontSize={11} />
              <Tooltip contentStyle={{ background: '#10161d', border: '1px solid #232b35', borderRadius: 12 }} />
              <Bar dataKey="count" fill="#00ffa3" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        </Reveal>
      )}
      {stats.weekly?.length > 0 && (
        <Reveal delay={120}>
        <div className="modern-card h-72 mt-6">
          <h3 className="section-card-title">Weekly ATS Trend</h3>
          <ResponsiveContainer width="100%" height="90%">
            <LineChart data={stats.weekly}>
              <XAxis dataKey="_id" stroke="#6b7785" fontSize={10} />
              <YAxis stroke="#6b7785" fontSize={11} />
              <Tooltip contentStyle={{ background: '#10161d', border: '1px solid #232b35', borderRadius: 12 }} />
              <Line type="monotone" dataKey="avgAts" stroke="#00ffa3" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        </Reveal>
      )}
      {isAdmin && (
        <Reveal delay={160}>
        <div className="space-y-6 mt-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-[#f0f0ec]">Admin Panel</h2>
            <button type="button" onClick={exportExcel} className="btn-primary text-sm">Export Excel</button>
          </div>
          <div className="modern-card overflow-x-auto">
            <h3 className="font-semibold mb-3 text-[#f0f0ec]">Recent Submissions</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[#6b7785] border-b border-[#232b35]">
                  <th className="py-2">Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {adminResumes.slice(0, 20).map((r) => (
                  <tr key={r._id} className="border-b border-[#232b35]/50 hover:bg-[#161d26]/50">
                    <td className="py-2">{r.name}</td>
                    <td>{r.email}</td>
                    <td>{r.targetRole}</td>
                    <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="modern-card">
            <h3 className="font-semibold mb-3 text-[#f0f0ec]">Admin Logs</h3>
            <ul className="text-sm space-y-1 text-[#c9cbc5]">
              {logs.map((l) => (
                <li key={l._id}>
                  {l.adminEmail} — {l.action} — {new Date(l.createdAt).toLocaleString()}
                </li>
              ))}
            </ul>
          </div>
        </div>
        </Reveal>
      )}
    </div>
  );
}
