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

  const handleResetPassword = async (id) => {
    if (!window.confirm("Are you sure you want to reset this user's password?")) return;
    try {
      const res = await api.post(`/admin/users/${id}/reset-password`);
      alert(`Password reset successfully. New temporary password: ${res.data.tempPassword}\n\nPlease copy this and provide it to the user.`);
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
    <div className="p-4 sm:p-8 space-y-8 animate-fade-in text-[#f0f0ec]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Super Admin Dashboard</h1>
        <p className="text-[#6b7785]">Welcome back, {user?.name || user?.email}</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#10161d] border border-[#232b35] rounded-xl p-6 shadow-sm">
          <h3 className="text-[#6b7785] text-sm uppercase tracking-wider mb-2">Total Users</h3>
          <p className="text-3xl font-semibold text-[#00ffa3]">{metrics.totalUsers}</p>
        </div>
        <div className="bg-[#10161d] border border-[#232b35] rounded-xl p-6 shadow-sm">
          <h3 className="text-[#6b7785] text-sm uppercase tracking-wider mb-2">Total Resumes Analyzed</h3>
          <p className="text-3xl font-semibold text-[#00ffa3]">{metrics.totalResumesAnalyzed}</p>
        </div>
        <div className="bg-[#10161d] border border-[#232b35] rounded-xl p-6 shadow-sm">
          <h3 className="text-[#6b7785] text-sm uppercase tracking-wider mb-2">Active Sessions</h3>
          <p className="text-3xl font-semibold text-[#f0f0ec]">{metrics.activeSessions}</p>
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
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
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
                  <td className="p-4 flex gap-2 justify-end">
                    <button
                      onClick={() => handleViewResume(u._id)}
                      className="px-3 py-1.5 text-sm bg-[#1e2832] hover:bg-[#2a3642] border border-[#303e4d] rounded transition text-[#f0f0ec]"
                    >
                      View Resume
                    </button>
                    <button
                      onClick={() => handleResetPassword(u._id)}
                      className="px-3 py-1.5 text-sm bg-[#1e2832] hover:bg-[#2a3642] border border-[#303e4d] rounded transition text-[#f0f0ec]"
                    >
                      Reset Pass
                    </button>
                    <button
                      onClick={() => handleForceExpire(u._id)}
                      className="px-3 py-1.5 text-sm bg-[#1e2832] hover:bg-[#2a3642] border border-[#303e4d] rounded transition text-yellow-400"
                    >
                      Force Expire
                    </button>
                    <button
                      onClick={() => handleBan(u._id)}
                      className={`px-3 py-1.5 text-sm border rounded transition ${
                        u.isBanned 
                          ? 'bg-green-500/10 hover:bg-green-500/20 border-green-500/30 text-green-400' 
                          : 'bg-red-500/10 hover:bg-red-500/20 border-red-500/30 text-red-400'
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
