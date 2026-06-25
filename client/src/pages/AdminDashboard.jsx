import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
    <div className="w-full min-h-screen p-4 sm:p-8 md:p-12 lg:p-16 space-y-12 animate-fade-in text-[#f0f0ec]">
      
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

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Super Admin Dashboard</h1>
        <p className="text-[#6b7785]">Welcome back, {user?.name || user?.email}</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
        <div className="relative overflow-hidden bg-gradient-to-b from-[#161d26] to-[#10161d] border border-[#232b35] hover:border-[#00ffa3]/30 rounded-2xl p-6 shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00ffa3] opacity-[0.03] rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
          <h3 className="text-[#6b7785] text-xs font-semibold uppercase tracking-widest mb-3">Total Users</h3>
          <p className="text-4xl font-bold text-[#f0f0ec] tracking-tight">{metrics.totalUsers}</p>
        </div>
        <div className="relative overflow-hidden bg-gradient-to-b from-[#161d26] to-[#10161d] border border-[#232b35] hover:border-[#00ffa3]/30 rounded-2xl p-6 shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00ffa3] opacity-[0.03] rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
          <h3 className="text-[#6b7785] text-xs font-semibold uppercase tracking-widest mb-3">Total Resumes Analyzed</h3>
          <p className="text-4xl font-bold text-[#f0f0ec] tracking-tight">{metrics.totalResumesAnalyzed}</p>
        </div>
        <div className="relative overflow-hidden bg-gradient-to-b from-[#161d26] to-[#10161d] border border-[#232b35] hover:border-[#00ffa3]/30 rounded-2xl p-6 shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00ffa3] opacity-[0.03] rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
          <h3 className="text-[#6b7785] text-xs font-semibold uppercase tracking-widest mb-3">Active Sessions</h3>
          <p className="text-4xl font-bold text-[#f0f0ec] tracking-tight">{metrics.activeSessions}</p>
        </div>
      </div>

      {/* Error Chart */}
      <div className="bg-[#10161d] border border-[#232b35] rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-6">System Error Rate</h2>
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

      {/* User Directory */}
      <div className="bg-[#10161d] border border-[#232b35] rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-[#232b35]">
          <h2 className="text-xl font-bold">User Directory</h2>
        </div>
        <div className="overflow-x-auto pb-4">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-[#0b0f14] border-b border-[#232b35]">
                <th className="p-4 font-medium text-[#6b7785]">Email</th>
                <th className="p-4 font-medium text-[#6b7785]">Joined</th>
                <th className="p-4 font-medium text-[#6b7785]">Status</th>
                <th className="p-4 font-medium text-[#6b7785]">Role</th>
                <th className="p-4 font-medium text-[#6b7785] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-[#232b35] hover:bg-[#161d26] transition-colors">
                  <td className="p-4">{u.email}</td>
                  <td className="p-4">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    {u.isBanned ? (
                      <span className="px-2 py-1 text-xs rounded-full bg-red-500/10 text-red-400 border border-red-500/20">Banned</span>
                    ) : (
                      <span className="px-2 py-1 text-xs rounded-full bg-green-500/10 text-green-400 border border-green-500/20">Active</span>
                    )}
                  </td>
                  <td className="p-4 capitalize">{u.role}</td>
                  <td className="p-4 flex flex-wrap gap-3 justify-end items-center">
                    <button
                      onClick={() => handleViewResume(u._id)}
                      className="px-4 py-2 bg-[#1e2832]/50 hover:bg-[#00ffa3] hover:text-[#10161d] text-[#00ffa3] border border-[#00ffa3]/20 rounded-lg shadow-sm transition-all duration-300 transform hover:-translate-y-1 text-sm font-medium"
                      title="View Resume"
                    >
                      View
                    </button>
                    <button
                      onClick={() => openResetModal(u._id)}
                      className="px-4 py-2 bg-[#1e2832]/50 hover:bg-[#f0f0ec] hover:text-[#10161d] text-[#f0f0ec] border border-[#232b35] rounded-lg shadow-sm transition-all duration-300 transform hover:-translate-y-1 text-sm font-medium"
                      title="Reset Password"
                    >
                      Reset Pass
                    </button>
                    <button
                      onClick={() => handleForceExpire(u._id)}
                      className="px-4 py-2 bg-[#1e2832]/50 hover:bg-yellow-400 hover:text-[#10161d] text-yellow-400 border border-yellow-400/20 rounded-lg shadow-sm transition-all duration-300 transform hover:-translate-y-1 text-sm font-medium"
                      title="Force Expire Sessions"
                    >
                      Expire
                    </button>
                    <button
                      onClick={() => handleBan(u._id)}
                      className={`px-4 py-2 rounded-lg shadow-sm transition-all duration-300 transform hover:-translate-y-1 text-sm font-medium border bg-[#1e2832]/50 ${
                        u.isBanned 
                          ? 'text-green-400 border-green-400/20 hover:bg-green-400 hover:text-[#10161d]' 
                          : 'text-red-400 border-red-400/20 hover:bg-red-400 hover:text-[#10161d]'
                      }`}
                    >
                      {u.isBanned ? 'Unban' : 'Ban'}
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-[#6b7785]">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
