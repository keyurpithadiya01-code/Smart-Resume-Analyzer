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

// TODO: replace with API call
const mockMetrics = {
  totalUsers: '12,480',
  totalUsersTrend: '+124 this week',
  totalResumesAnalyzed: '38,902',
  totalResumesTrend: '+892 this week',
  activeSessions: '214',
  systemHealthScore: 94.6
};

// TODO: replace with API call
const mockIssues = [
  {
    severity: 'warning',
    title: 'OCR worker queue backlog',
    description: 'parsing slower than baseline',
    service: 'worker-pool-3',
    timeAgo: '12 min ago'
  },
  {
    severity: 'warning',
    title: 'Elevated latency on /analyze endpoint',
    description: '',
    service: 'api-gateway',
    timeAgo: '27 min ago'
  }
];

// TODO: replace with API call
const mockUsers = [
  { id: 1, name: 'Priya Patel', email: 'priya.patel@gmail.com', status: 'Active', lastActive: '2 min ago' },
  { id: 2, name: 'Noah Kim', email: 'noah.kim@proton.me', status: 'Inactive', lastActive: '9 days ago' },
  { id: 3, name: 'Ethan Brooks', email: 'ethan.brooks@gmail.com', status: 'Banned', lastActive: '31 days ago' },
  { id: 4, name: 'Sarah Chen', email: 'sarah.c@techcorp.io', status: 'Active', lastActive: '5 min ago' },
  { id: 5, name: 'Marcus Johnson', email: 'mjohnson99@yahoo.com', status: 'Inactive', lastActive: '14 days ago' },
];

function AdminDashboardContent() {
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

  const filteredUsers = useMemo(() => {
    return mockUsers.filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            u.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All statuses' || u.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  // Actions
  const handleViewResume = (user) => {
    setSelectedUser(user);
    setResumeModalOpen(true);
  };

  const handleResetPassword = (user) => {
    // Fire immediately
    addToast(`Password reset link sent to ${user.email}`);
  };

  const openConfirmForceExpire = (user) => {
    setConfirmModal({ isOpen: true, type: 'expire', user });
  };

  const openConfirmBan = (user) => {
    setConfirmModal({ isOpen: true, type: 'ban', user });
  };

  const executeConfirmAction = () => {
    const { type, user } = confirmModal;
    if (type === 'expire') {
      addToast(`Session force expired for ${user.name}`);
    } else if (type === 'ban') {
      addToast(`User ${user.name} has been banned`);
    }
    setConfirmModal({ isOpen: false, type: null, user: null });
  };

  return (
    <div className="page-container relative overflow-hidden">
      <Reveal>
        <div className="relative mb-8">
          {/* Scan Beam */}
          {!prefersReducedMotion && !isScanFinished && (
            <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden rounded-2xl">
              <div className="absolute top-0 bottom-0 w-32 bg-gradient-to-r from-transparent via-[#00ffa3]/20 to-transparent blur-md -left-32 animate-[scan-beam_2.5s_ease-in-out_forwards]"></div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <AdminStatCard 
              title="Total users" 
              value={mockMetrics.totalUsers} 
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
            />
            <AdminStatCard 
              title="Resumes analyzed" 
              value={mockMetrics.totalResumesAnalyzed} 
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
            />
            <AdminStatCard 
              title="Active sessions" 
              value={mockMetrics.activeSessions} 
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
              extra={<div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#00ffa3] scanly-dot" style={{width: '6px', height: '6px'}}></span> Active sessions</div>}
            />
            <AdminStatCard 
              title="System health" 
              value={`${mockMetrics.systemHealthScore}%`} 
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
              extra={<span className="text-[#8b949e]">•••</span>}
            />
          </div>
        </div>
      </Reveal>

      <Reveal delay={80}>
        <SystemHealthPanel issues={mockIssues} />
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
        title={confirmModal.type === 'ban' ? 'Ban User' : 'Force Expire Session'}
        description={
          confirmModal.type === 'ban' 
            ? `Are you sure you want to completely revoke access for ${confirmModal.user?.name}? This action is destructive and reversible only by an administrator.`
            : `Are you sure you want to force expire all active sessions for ${confirmModal.user?.name}? This will immediately sign them out of all devices.`
        }
        confirmText={confirmModal.type === 'ban' ? 'Ban User' : 'Force Expire'}
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
