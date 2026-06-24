import { NavLink, Link, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ScanlyBrand from './ScanlyBrand';
import {
  IconDashboard, IconChart, IconDocument, IconBriefcase,
  IconReport, IconFeedback, IconInfo,
} from './Icons';

const NAV_GROUPS = [
  {
    title: 'Overview',
    items: [
      { to: '/home', label: 'Dashboard', Icon: IconDashboard },
      { to: '/dashboard', label: 'Reports', Icon: IconReport },
    ],
  },
  {
    title: 'Tools',
    items: [
      { to: '/analyzer', label: 'ATS Analysis', Icon: IconChart },
      { to: '/builder', label: 'Resume Builder', Icon: IconDocument },
      { to: '/jobs', label: 'Job Search', Icon: IconBriefcase },
    ],
  },
  {
    title: 'Support',
    items: [
      { to: '/feedback', label: 'Feedback', Icon: IconFeedback },
      { to: '/about', label: 'About', Icon: IconInfo },
    ],
  },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function userInitial(name, phone) {
  const src = name || phone || 'S';
  return src.charAt(0).toUpperCase();
}

export default function AppLayout({ children }) {
  const { isLoggedIn, user, userLogout } = useAuth();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const profileMenuRef = useRef(null);

  // Close profile menu on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile nav on route change
  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (mobileNavOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileNavOpen]);

  return (
    <div className="app-shell h-screen w-full flex flex-col bg-[#0b0f14] overflow-hidden">
      <div className="app-grid-bg" />

      {/* ── TOP BAR ── */}
      <header className="app-topbar flex-shrink-0 z-20 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-[#232b35]/60 bg-[#10161d]/80 backdrop-blur-md">
        <div className="flex items-center gap-3 sm:gap-12 lg:gap-20 min-w-0">
          <ScanlyBrand showTagline={false} />

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-2">
            {NAV_GROUPS.flatMap(g => g.items).map(({ to, label, Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `app-nav-link-top ${isActive ? 'active' : ''}`}
              >
                <Icon />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-6 flex-shrink-0">
          {/* Desktop profile */}
          <div className="hidden sm:flex items-center">
            {isLoggedIn ? (
              <div className="lg:border-l lg:border-[#232b35] lg:pl-6 relative" ref={profileMenuRef}>
                <button
                  className="flex items-center justify-between gap-2 sm:gap-3 bg-[#10161d] border border-[#232b35] hover:border-[#00ffa3]/40 hover:bg-[#161d26] p-1.5 pr-2.5 rounded-xl transition cursor-pointer max-w-[170px] sm:max-w-[180px]"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="app-user-avatar !w-8 !h-8 !text-xs flex-shrink-0">{userInitial(user.name, user.phone)}</div>
                    <div className="text-left overflow-hidden hidden sm:block">
                      <p className="text-sm font-medium text-[#f0f0ec] truncate max-w-[80px] sm:max-w-[100px]">{user.name || user.phone || 'Member'}</p>
                      <p className="text-[9px] text-[#6b7785] uppercase tracking-wider">Profile</p>
                    </div>
                  </div>
                  <svg className={`w-3.5 h-3.5 text-[#6b7785] transition-transform duration-300 flex-shrink-0 ${showProfileMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showProfileMenu && (
                  <div className="absolute top-full right-0 mt-2 w-64 rounded-xl bg-[#202123] border border-gray-700 shadow-xl z-50 animate-fade-up flex flex-col p-1.5">
                    {/* User Info Header */}
                    <div className="flex items-center gap-3 px-3 py-3 mb-1">
                      <div className="app-user-avatar !w-10 !h-10 !text-sm flex-shrink-0">{userInitial(user.name, user.phone)}</div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white truncate">{user.name || 'Scanly User'}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email || user.phone || 'Scanly Member'}</p>
                      </div>
                    </div>
                    
                    <hr className="border-gray-700 my-1 mx-2" />

                    {/* Menu Items */}
                    <div className="py-1">
                      <Link to="/home" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-200 hover:bg-gray-700/50 rounded-lg transition-colors mx-1">
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                        Dashboard
                      </Link>
                      
                      <Link to="/analyzer" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-200 hover:bg-gray-700/50 rounded-lg transition-colors mx-1">
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                        ATS Analysis
                      </Link>
                    </div>

                    <hr className="border-gray-700 my-1 mx-2" />

                    {/* Logout Button */}
                    <div className="py-1">
                      <button
                        onClick={() => { setShowProfileMenu(false); userLogout(); }}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm text-red-500 hover:bg-gray-700/50 rounded-lg transition-colors mx-1 w-[calc(100%-8px)] text-left font-medium"
                      >
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-[#6b7785]">{greeting()}</p>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden flex flex-col justify-center items-center w-9 h-9 gap-[5.5px] rounded-lg border border-[#232b35] bg-[#10161d] hover:border-[#00ffa3]/40 transition flex-shrink-0"
            aria-label="Open navigation"
            onClick={() => setMobileNavOpen(true)}
          >
            <span className="w-[18px] h-[2px] bg-[#c9cbc5] rounded-full block" />
            <span className="w-[18px] h-[2px] bg-[#c9cbc5] rounded-full block" />
            <span className="w-[18px] h-[2px] bg-[#c9cbc5] rounded-full block" />
          </button>
        </div>
      </header>

      {/* ── MOBILE NAV DRAWER ── */}

      {/* Backdrop — opacity-only transition; blur is static to prevent mobile choke */}
      <div
        className={`mobile-drawer-backdrop fixed inset-0 z-40 bg-black/55 transition-opacity duration-300 md:hidden ${mobileNavOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setMobileNavOpen(false)}
      />

      {/* Drawer panel — hardware-accelerated */}
      <div
        className={`mobile-drawer-panel fixed top-0 right-0 h-full w-[300px] max-w-[88vw] z-50 bg-[#0f151c] border-l border-[#1e2832] flex flex-col transition-transform duration-300 ease-out md:hidden ${mobileNavOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* ── Drawer header ── */}
        <div className="mobile-drawer-header">
          <div className="mobile-drawer-logo">
            <span className="scanly-dot" />
            <span className="mobile-drawer-logo-text">Scanly</span>
          </div>
          <button
            type="button"
            className="mobile-drawer-close"
            aria-label="Close navigation"
            onClick={() => setMobileNavOpen(false)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Scrollable nav groups ── */}
        <nav className="mobile-drawer-nav">
          {NAV_GROUPS.map((group) => (
            <div key={group.title} className="mb-2">
              <span className="mobile-nav-group-label">{group.title}</span>
              {group.items.map(({ to, label, Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => setMobileNavOpen(false)}
                >
                  <Icon />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* ── Drawer footer — profile card + logout (strictly separated) ── */}
        {isLoggedIn && (
          <div className="mobile-drawer-footer">
            {/* User profile card */}
            <div className="mobile-profile-card">
              <div className="mobile-profile-avatar">{userInitial(user.name, user.phone)}</div>
              <div className="mobile-profile-info">
                <p className="mobile-profile-name">{user.name || user.email}</p>
                <p className="mobile-profile-role">Scanly Member</p>
              </div>
            </div>

            {/* Logout — standalone, always ≥ 48px, never cramped */}
            <button
              type="button"
              className="mobile-logout-btn"
              onClick={() => { setMobileNavOpen(false); userLogout(); }}
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Log out</span>
            </button>
          </div>
        )}
      </div>


      {/* ── MAIN CONTENT ── */}
      <div className="app-main-column flex-1 relative overflow-hidden">
        <main className="app-content h-full overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
