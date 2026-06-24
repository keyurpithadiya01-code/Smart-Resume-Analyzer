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
  const [isDarkMode, setIsDarkMode] = useState(true);
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
                  <div className="absolute top-full right-0 mt-2 w-64 rounded-2xl bg-[#2a2b2d] border border-[#3e3f42] shadow-2xl z-50 animate-fade-up flex flex-col p-2 text-gray-300 font-medium">
                    {/* User Info Header */}
                    <div className="flex items-center gap-3 px-3 py-2 mb-1">
                      <div className="app-user-avatar !w-10 !h-10 !text-sm flex-shrink-0 ring-2 ring-[#3e3f42] ring-offset-2 ring-offset-[#2a2b2d]">{userInitial(user.name, user.phone)}</div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-white truncate tracking-wide">{user.name || 'Nina Žerak'}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email || 'nina@zerak.eu'}</p>
                      </div>
                    </div>
                    
                    <hr className="border-[#3e3f42] my-1 mx-2" />

                    {/* Menu Items */}
                    <div className="py-1">
                      <Link to="/home" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-3 py-2 text-[13px] hover:bg-[#3a3b3e] rounded-xl transition-colors mx-1">
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        Account
                      </Link>
                      
                      <Link to="/profile" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-3 py-2 text-[13px] hover:bg-[#3a3b3e] rounded-xl transition-colors mx-1">
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                        Settings
                      </Link>

                      <Link to="/analyzer" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-3 py-2 text-[13px] hover:bg-[#3a3b3e] rounded-xl transition-colors mx-1">
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
                        Analytics
                      </Link>

                      <Link to="/feedback" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-3 py-2 text-[13px] hover:bg-[#3a3b3e] rounded-xl transition-colors mx-1">
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Help
                      </Link>
                    </div>

                    <hr className="border-[#3e3f42] my-1 mx-2" />

                    {/* Dark mode toggle */}
                    <div className="py-1">
                      <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className="flex items-center justify-between px-3 py-2 text-[13px] hover:bg-[#3a3b3e] rounded-xl transition-colors mx-1 w-[calc(100%-8px)]"
                      >
                        <div className="flex items-center gap-3">
                          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                          Dark mode
                        </div>
                        {/* Toggle Pill */}
                        <div className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors duration-300 ${isDarkMode ? 'bg-[#7c3aed]' : 'bg-gray-500'}`}>
                          <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${isDarkMode ? 'translate-x-4' : 'translate-x-0'}`} />
                        </div>
                      </button>
                    </div>

                    <hr className="border-[#3e3f42] my-1 mx-2" />

                    {/* Logout Button */}
                    <div className="py-1">
                      <button
                        onClick={() => { setShowProfileMenu(false); userLogout(); }}
                        className="flex items-center gap-3 px-3 py-2 text-[13px] text-[#ef4444] hover:bg-[#3a3b3e] rounded-xl transition-colors mx-1 w-[calc(100%-8px)] text-left"
                      >
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
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
