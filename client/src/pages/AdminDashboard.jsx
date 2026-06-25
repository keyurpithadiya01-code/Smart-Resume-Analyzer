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
    <div className="min-h-screen bg-[#0a0a0a] font-sans text-neutral-300 pb-16">
      {/* Ultra Minimal Header */}
      <div className="bg-[#0a0a0a] border-b border-neutral-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-medium text-white tracking-tight">System Administration</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-neutral-500"></span>
            <span className="text-[11px] font-mono text-neutral-500 tracking-wider uppercase">Portal Secure</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 pt-10">
        {/* Password Reset Modal */}
        {resetModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="bg-[#111] border border-neutral-800 max-w-md w-full p-8">
              <h2 className="text-lg font-medium text-white mb-2">Reset User Password</h2>
              <p className="text-neutral-500 mb-6 text-sm">Enter the new password. The user will be notified automatically.</p>
              <input
                type="text"
                className="w-full bg-[#0a0a0a] border border-neutral-800 px-4 py-3 text-white focus:outline-none focus:border-neutral-600 mb-8 transition-colors text-sm"
                placeholder="New password (min 6 chars)"
                value={resetModal.newPassword}
                onChange={(e) => setResetModal({ ...resetModal, newPassword: e.target.value })}
              />
              <div className="flex gap-3 justify-end">
                <button 
                  onClick={closeResetModal} 
                  className="px-5 py-2 text-sm font-medium text-neutral-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmResetPassword} 
                  className="px-5 py-2 text-sm font-medium bg-white text-black hover:bg-neutral-200 transition-colors"
                >
                  Confirm Reset
                </button>
              </div>
            </div>
          </div>
        )}

        <Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Minimal Metric Cards */}
            <div className="bg-[#111] border border-neutral-800 p-6">
              <p className="text-neutral-500 text-xs font-medium tracking-widest uppercase mb-4">Total Users</p>
              <p className="text-3xl font-light text-white tracking-tight">{metrics.totalUsers}</p>
            </div>

            <div className="bg-[#111] border border-neutral-800 p-6">
              <p className="text-neutral-500 text-xs font-medium tracking-widest uppercase mb-4">Resumes Analyzed</p>
              <p className="text-3xl font-light text-white tracking-tight">{metrics.totalResumesAnalyzed}</p>
            </div>

            <div className="bg-[#111] border border-neutral-800 p-6">
              <p className="text-neutral-500 text-xs font-medium tracking-widest uppercase mb-4">Active Sessions</p>
              <p className="text-3xl font-light text-white tracking-tight">{metrics.activeSessions}</p>
            </div>
          </div>
        </Reveal>

        {/* System Error Rate */}
        <Reveal delay={80}>
          {chartData.length > 0 ? (
            <div className="bg-[#111] border border-neutral-800 p-6 mb-8">
              <h3 className="text-sm font-medium text-white mb-6">System Error Rate</h3>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                    <XAxis dataKey="name" stroke="#666" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                    <YAxis stroke="#666" fontSize={11} allowDecimals={false} tickLine={false} axisLine={false} dx={-10} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff', borderRadius: 0 }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Line type="monotone" dataKey="errors" stroke="#fff" strokeWidth={1.5} activeDot={{ r: 4, fill: '#fff', stroke: '#111', strokeWidth: 2 }} dot={{ r: 2, fill: '#111', stroke: '#fff', strokeWidth: 1.5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="bg-[#111] border border-neutral-800 p-6 mb-8 flex items-center gap-4">
              <div className="w-2 h-2 bg-neutral-500 rounded-full"></div>
              <div>
                <h3 className="text-sm font-medium text-white">System is Healthy</h3>
                <p className="text-neutral-500 text-xs mt-1">No errors logged recently. All services operational.</p>
              </div>
            </div>
          )}
        </Reveal>

        {/* Minimal User Directory */}
        <Reveal delay={120}>
          <div className="bg-[#111] border border-neutral-800 flex flex-col min-h-[600px]">
            <div className="p-6 border-b border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <h2 className="text-sm font-medium text-white tracking-tight">User Directory</h2>
              </div>
              <div className="relative w-full sm:w-80">
                <input 
                  type="text" 
                  placeholder="Search by email or role..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#0a0a0a] border border-neutral-800 text-xs px-4 py-2 focus:outline-none focus:border-neutral-600 text-white w-full transition-colors"
                />
              </div>
            </div>
            
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#111] sticky top-0 z-10">
                  <tr className="border-b border-neutral-800">
                    <th className="py-4 pl-6 pr-4 font-normal text-neutral-500 text-[11px] uppercase tracking-widest">Email Account</th>
                    <th className="py-4 px-4 font-normal text-neutral-500 text-[11px] uppercase tracking-widest">Date Joined</th>
                    <th className="py-4 px-4 font-normal text-neutral-500 text-[11px] uppercase tracking-widest">Status</th>
                    <th className="py-4 px-4 font-normal text-neutral-500 text-[11px] uppercase tracking-widest">Role</th>
                    <th className="py-4 pr-6 pl-4 font-normal text-neutral-500 text-[11px] uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/50">
                  {filteredUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-[#151515] transition-colors group">
                      <td className="py-5 pl-6 pr-4 font-medium text-neutral-200">{u.email}</td>
                      <td className="py-5 px-4 text-neutral-500 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="py-5 px-4">
                        <span className="text-[11px] font-medium tracking-wider uppercase text-neutral-400">
                          {u.isBanned ? 'Banned' : 'Active'}
                        </span>
                      </td>
                      <td className="py-5 px-4 capitalize text-neutral-500 text-xs">{u.role}</td>
                      <td className="py-5 pr-6 pl-4 flex flex-wrap gap-2 justify-end items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleViewResume(u._id)}
                          className="px-3 py-1.5 border border-neutral-800 hover:border-neutral-600 text-neutral-400 hover:text-white bg-transparent transition-colors text-[11px] uppercase tracking-wider font-medium"
                        >
                          Resume
                        </button>
                        <button
                          onClick={() => openResetModal(u._id)}
                          className="px-3 py-1.5 border border-neutral-800 hover:border-neutral-600 text-neutral-400 hover:text-white bg-transparent transition-colors text-[11px] uppercase tracking-wider font-medium"
                        >
                          Reset
                        </button>
                        <button
                          onClick={() => handleForceExpire(u._id)}
                          className="px-3 py-1.5 border border-neutral-800 hover:border-neutral-600 text-neutral-400 hover:text-white bg-transparent transition-colors text-[11px] uppercase tracking-wider font-medium"
                        >
                          Expire
                        </button>
                        <button
                          onClick={() => handleBan(u._id)}
                          className={`px-3 py-1.5 border border-neutral-800 hover:border-neutral-600 bg-transparent transition-colors text-[11px] uppercase tracking-wider font-medium ${
                            u.isBanned 
                              ? 'text-neutral-400 hover:text-white' 
                              : 'text-neutral-400 hover:text-white'
                          }`}
                        >
                          {u.isBanned ? 'Unban' : 'Ban'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-20 text-center text-neutral-600">
                        <p className="text-sm">{searchQuery ? 'No users found matching your query.' : 'No users found in the system.'}</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
