import { useEffect, useState, useMemo } from 'react';
import './AdminTheme.css'; // The extracted custom CSS
import SystemHealthPanel from '../components/admin/SystemHealthPanel';
import UserDirectoryTable from '../components/admin/UserDirectoryTable';
import { ToastProvider, useToast } from '../components/admin/ToastProvider';
import api from '../api/client';

function AdminDashboardContent() {
  const [metrics, setMetrics] = useState({ totalUsers: 0, totalResumesAnalyzed: 0, activeSessions: '214' });
  const [issues, setIssues] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All statuses');
  
  // Realtime clock
  const [time, setTime] = useState('--:--:--');

  // Modals state
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: null, user: null });
  const [selectedUser, setSelectedUser] = useState(null);

  const { addToast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const [metricsRes, errorsRes, usersRes] = await Promise.all([
          api.get('/admin/metrics'),
          api.get('/admin/errors'),
          api.get('/admin/users'),
        ]);
        
        const activeCount = metricsRes.data.activeSessions || 0;
        setMetrics({
          ...metricsRes.data,
          activeSessions: activeCount
        });
        
        const rawErrors = errorsRes.data.logs || [];
        const mappedIssues = rawErrors.slice(0, 5).map(err => ({
          severity: 'warning',
          title: err.message || 'System Error',
          description: err.stack ? err.stack.split('\n')[0] : '',
          service: err.service || 'backend-api',
          timeAgo: new Date(err.timestamp).toLocaleTimeString()
        }));
        setIssues(mappedIssues);
        setChartData(errorsRes.data.chartData || []);

        setUsers(usersRes.data);
      } catch (error) {
        console.error('Failed to fetch admin data', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase())) || 
                            (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()));
      const uStatus = u.isBanned ? 'Banned' : 'Active';
      const matchesStatus = statusFilter === 'All statuses' || uStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter, users]);

  const handleViewResume = async (user) => {
    try {
      const res = await api.get(`/admin/users/${user._id}/resume`, { responseType: 'blob' });
      const fileURL = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(
          `<iframe width='100%' height='100%' style='border:none;margin:0;padding:0;' src='${fileURL}'></iframe>`
        );
      } else {
        addToast('Please allow popups to view the resume', 'error');
      }
    } catch (err) {
      if (err.response?.status === 404) {
        addToast('No resume found for this user', 'error');
      } else {
        addToast('Error fetching resume', 'error');
      }
    }
  };

  const handleResetPassword = async (user) => {
    const newPassword = prompt(`Enter new password for ${user.email} (min 6 chars):`);
    if (!newPassword) return;
    if (newPassword.length < 6) {
      addToast('Password must be at least 6 characters', 'error');
      return;
    }
    try {
      const res = await api.post(`/admin/users/${user._id}/reset-password`, { newPassword });
      addToast(res.data.message || 'Password reset successfully');
    } catch (err) {
      addToast('Failed to reset password', 'error');
    }
  };

  const openConfirmForceExpire = (user) => {
    setConfirmModal({ isOpen: true, type: 'expire', user });
  };

  const openConfirmBan = (user) => {
    setConfirmModal({ isOpen: true, type: 'ban', user });
  };

  const executeConfirmAction = async () => {
    const { type, user } = confirmModal;
    try {
      if (type === 'expire') {
        const res = await api.post(`/admin/users/${user._id}/force-expire`);
        addToast(res.data.message || `Sessions expired for ${user.email}`);
      } else if (type === 'ban') {
        // Toggle ban
        const action = user.isBanned ? 'unban' : 'ban';
        const res = await api.post(`/admin/users/${user._id}/${action}`);
        addToast(res.data.message || `User ${action} successful`);
        setUsers(users.map(u => u._id === user._id ? { ...u, isBanned: !user.isBanned } : u));
      }
    } catch (err) {
      addToast('Action failed', 'error');
    }
    setConfirmModal({ isOpen: false, type: null, user: null });
  };

  if (loading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#69748a' }}>Loading Super Admin...</div>;
  }

  const systemHealthPct = issues.length === 0 ? 100 : 94.6;
  const healthRingOffset = 97.4 - (97.4 * (systemHealthPct / 100));

  return (
    <div className="app scanly-admin-theme">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.4" strokeLinecap="round"><path d="M4 7V4h16v3M4 17v3h16v-3M2 12h20" stroke="currentColor"/></svg>
          </div>
          <div>
            <div className="brand-name">Scanly</div>
            <div className="brand-sub">Super Admin</div>
          </div>
        </div>

        <div className="nav-section-label">Overview</div>
        <div className="nav-item active">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>
          Dashboard
        </div>
        <div className="nav-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          User Directory
        </div>
        <div className="nav-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          System Health
        </div>

        <div className="nav-section-label">Manage</div>
        <div className="nav-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
          Resume Audit Log
        </div>
        <div className="nav-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          Settings
        </div>

        <div className="sidebar-footer">
          <div className="admin-chip">
            <div className="admin-avatar">KP</div>
            <div>
              <div className="admin-name">Keyur P.</div>
              <div className="admin-role">super_admin</div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="main">
        <div className="topbar">
          <div>
            <div className="page-title">Super Admin</div>
            <div className="page-sub">/ overview — live snapshot</div>
          </div>
          <div className="topbar-right">
            <div className="scan-time">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              <span>{time}</span>
            </div>
          </div>
        </div>

        {/* STAT CARDS */}
        <div className="stats-row" style={{ position: 'relative' }}>
          <div className="scan-beam"></div>

          <div className="stat-card reveal" style={{ animationDelay: '.05s' }}>
            <div className="stat-top">
              <div className="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <div className="stat-trend">
                <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12l5-5 4 4 5-5"/></svg>
                4.2%
              </div>
            </div>
            <div className="stat-value">{(metrics.totalUsers || 0).toLocaleString()}</div>
            <div className="stat-label">Total users</div>
          </div>

          <div className="stat-card reveal" style={{ animationDelay: '.12s' }}>
            <div className="stat-top">
              <div className="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 13h6M9 17h6"/></svg>
              </div>
              <div className="stat-trend">
                <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12l5-5 4 4 5-5"/></svg>
                11.8%
              </div>
            </div>
            <div className="stat-value">{(metrics.totalResumesAnalyzed || 0).toLocaleString()}</div>
            <div className="stat-label">Resumes analyzed</div>
          </div>

          <div className="stat-card reveal" style={{ animationDelay: '.19s' }}>
            <div className="stat-top">
              <div className="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
              </div>
            </div>
            <div className="stat-value">{metrics.activeSessions}</div>
            <div className="live-dot-row">
              <span className="pulse-dot"></span>
              <span className="live-dot-label">Live now</span>
            </div>
            <div className="stat-label" style={{ marginTop: '8px' }}>Active sessions</div>
          </div>

          <div className="stat-card reveal" style={{ animationDelay: '.26s' }}>
            <div className="stat-top">
              <div className={`stat-icon ${issues.length > 0 ? 'amber' : ''}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 9v4M12 17h.01"/><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
              </div>
              <div className="score-ring-wrap">
                <svg viewBox="0 0 36 36">
                  <circle className="score-ring-track" cx="18" cy="18" r="15.5"></circle>
                  <circle className={`score-ring-fill ${issues.length > 0 ? 'warn' : ''}`} cx="18" cy="18" r="15.5" strokeDasharray="97.4" strokeDashoffset={healthRingOffset}></circle>
                </svg>
              </div>
            </div>
            <div className="stat-value" style={{ fontSize: '22px' }}>{systemHealthPct}<span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>%</span></div>
            <div className="stat-label">System health</div>
          </div>
        </div>

        <SystemHealthPanel issues={issues} />

        <UserDirectoryTable 
          users={filteredUsers}
          totalUsersCount={users.length}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          onViewResume={handleViewResume}
          onResetPassword={handleResetPassword}
          onForceExpire={openConfirmForceExpire}
          onBanUser={openConfirmBan}
        />
      </main>

      {/* CONFIRM MODAL */}
      <div className={`overlay ${confirmModal.isOpen ? 'show' : ''}`} onClick={(e) => { if(e.target.className.includes('overlay')) setConfirmModal({isOpen: false}) }}>
        <div className="modal">
          <div className={`modal-icon ${confirmModal.type === 'expire' ? 'warn' : ''}`}>
            {confirmModal.type === 'ban' ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M4.93 4.93l14.14 14.14"/></svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
            )}
          </div>
          <div className="modal-title">
            {confirmModal.type === 'ban' ? (confirmModal.user?.isBanned ? 'Unban this user?' : 'Ban this user?') : 'Force expire session?'}
          </div>
          <div className="modal-body">
            {confirmModal.type === 'ban' ? (
              <>This will immediately {confirmModal.user?.isBanned ? 'reinstate' : 'revoke access for'} <b>{confirmModal.user?.email}</b>.</>
            ) : (
              <><b>{confirmModal.user?.email}</b> will be signed out of every active device immediately and must log in again.</>
            )}
          </div>
          <div className="modal-actions">
            <button className="btn" onClick={() => setConfirmModal({isOpen: false})}>Cancel</button>
            <button className={`btn ${confirmModal.type === 'ban' ? 'danger' : 'warn'}`} onClick={executeConfirmAction}>
              {confirmModal.type === 'ban' ? (confirmModal.user?.isBanned ? 'Unban user' : 'Ban user') : 'Force expire'}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

export default function AdminDashboard() {
  return (
    <ToastProvider>
      <AdminDashboardContent />
    </ToastProvider>
  );
}
