import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function PublicLayout({ children }) {
  const { isLoggedIn, userLogout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    userLogout();
    navigate('/');
  };

  return (
    <div className="public-layout">
      <div className="noise" />

      <header id="siteHeader" className={scrolled ? 'scrolled' : ''}>
        <Link to="/" className="logo" onClick={() => setMenuOpen(false)}>
          <span className="dot" />
          Scanly
        </Link>

        <button
          type="button"
          className="menu-toggle"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span /><span /><span />
        </button>

        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <nav>
            <ul>
              <li><a href="/#how" onClick={() => setMenuOpen(false)}>How it works</a></li>
              <li><a href="/#features" onClick={() => setMenuOpen(false)}>Features</a></li>
              <li><a href="/#demo" onClick={() => setMenuOpen(false)}>Live demo</a></li>
              <li><a href="/#faq" onClick={() => setMenuOpen(false)}>FAQ</a></li>
            </ul>
          </nav>
          <div className="auth-buttons">
            {isLoggedIn ? (
              <>
                <Link to="/home" className="btn-solid" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                <button type="button" onClick={handleLogout} className="btn-ghost">Log Out</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost" onClick={() => setMenuOpen(false)}>Log In</Link>
                <Link to="/signup" className="btn-solid" onClick={() => setMenuOpen(false)}>Get Started</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer id="faq">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="logo"><span className="dot" />Scanly</div>
            <p>Smart resume analysis that reads your resume the way hiring software does — so you fix the right things before you hit submit.</p>
          </div>
          <div className="footer-cols">
            <div className="footer-col">
              <h5>Product</h5>
              <a href="/#how">How it works</a>
              <a href="/#features">Features</a>
              <a href="/#demo">Live demo</a>
            </div>
            <div className="footer-col">
              <h5>Account</h5>
              <Link to="/login">Log in</Link>
              <Link to="/signup">Sign up</Link>
            </div>
            <div className="footer-col">
              <h5>Company</h5>
              <Link to="/about">About</Link>
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Scanly. All rights reserved.</span>
          <span>*Based on self-reported user survey data.</span>
        </div>
      </footer>
    </div>
  );
}
