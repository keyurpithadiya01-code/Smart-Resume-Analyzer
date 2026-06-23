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
  const profileMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="app-shell h-screen w-full flex flex-col bg-[#0b0f14] overflow-hidden">
      <div className="app-grid-bg" />

      <header className="app-topbar flex-shrink-0 z-20 flex items-center justify-between px-6 py-4 border-b border-[#232b35]/60 bg-[#10161d]/80 backdrop-blur-md">
        <div className="flex items-center gap-12 lg:gap-20">
          <ScanlyBrand showTagline={false} />
          
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

        <div className="flex items-center gap-6">


          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <div className="lg:border-l lg:border-[#232b35] lg:pl-6 relative" ref={profileMenuRef}>
                <button 
                  className="w-[180px] flex items-center justify-between gap-3 bg-[#10161d] border border-[#232b35] hover:border-[#00ffa3]/40 hover:bg-[#161d26] p-1.5 pr-2.5 rounded-xl transition cursor-pointer"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="app-user-avatar !w-8 !h-8 !text-xs">{userInitial(user.name, user.phone)}</div>
                    <div className="text-left overflow-hidden">
                      <p className="text-sm font-medium text-[#f0f0ec] truncate w-24">{user.name || user.phone}</p>
                      <p className="text-[9px] text-[#6b7785] uppercase tracking-wider truncate w-24">Scanly Member</p>
                    </div>
                  </div>
                  <svg className={`w-3.5 h-3.5 text-[#6b7785] transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showProfileMenu && (
                  <div className="absolute top-full right-0 mt-2 w-full rounded-xl bg-[#10161d] border border-[#232b35] shadow-2xl z-50 animate-fade-up overflow-hidden">
                    <button 
                      onClick={() => {
                        setShowProfileMenu(false);
                        userLogout();
                      }} 
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
              <p className="text-sm text-[#6b7785] hidden sm:block">{greeting()}</p>
            )}
          </div>
        </div>
      </header>

      <div className="app-main-column flex-1 relative overflow-hidden">
        <main className="app-content h-full overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
