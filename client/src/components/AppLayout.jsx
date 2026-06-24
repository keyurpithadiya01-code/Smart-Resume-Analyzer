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
          <div className="hidden sm:flex items-center gap-4">
            {isLoggedIn ? (
              <div className="lg:border-l lg:border-[#232b35] lg:pl-6 relative" ref={profileMenuRef}>
                <button
                  className="flex items-center justify-between gap-2 sm:gap-3 bg-[#10161d] border border-[#232b35] hover:border-[#00ffa3]/40 hover:bg-[#161d26] p-1.5 pr-2.5 rounded-xl transition cursor-pointer max-w-[170px] sm:max-w-[180px]"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="app-user-avatar !w-8 !h-8 !text-xs flex-shrink-0">{userInitial(user.name, user.phone)}</div>
                    <div className="text-left overflow-hidden hidden sm:block">
                      <p className="text-sm font-medium text-[#f0f0ec] truncate max-w-[80px] sm:max-w-[100px]">{user.name || user.phone}</p>
                      <p className="text-[9px] text-[#6b7785] uppercase tracking-wider">Scanly Member</p>
                    </div>
                  </div>
                  <svg className={`w-3.5 h-3.5 text-[#6b7785] transition-transform duration-300 flex-shrink-0 ${showProfileMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showProfileMenu && (
                  <div className="absolute top-full right-0 mt-2 w-full min-w-[140px] rounded-xl bg-[#10161d] border border-[#232b35] shadow-2xl z-50 animate-fade-up overflow-hidden">
                    <button
                      onClick={() => { setShowProfileMenu(false); userLogout(); }}
                      className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-[#161d26] hover:text-red-300 transition flex items-center gap-3 font-medium"
                    >
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
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
            className="md:hidden flex flex-col justify-center items-center w-9 h-9 gap-[5px] rounded-lg border border-[#232b35] bg-[#10161d] hover:border-[#00ffa3]/40 transition flex-shrink-0"
            aria-label="Open navigation"
            onClick={() => setMobileNavOpen(true)}
          >
            <span className="w-4 h-[2px] bg-[#c9cbc5] rounded-full block" />
            <span className="w-4 h-[2px] bg-[#c9cbc5] rounded-full block" />
            <span className="w-3 h-[2px] bg-[#c9cbc5] rounded-full block self-start ml-0.5" />
          </button>
        </div>
      </header>

      {/* ── MOBILE NAV DRAWER ── */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${mobileNavOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setMobileNavOpen(false)}
      />

      {/* Drawer panel */}
      <div
        className={`fixed top-0 right-0 h-full w-72 max-w-[85vw] z-50 bg-[#10161d] border-l border-[#232b35] flex flex-col transition-transform duration-300 ease-out md:hidden ${mobileNavOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#232b35]">
          <div className="flex items-center gap-2.5">
            <span className="scanly-dot" />
            <span className="font-display font-bold text-[#f0f0ec] tracking-tight">Scanly</span>
          </div>
          <button
            type="button"
            onClick={() => setMobileNavOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#232b35] hover:border-[#00ffa3]/40 transition text-[#6b7785] hover:text-[#f0f0ec]"
            aria-label="Close navigation"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Drawer nav groups */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {NAV_GROUPS.map((group) => (
            <div key={group.title} className="mb-5">
              <p className="app-nav-group-label px-3 mb-1">{group.title}</p>
              {group.items.map(({ to, label, Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) => `app-nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => setMobileNavOpen(false)}
                >
                  <Icon />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Drawer footer — user card */}
        {isLoggedIn && (
          <div className="border-t border-[#232b35] px-4 py-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="app-user-avatar flex-shrink-0">{userInitial(user.name, user.phone)}</div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#f0f0ec] truncate">{user.name || user.phone}</p>
                <p className="text-[10px] text-[#6b7785] uppercase tracking-wider">Scanly Member</p>
              </div>
            </div>
            <button
              onClick={() => { setMobileNavOpen(false); userLogout(); }}
              className="w-full text-left px-3 py-2.5 text-sm text-red-400 hover:bg-[#161d26] hover:text-red-300 transition flex items-center gap-3 font-medium rounded-xl border border-[#232b35]"
            >
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
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
