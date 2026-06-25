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
      {/* Boss-Level Premium Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#161d26] to-[#0a0d14] border border-[#232b35] rounded-3xl p-8 mb-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500 opacity-[0.03] rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500 opacity-[0.02] rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between relative z-10 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-[11px] font-mono tracking-[0.2em] text-green-400 uppercase font-semibold">System Online</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent mb-2 tracking-tight">Master Control Panel</h1>
            <p className="text-[#8b97a6] text-sm max-w-xl leading-relaxed">Welcome back, Boss. You have full root access to the entire Scanly ecosystem. Monitor metrics, enforce security protocols, and manage all users across the platform.</p>
          </div>
          
          <div className="hidden md:flex px-6 py-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex-col items-end backdrop-blur-md">
            <span className="text-amber-500/80 text-[10px] font-mono tracking-widest uppercase mb-1">Clearance Level</span>
            <span className="text-amber-400 font-bold tracking-widest text-lg lg:text-xl">OMEGA / ROOT</span>
          </div>
        </div>
      </div>
      
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

      <Reveal>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          
          {/* Metrics Cards */}
          <div className="bento-grid cols-2 h-full">
            <div className="stat-tile border-l-2 border-l-amber-500/50 hover:border-l-amber-400 transition-colors bg-gradient-to-br from-[#10161d] to-[#0a0d14]">
              <p className="stat-tile-value text-amber-400">{metrics.totalUsers}</p>
              <p className="stat-tile-label">Total Users</p>
              <p className="stat-tile-hint">Registered accounts</p>
            </div>
            <div className="stat-tile border-l-2 border-l-amber-500/50 hover:border-l-amber-400 transition-colors bg-gradient-to-br from-[#10161d] to-[#0a0d14]">
              <p className="stat-tile-value text-amber-400">{metrics.totalResumesAnalyzed}</p>
              <p className="stat-tile-label">Resumes Analyzed</p>
              <p className="stat-tile-hint">Across all users</p>
            </div>
            <div className="stat-tile col-span-2 border-l-2 border-l-amber-500/50 hover:border-l-amber-400 transition-colors bg-gradient-to-br from-[#10161d] to-[#0a0d14]">
              <p className="stat-tile-value text-amber-400">{metrics.activeSessions}</p>
              <p className="stat-tile-label">Active Sessions</p>
              <p className="stat-tile-hint">System-wide logs</p>
            </div>
          </div>

          {/* Error Chart */}
          <div className="modern-card flex flex-col justify-center">
            <h3 className="section-card-title mb-4">System Error Rate</h3>
            {chartData.length > 0 ? (
              <div className="flex-1 w-full min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#232b35" />
                    <XAxis dataKey="name" stroke="#6b7785" fontSize={11} />
                    <YAxis stroke="#6b7785" fontSize={11} allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#10161d', borderColor: '#232b35', color: '#f0f0ec', borderRadius: 12 }}
                      itemStyle={{ color: '#00ffa3' }}
                    />
                    <Line type="monotone" dataKey="errors" stroke="#ff4d4d" strokeWidth={2} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center flex-1 py-12">
                <div className="text-center text-[#6b7785] bg-[#161d26]/50 rounded-xl p-6 border border-[#232b35]">
                  <p className="text-[#00ffa3] mb-2">
                    <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                  </p>
                  No errors logged recently. System is healthy!
                </div>
              </div>
            )}
          </div>
        </div>
      </Reveal>

      {/* User Directory */}
      <Reveal delay={120}>
      <div className="modern-card mt-6 flex flex-col max-h-[600px]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="section-card-title m-0">User Directory</h3>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search users by email or role..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#0b0f14] border border-[#232b35] text-sm rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:border-[#00ffa3] text-[#f0f0ec] w-full sm:w-64 transition-colors"
            />
            <svg className="w-4 h-4 text-[#6b7785] absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        <div className="overflow-x-auto overflow-y-auto flex-1 rounded-xl border border-[#232b35]">
          <table className="w-full text-left border-collapse whitespace-nowrap text-[15px] relative">
            <thead className="sticky top-0 bg-[#0b0f14] z-10 shadow-sm">
              <tr className="border-b border-[#232b35] text-[#6b7785]">
                <th className="py-4 pl-6 pr-4 font-medium uppercase tracking-wider text-xs">Email</th>
                <th className="p-4 font-medium uppercase tracking-wider text-xs">Joined</th>
                <th className="p-4 font-medium uppercase tracking-wider text-xs">Status</th>
                <th className="p-4 font-medium uppercase tracking-wider text-xs">Role</th>
                <th className="py-4 pr-6 pl-4 font-medium uppercase tracking-wider text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
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
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-16 text-center text-[#6b7785] text-lg">
                    {searchQuery ? 'No users found matching your search.' : 'No users found.'}
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
