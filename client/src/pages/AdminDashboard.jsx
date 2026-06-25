import { useEffect, useState, useMemo } from 'react';
import PageHeader from '../components/PageHeader';
import Reveal from '../components/Reveal';
import CircularGauge from '../components/CircularGauge';
import AdminStatCard from '../components/admin/AdminStatCard';
import SystemHealthPanel from '../components/admin/SystemHealthPanel';
import UserDirectoryTable from '../components/admin/UserDirectoryTable';
import ConfirmActionModal from '../components/admin/ConfirmActionModal';
import ResumePreviewModal from '../components/admin/ResumePreviewModal';
import { ToastProvider, useToast } from '../components/admin/ToastProvider';
import api from '../api/client';

function AdminDashboardContent() {
  const [metrics, setMetrics] = useState({ totalUsers: 0, totalResumesAnalyzed: 0, activeSessions: 'N/A' });
  const [issues, setIssues] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const [isScanFinished, setIsScanFinished] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Modals state
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: null, user: null });
  const [selectedUser, setSelectedUser] = useState(null);

  const { addToast } = useToast();

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    // Scan beam animation timer
    if (!mediaQuery.matches) {
      const timer = setTimeout(() => setIsScanFinished(true), 2500);
      return () => clearTimeout(timer);
    } else {
      setIsScanFinished(true);
    }
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const [metricsRes, errorsRes, usersRes] = await Promise.all([
          api.get('/admin/metrics'),
          api.get('/admin/errors'),
          api.get('/admin/users'),
        ]);
        setMetrics(metricsRes.data);
        
        // Transform errors into issues for SystemHealthPanel
        const rawErrors = errorsRes.data.logs || [];
        const mappedIssues = rawErrors.slice(0, 5).map(err => ({
          severity: 'warning',
          title: err.message || 'System Error',
          description: err.stack ? err.stack.split('\n')[0] : '',
          service: err.service || 'backend-api',
          timeAgo: new Date(err.timestamp).toLocaleTimeString()
        }));
        setIssues(mappedIssues);

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
                            u.email.toLowerCase().includes(searchQuery.toLowerCase());
      const uStatus = u.isBanned ? 'Banned' : 'Active';
      const matchesStatus = statusFilter === 'All statuses' || uStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter, users]);

  // Actions
  const handleViewResume = async (user) => {
    try {
      const res = await api.get(`/admin/users/${user._id}/resume`, { responseType: 'blob' });
      const fileURL = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(
          `<iframe width='100%' height='100%' src='${fileURL}'></iframe>`
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
        const res = await api.post(`/admin/users/${user._id}/ban`);
        addToast(res.data.message || `User ban status updated`);
        // Optimistic update
        setUsers(users.map(u => u._id === user._id ? { ...u, isBanned: res.data.isBanned } : u));
      }
    } catch (err) {
      addToast('Action failed', 'error');
    }
    
    setConfirmModal({ isOpen: false, type: null, user: null });
  };

  if (loading) {
    return <div className="page-container p-8 text-center text-[#9ca3af] animate-pulse">Loading System Data...</div>;
  }

  return (
    <div className="page-container relative overflow-hidden">
      <Reveal>
        <div className="relative mb-8">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold gradient-text tracking-tight mb-2">Super Admin Console</h1>
            <p className="text-[#9ca3af] text-sm">System-wide analytics, health metrics, and user oversight.</p>
          </div>

          {/* Scan Beam */}
          {!prefersReducedMotion && !isScanFinished && (
            <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden rounded-2xl">
              <div className="absolute top-0 bottom-0 w-32 bg-gradient-to-r from-transparent via-[#00ffa3]/20 to-transparent blur-md -left-32 animate-[scan-beam_2.5s_ease-in-out_forwards]"></div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <AdminStatCard 
              title="Total users" 
              value={metrics.totalUsers.toLocaleString()} 
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
            />
            <AdminStatCard 
              title="Resumes analyzed" 
              value={metrics.totalResumesAnalyzed.toLocaleString()} 
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
            />
            <AdminStatCard 
              title="Active sessions" 
              value={metrics.activeSessions} 
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
              extra={<div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#00ffa3] scanly-dot" style={{width: '6px', height: '6px'}}></span> Nominal</div>}
            />
            <AdminStatCard 
              title="System health" 
              value={issues.length === 0 ? '100%' : '94%'} 
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
              extra={<span className="text-[#00ffa3] animate-pulse">Monitoring</span>}
            />
          </div>
        </div>
      </Reveal>

      <Reveal delay={80}>
        <SystemHealthPanel issues={issues} />
      </Reveal>

      <Reveal delay={120}>
        <UserDirectoryTable 
          users={filteredUsers}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          onViewResume={handleViewResume}
          onResetPassword={handleResetPassword}
          onForceExpire={openConfirmForceExpire}
          onBanUser={openConfirmBan}
        />
      </Reveal>

      <ConfirmActionModal 
        isOpen={confirmModal.isOpen}
        title={confirmModal.type === 'ban' ? (confirmModal.user?.isBanned ? 'Unban User' : 'Ban User') : 'Force Expire Session'}
        description={
          confirmModal.type === 'ban' 
            ? `Are you sure you want to ${confirmModal.user?.isBanned ? 'unban' : 'completely revoke access for'} ${confirmModal.user?.email}?`
            : `Are you sure you want to force expire all active sessions for ${confirmModal.user?.email}? This will immediately sign them out of all devices.`
        }
        confirmText={confirmModal.type === 'ban' ? (confirmModal.user?.isBanned ? 'Unban User' : 'Ban User') : 'Force Expire'}
        isDestructive={true}
        onConfirm={executeConfirmAction}
        onCancel={() => setConfirmModal({ isOpen: false, type: null, user: null })}
      />

      <ResumePreviewModal 
        isOpen={resumeModalOpen}
        user={selectedUser}
        onClose={() => setResumeModalOpen(false)}
      />
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
