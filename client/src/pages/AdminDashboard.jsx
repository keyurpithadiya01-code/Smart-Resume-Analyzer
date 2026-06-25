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
    <div className="page-container mb-12 max-w-[1400px]">
      <h1 className="text-2xl font-semibold mb-6 text-[#f0f0ec] tracking-tight">Admin Panel</h1>
        
      <Reveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-[#10161d] border border-[#232b35] rounded-xl p-5 flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-[#161d26] rounded-xl border border-[#232b35]">
              <svg className="w-6 h-6 text-[#8b97a6]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
            <div>
              <p className="text-lg font-bold text-[#f0f0ec]">{metrics.totalUsers} <span className="font-normal text-[15px]">Total Users</span></p>
              <p className="text-[13px] text-[#6b7785]">Registered Users</p>
            </div>
          </div>
          <div className="bg-[#10161d] border border-[#232b35] rounded-xl p-5 flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-[#161d26] rounded-xl border border-[#232b35]">
              <svg className="w-6 h-6 text-[#8b97a6]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <div>
              <p className="text-lg font-bold text-[#f0f0ec]">{metrics.totalResumesAnalyzed} <span className="font-normal text-[15px]">Resumes Analysed</span></p>
              <p className="text-[13px] text-[#6b7785]">Across Platforms</p>
            </div>
          </div>
          <div className="bg-[#10161d] border border-[#232b35] rounded-xl p-5 flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-[#161d26] rounded-xl border border-[#232b35]">
              <svg className="w-6 h-6 text-[#8b97a6]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" /></svg>
            </div>
            <div>
              <p className="text-lg font-bold text-[#f0f0ec]">{metrics.activeSessions} <span className="font-normal text-[15px]">Active Sessions</span></p>
              <p className="text-[13px] text-[#6b7785]">System-wide logs</p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Error Chart or Status Banner */}
      <Reveal delay={80}>
        {chartData.length > 0 ? (
          <div className="modern-card mt-4 mb-6">
            <h3 className="section-card-title mb-4">System Error Rate</h3>
            <div className="h-[200px] w-full">
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
          </div>
        ) : (
          <div className="bg-[#10161d] border border-[#232b35] rounded-xl p-4 mb-6 flex items-center gap-3 shadow-sm">
            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shrink-0">
              <svg className="w-3.5 h-3.5 text-[#10161d]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            </div>
            <p className="text-[15px] text-[#f0f0ec]"><span className="font-bold">System Error Rate:</span> No errors logged recently. System is healthy!</p>
          </div>
        )}
      </Reveal>

      {/* User Directory */}
      <Reveal delay={120}>
      <div className="flex flex-col h-[calc(100vh-320px)] min-h-[500px]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#10161d] border border-[#232b35] text-[13px] rounded-lg pl-9 pr-4 py-1.5 focus:outline-none focus:border-[#00ffa3] text-[#f0f0ec] w-full sm:w-64 transition-colors"
              />
              <svg className="w-4 h-4 text-[#6b7785] absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <span className="text-[13px] text-[#6b7785]">{filteredUsers.length} Results</span>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-3 py-1.5 border border-[#232b35] rounded-lg text-[13px] text-[#f0f0ec] hover:bg-[#161d26] transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
              Filter
            </button>
            <div className="flex items-center gap-2 text-[#6b7785] text-[13px]">
              <div className="px-3 py-1.5 border border-[#232b35] rounded-lg bg-[#10161d]">10 <span className="text-[10px]">▼</span></div>
              <span>Per Page</span>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto overflow-y-auto flex-1 rounded-xl border border-[#232b35] bg-[#10161d] shadow-sm">
          <table className="w-full text-left border-collapse whitespace-nowrap text-[14px] relative">
            <thead className="sticky top-0 bg-[#10161d] z-10 shadow-sm">
              <tr className="border-b border-[#232b35] text-[#6b7785]">
                <th className="py-3 pl-6 pr-4 font-semibold uppercase tracking-wider text-[11px]">Email</th>
                <th className="p-3 font-semibold uppercase tracking-wider text-[11px]">Joined</th>
                <th className="p-3 font-semibold uppercase tracking-wider text-[11px]">Status</th>
                <th className="p-3 font-semibold uppercase tracking-wider text-[11px]">Role</th>
                <th className="py-3 pr-6 pl-4 font-semibold uppercase tracking-wider text-[11px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u._id} className="border-b border-[#232b35] hover:bg-[#161d26]/60 transition-colors">
                  <td className="py-4 pl-6 pr-4 text-[#f0f0ec]">{u.email}</td>
                  <td className="p-4 text-[#c9cbc5]">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    {u.isBanned ? (
                      <span className="px-2.5 py-1 text-[11px] font-medium rounded-full bg-red-500/10 text-red-500 border border-red-500/20">Banned</span>
                    ) : (
                      <span className="px-2.5 py-1 text-[11px] font-medium rounded-full bg-green-500/10 text-green-500 border border-green-500/20">Active</span>
                    )}
                  </td>
                  <td className="p-4 capitalize text-[#c9cbc5]">{u.role}</td>
                  <td className="py-4 pr-6 pl-4 flex gap-4 items-center">
                    <button
                      onClick={() => handleViewResume(u._id)}
                      className="flex items-center gap-1.5 text-[#8b97a6] hover:text-[#f0f0ec] transition-colors text-[13px]"
                      title="View Resume"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      View
                    </button>
                    <button
                      onClick={() => openResetModal(u._id)}
                      className="flex items-center gap-1.5 text-[#8b97a6] hover:text-[#f0f0ec] transition-colors text-[13px]"
                      title="Reset Password"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                      R Pass
                    </button>
                    <button
                      onClick={() => handleForceExpire(u._id)}
                      className="flex items-center gap-1.5 text-[#8b97a6] hover:text-[#f0f0ec] transition-colors text-[13px]"
                      title="Force Expire Sessions"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Expire
                    </button>
                    <button
                      onClick={() => handleBan(u._id)}
                      className={`flex items-center gap-1.5 transition-colors text-[13px] ${
                        u.isBanned ? 'text-green-500/80 hover:text-green-400' : 'text-red-500/80 hover:text-red-400'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
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
