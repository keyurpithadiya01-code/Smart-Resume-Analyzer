import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PageHeader from '../components/PageHeader';
import Reveal from '../components/Reveal';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({ totalUsers: 0, totalResumesAnalyzed: 0, activeSessions: 'N/A' });
  const [chartData, setChartData] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resetModal, setResetModal] = useState({ isOpen: false, userId: null, newPassword: '' });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [metricsRes, errorsRes, usersRes] = await Promise.all([
          api.get('/admin/metrics'),
          api.get('/admin/errors'),
          api.get('/admin/users'),
        ]);
        setMetrics(metricsRes.data);
        setChartData(errorsRes.data.chartData);
        setUsers(usersRes.data);
      } catch (error) {
        console.error('Failed to fetch admin data', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleBan = async (id) => {
    try {
      const res = await api.post(`/admin/users/${id}/ban`);
      setUsers(users.map(u => u._id === id ? { ...u, isBanned: res.data.isBanned } : u));
      alert(res.data.message);
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  const openResetModal = (id) => setResetModal({ isOpen: true, userId: id, newPassword: '' });
  const closeResetModal = () => setResetModal({ isOpen: false, userId: null, newPassword: '' });

  const confirmResetPassword = async () => {
    const { userId, newPassword } = resetModal;
    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    try {
      const res = await api.post(`/admin/users/${userId}/reset-password`, { newPassword });
      alert(res.data.message);
      closeResetModal();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleForceExpire = async (id) => {
    if (!window.confirm("Are you sure you want to force expire this user's sessions?")) return;
    try {
      const res = await api.post(`/admin/users/${id}/force-expire`);
      alert(res.data.message);
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleViewResume = async (id) => {
    try {
      const res = await api.get(`/admin/users/${id}/resume`, { responseType: 'blob' });
      const fileURL = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(
          `<iframe width='100%' height='100%' src='${fileURL}'></iframe>`
        );
      } else {
        alert('Please allow popups for this site to view the resume.');
      }
    } catch (err) {
      if (err.response?.status === 404) {
        alert('No resume found for this user.');
      } else {
        alert('Error fetching resume.');
      }
    }
  };

  if (loading) {
    return <div className="p-8 text-[#f0f0ec]">Loading Admin Dashboard...</div>;
  }

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-container mb-12">
      <PageHeader 
        title="Admin Control Panel" 
        subtitle="Manage users, monitor metrics, and view system health."
        badgeText="Superadmin Access"
      />

      {/* Password Reset Modal */}
      {resetModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0d14]/80 backdrop-blur-sm p-4">
          <div className="modern-card max-w-md w-full animate-fade-in border border-[#00ffa3]/20 shadow-[0_0_40px_-10px_rgba(0,255,163,0.15)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00ffa3] to-transparent"></div>
            <h2 className="text-2xl font-bold text-[#f0f0ec] mb-2">Reset Password</h2>
            <p className="text-[#8b97a6] mb-6 text-sm">Enter the new password for this user. An email will be sent to them automatically.</p>
            <input
              type="text"
              className="w-full bg-[#161d26] border border-[#232b35] rounded-xl px-4 py-3 text-[#f0f0ec] focus:outline-none focus:border-[#00ffa3]/50 focus:ring-1 focus:ring-[#00ffa3]/50 mb-8 transition-all"
              placeholder="New password (min 6 chars)"
              value={resetModal.newPassword}
              onChange={(e) => setResetModal({ ...resetModal, newPassword: e.target.value })}
            />
            <div className="flex gap-4 justify-end">
              <button 
                onClick={closeResetModal} 
                className="px-6 py-2.5 rounded-full font-medium text-[#8b97a6] hover:text-[#f0f0ec] hover:bg-[#161d26] transition-all duration-300"
              >
                Cancel
              </button>
              <button 
                onClick={confirmResetPassword} 
                className="px-6 py-2.5 rounded-full font-medium bg-[#00ffa3] text-[#10161d] hover:bg-[#00cc82] transition-all duration-300 shadow-[0_0_20px_-5px_rgba(0,255,163,0.4)] hover:shadow-[0_0_25px_-5px_rgba(0,255,163,0.6)] transform hover:-translate-y-0.5"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

      <Reveal>
        <div className="bento-grid cols-3 mb-8">
          <div className="stat-tile">
            <p className="stat-tile-value text-[#f0f0ec]">{metrics.totalUsers}</p>
            <p className="stat-tile-label">Total Users</p>
            <p className="stat-tile-hint">Registered accounts</p>
          </div>
          <div className="stat-tile">
            <p className="stat-tile-value text-[#f0f0ec]">{metrics.totalResumesAnalyzed}</p>
            <p className="stat-tile-label">Resumes Analyzed</p>
            <p className="stat-tile-hint">Across all platforms</p>
          </div>
          <div className="stat-tile">
            <p className="stat-tile-value text-[#f0f0ec]">{metrics.activeSessions}</p>
            <p className="stat-tile-label">Active Sessions</p>
            <p className="stat-tile-hint">System-wide logs</p>
          </div>
        </div>
      </Reveal>

      {/* Error Chart */}
      <Reveal delay={80}>
        {chartData.length > 0 ? (
          <div className="modern-card mb-8">
            <h3 className="section-card-title mb-6">System Error Rate</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#232b35" />
                  <XAxis dataKey="name" stroke="#8b97a6" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#8b97a6" fontSize={12} allowDecimals={false} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#10161d', borderColor: '#232b35', color: '#f0f0ec', borderRadius: 12, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
                    itemStyle={{ color: '#00ffa3' }}
                  />
                  <Line type="monotone" dataKey="errors" stroke="#ff4d4d" strokeWidth={3} activeDot={{ r: 8, fill: '#ff4d4d', stroke: '#10161d', strokeWidth: 2 }} dot={{ r: 4, fill: '#10161d', stroke: '#ff4d4d', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="modern-card mb-8 flex items-center gap-4 bg-gradient-to-r from-[#10161d] to-[#10161d]">
            <div className="w-12 h-12 rounded-full bg-[#00ffa3]/10 flex items-center justify-center shrink-0 border border-[#00ffa3]/20">
              <svg className="w-6 h-6 text-[#00ffa3]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#f0f0ec]">System is Healthy</h3>
              <p className="text-[#8b97a6] text-sm">No errors logged recently.</p>
            </div>
          </div>
        )}
      </Reveal>

      {/* User Directory */}
      <Reveal delay={120}>
        <div className="modern-card flex flex-col min-h-[500px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h3 className="section-card-title m-0">User Directory</h3>
              <p className="text-sm text-[#8b97a6] mt-1">Manage user accounts and system access</p>
            </div>
            <div className="relative w-full sm:w-72">
              <input 
                type="text" 
                placeholder="Search users by email or role..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#0a0d14] border border-[#232b35] text-[14px] rounded-full pl-11 pr-5 py-3 focus:outline-none focus:border-[#00ffa3]/50 focus:ring-1 focus:ring-[#00ffa3]/50 text-[#f0f0ec] w-full transition-all shadow-inner"
              />
              <svg className="w-5 h-5 text-[#8b97a6] absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          <div className="overflow-x-auto overflow-y-auto flex-1 rounded-2xl border border-[#232b35] bg-[#0a0d14]/50 shadow-inner">
            <table className="w-full text-left border-collapse whitespace-nowrap text-[15px] relative">
              <thead className="sticky top-0 bg-[#10161d] z-10 shadow-sm">
                <tr className="border-b border-[#232b35]">
                  <th className="py-5 pl-8 pr-4 font-semibold text-[#8b97a6] uppercase tracking-wider text-[11px]">Email</th>
                  <th className="py-5 px-4 font-semibold text-[#8b97a6] uppercase tracking-wider text-[11px]">Joined</th>
                  <th className="py-5 px-4 font-semibold text-[#8b97a6] uppercase tracking-wider text-[11px]">Status</th>
                  <th className="py-5 px-4 font-semibold text-[#8b97a6] uppercase tracking-wider text-[11px]">Role</th>
                  <th className="py-5 pr-8 pl-4 font-semibold text-[#8b97a6] uppercase tracking-wider text-[11px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="border-b border-[#232b35]/50 hover:bg-[#161d26]/80 transition-colors group">
                    <td className="py-6 pl-8 pr-4 font-medium text-[#f0f0ec]">{u.email}</td>
                    <td className="py-6 px-4 text-[#8b97a6]">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="py-6 px-4">
                      {u.isBanned ? (
                        <span className="px-3 py-1.5 text-[12px] font-semibold rounded-full bg-red-500/10 text-red-400 border border-red-500/20">Banned</span>
                      ) : (
                        <span className="px-3 py-1.5 text-[12px] font-semibold rounded-full bg-[#00ffa3]/10 text-[#00ffa3] border border-[#00ffa3]/20">Active</span>
                      )}
                    </td>
                    <td className="py-6 px-4 capitalize text-[#8b97a6]">{u.role}</td>
                    <td className="py-6 pr-8 pl-4 flex flex-wrap gap-3 justify-end items-center opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleViewResume(u._id)}
                        className="px-5 py-2.5 rounded-full border border-[#232b35] hover:border-[#00ffa3]/50 text-[#c9cbc5] hover:text-[#00ffa3] bg-[#10161d] hover:bg-[#00ffa3]/5 transition-all duration-300 font-semibold text-[13px] shadow-sm transform hover:-translate-y-0.5"
                      >
                        View Resume
                      </button>
                      <button
                        onClick={() => openResetModal(u._id)}
                        className="px-5 py-2.5 rounded-full border border-[#232b35] hover:border-[#f0f0ec]/50 text-[#c9cbc5] hover:text-white bg-[#10161d] hover:bg-white/5 transition-all duration-300 font-semibold text-[13px] shadow-sm transform hover:-translate-y-0.5"
                      >
                        Reset Password
                      </button>
                      <button
                        onClick={() => handleForceExpire(u._id)}
                        className="px-5 py-2.5 rounded-full border border-[#232b35] hover:border-yellow-400/50 text-[#c9cbc5] hover:text-yellow-400 bg-[#10161d] hover:bg-yellow-400/5 transition-all duration-300 font-semibold text-[13px] shadow-sm transform hover:-translate-y-0.5"
                      >
                        Force Expire
                      </button>
                      <button
                        onClick={() => handleBan(u._id)}
                        className={`px-5 py-2.5 rounded-full border transition-all duration-300 font-semibold text-[13px] bg-[#10161d] shadow-sm transform hover:-translate-y-0.5 ${
                          u.isBanned 
                            ? 'border-[#232b35] hover:border-[#00ffa3]/50 text-[#c9cbc5] hover:text-[#00ffa3] hover:bg-[#00ffa3]/5' 
                            : 'border-[#232b35] hover:border-red-400/50 text-[#c9cbc5] hover:text-red-400 hover:bg-red-400/5'
                        }`}
                      >
                        {u.isBanned ? 'Unban User' : 'Ban User'}
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-16 text-center text-[#8b97a6] text-lg">
                      <div className="flex flex-col items-center gap-3">
                        <svg className="w-12 h-12 text-[#232b35]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        {searchQuery ? 'No users found matching your search.' : 'No users found.'}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
