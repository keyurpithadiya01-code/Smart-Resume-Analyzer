import React, { useState } from 'react';

export default function UserDirectoryTable({ 
  users = [], 
  searchQuery, 
  setSearchQuery, 
  statusFilter, 
  setStatusFilter,
  onViewResume,
  onResetPassword,
  onForceExpire,
  onBanUser,
  totalUsersCount
}) {
  const [openActionId, setOpenActionId] = useState(null);

  const statusBadge = (u) => {
    if (u.isBanned) return <div className="status-badge banned"><span className="dot"></span>Banned</div>;
    if (u.tokenVersion > 0) return <div className="status-badge active"><span className="dot"></span>Live now</div>;
    return <div className="status-badge inactive"><span className="dot"></span>Inactive</div>;
  };

  const timeAgo = (dateStr) => {
    if (!dateStr) return 'Never';
    const mins = Math.round((new Date() - new Date(dateStr)) / 60000);
    if (mins <= 0) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (mins < 1440) return `${Math.round(mins/60)}h ago`;
    return `${Math.round(mins/1440)}d ago`;
  };

  const initials = (name) => {
    if (!name) return 'U';
    return name.substring(0, 2).toUpperCase();
  };

  const toggleActions = (id) => {
    setOpenActionId(openActionId === id ? null : id);
  };

  return (
    <div className="directory">
      <div className="directory-head">
        <div>
          <div className="directory-title">User directory</div>
          <div className="directory-count">{(totalUsersCount || users.length).toLocaleString()} users · showing {users.length}</div>
        </div>
        <div className="directory-controls">
          <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All statuses">All statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Banned">Banned</option>
          </select>
          <div className="search-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/></svg>
            <input 
              type="text" 
              placeholder="Search name or email…" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoComplete="off"
            />
          </div>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Last active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? users.map((u, i) => (
              <tr key={u._id || i}>
                <td>
                  <div className="user-cell">
                    <div className="user-avatar">{initials(u.name || u.email)}</div>
                    <div>
                      <div className="user-name">{u.name || 'User'}</div>
                    </div>
                  </div>
                </td>
                <td className="email-cell">{u.email}</td>
                <td>{statusBadge(u)}</td>
                <td className="user-meta">{timeAgo(u.lastLogin || u.createdAt)}</td>
                <td>
                  <div className="action-row desktop-actions">
                    <div className="icon-btn" onClick={() => onViewResume(u)}>
                      <span className="tooltip">View resume</span>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>
                    </div>
                    <div className="icon-btn warn" onClick={() => onResetPassword(u)}>
                      <span className="tooltip">Reset password</span>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.778-7.778zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
                    </div>
                    <div className="icon-btn warn" onClick={() => onForceExpire(u)}>
                      <span className="tooltip">Force expire</span>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
                    </div>
                    <div className="icon-btn danger" onClick={() => onBanUser(u)}>
                      <span className="tooltip">{u.isBanned ? 'Unban user' : 'Ban user'}</span>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        {u.isBanned ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        ) : (
                          <>
                            <path d="M4.93 4.93l14.14 14.14"/>
                            <circle cx="12" cy="12" r="10"/>
                          </>
                        )}
                      </svg>
                    </div>
                  </div>
                  
                  <div className="mobile-actions">
                    <button className="action-hub-btn" onClick={() => toggleActions(u._id)}>
                      <span>Action hub</span>
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: openActionId === u._id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </button>
                    {openActionId === u._id && (
                      <div className="action-dropdown-card">
                        <button className="mobile-logout-btn" onClick={() => onViewResume(u)}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>
                          <span>View resume</span>
                        </button>
                        <button className="mobile-logout-btn" onClick={() => onResetPassword(u)}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.778-7.778zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
                          <span>Reset password</span>
                        </button>
                        <button className="mobile-logout-btn" onClick={() => onForceExpire(u)}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
                          <span>Expire session</span>
                        </button>
                        <button className="mobile-logout-btn danger" onClick={() => onBanUser(u)}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            {u.isBanned ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            ) : (
                              <><path d="M4.93 4.93l14.14 14.14"/><circle cx="12" cy="12" r="10"/></>
                            )}
                          </svg>
                          <span>{u.isBanned ? 'Unban user' : 'Ban user'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pager">
        <div className="pager-info">Page 1 of 1</div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button className="btn" style={{ padding: '6px 12px', fontSize: '12px' }}>Prev</button>
          <button className="btn" style={{ padding: '6px 12px', fontSize: '12px' }}>Next</button>
        </div>
      </div>
    </div>
  );
}
