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

  return (
    <div className="page-container mb-12">
      <PageHeader
        eyebrow="Scanly · Admin"
        title="Super Admin Dashboard"
        subtitle={`Welcome back, ${user?.name || user?.email}`}
      />
      
      {/* Password Reset Modal */}
      {resetModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#10161d] border border-[#232b35] rounded-2xl p-8 max-w-md w-full shadow-2xl animate-fade-in">
            <h2 className="text-2xl font-bold text-[#f0f0ec] mb-2">Reset Password</h2>
            <p className="text-[#6b7785] mb-6 text-sm">Enter the new password for this user. An email will be sent to them automatically.</p>
            <input
              type="text"
              className="w-full bg-[#0b0f14] border border-[#232b35] rounded-xl px-4 py-3 text-[#f0f0ec] focus:outline-none focus:border-[#00ffa3] mb-8 transition-colors"
              placeholder="New password (min 6 chars)"
              value={resetModal.newPassword}
              onChange={(e) => setResetModal({ ...resetModal, newPassword: e.target.value })}
            />
            <div className="flex gap-4 justify-end">
              <button onClick={closeResetModal} className="px-5 py-2.5 rounded-xl font-medium text-[#6b7785] hover:text-[#f0f0ec] hover:bg-[#161d26] transition-all">Cancel</button>
              <button onClick={confirmResetPassword} className="px-5 py-2.5 rounded-xl font-medium bg-[#00ffa3] text-[#10161d] hover:bg-[#00cc82] transition-all transform hover:-translate-y-0.5 shadow-lg shadow-[#00ffa3]/20">Confirm Reset</button>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Cards */}
      <Reveal>
        <div className="bento-grid cols-3 mt-4">
          <div className="stat-tile">
            <p className="stat-tile-value">{metrics.totalUsers}</p>
            <p className="stat-tile-label">Total Users</p>
            <p className="stat-tile-hint">Registered accounts</p>
          </div>
          <div className="stat-tile">
            <p className="stat-tile-value">{metrics.totalResumesAnalyzed}</p>
            <p className="stat-tile-label">Resumes Analyzed</p>
            <p className="stat-tile-hint">Across all users</p>
          </div>
          <div className="stat-tile">
            <p className="stat-tile-value">{metrics.activeSessions}</p>
            <p className="stat-tile-label">Active Sessions</p>
            <p className="stat-tile-hint">System-wide logs</p>
          </div>
        </div>
      </Reveal>

      {/* Error Chart */}
      <Reveal delay={80}>
      <div className="modern-card mt-6">
        <h3 className="section-card-title">System Error Rate</h3>
        {chartData.length > 0 ? (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#232b35" />
                <XAxis dataKey="name" stroke="#6b7785" />
                <YAxis stroke="#6b7785" allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#10161d', borderColor: '#232b35', color: '#f0f0ec' }}
                  itemStyle={{ color: '#00ffa3' }}
                />
                <Line type="monotone" dataKey="errors" stroke="#ff4d4d" strokeWidth={2} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center text-[#6b7785] py-12">No errors logged recently. System is healthy!</div>
        )}
      </div>
      </Reveal>

      {/* User Directory */}
      <Reveal delay={120}>
      <div className="modern-card mt-6">
        <h3 className="section-card-title mb-6">User Directory</h3>
        <div className="overflow-x-auto pb-6">
          <table className="w-full text-left border-collapse whitespace-nowrap text-[15px]">
            <thead>
              <tr className="border-b border-[#232b35] text-[#6b7785]">
                <th className="py-4 pl-6 pr-4 font-medium uppercase tracking-wider text-xs">Email</th>
                <th className="p-4 font-medium uppercase tracking-wider text-xs">Joined</th>
                <th className="p-4 font-medium uppercase tracking-wider text-xs">Status</th>
                <th className="p-4 font-medium uppercase tracking-wider text-xs">Role</th>
                <th className="py-4 pr-6 pl-4 font-medium uppercase tracking-wider text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-[#232b35] hover:bg-[#161d26]/60 transition-colors">
                  <td className="py-6 pl-6 pr-4 font-medium">{u.email}</td>
                  <td className="p-4 text-[#c9cbc5]">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    {u.isBanned ? (
                      <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-red-500/10 text-red-400 border border-red-500/20">Banned</span>
                    ) : (
                      <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-green-500/10 text-green-400 border border-green-500/20">Active</span>
                    )}
                  </td>
                  <td className="p-4 capitalize text-[#c9cbc5]">{u.role}</td>
                  <td className="py-4 pr-6 pl-4 flex flex-wrap gap-3 justify-end items-center">
                    <button
                      onClick={() => handleViewResume(u._id)}
                      className="px-5 py-2.5 rounded-full border border-[#232b35] hover:border-[#00ffa3]/50 text-[#f0f0ec] hover:text-[#00ffa3] bg-transparent hover:bg-[#00ffa3]/5 transition-all duration-300 font-semibold text-[13px]"
                      title="View Resume"
                    >
                      View
                    </button>
                    <button
                      onClick={() => openResetModal(u._id)}
                      className="px-5 py-2.5 rounded-full border border-[#232b35] hover:border-[#f0f0ec]/50 text-[#f0f0ec] hover:text-white bg-transparent hover:bg-white/5 transition-all duration-300 font-semibold text-[13px]"
                      title="Reset Password"
                    >
                      Reset Pass
                    </button>
                    <button
                      onClick={() => handleForceExpire(u._id)}
                      className="px-5 py-2.5 rounded-full border border-[#232b35] hover:border-yellow-400/50 text-[#f0f0ec] hover:text-yellow-400 bg-transparent hover:bg-yellow-400/5 transition-all duration-300 font-semibold text-[13px]"
                      title="Force Expire Sessions"
                    >
                      Expire
                    </button>
                    <button
                      onClick={() => handleBan(u._id)}
                      className={`px-5 py-2.5 rounded-full border transition-all duration-300 font-semibold text-[13px] bg-transparent ${
                        u.isBanned 
                          ? 'border-[#232b35] hover:border-green-400/50 text-[#f0f0ec] hover:text-green-400 hover:bg-green-400/5' 
                          : 'border-[#232b35] hover:border-red-400/50 text-[#f0f0ec] hover:text-red-400 hover:bg-red-400/5'
                      }`}
                    >
                      {u.isBanned ? 'Unban' : 'Ban'}
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-[#6b7785] text-lg">No users found.</td>
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
