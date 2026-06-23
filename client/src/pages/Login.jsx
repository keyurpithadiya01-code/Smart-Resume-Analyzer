import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';



function AuthVisual() {
  const { user } = useAuth();
  return (
    <section className="visual-panel">
      <div className="grid-bg" />
      <Link to={user ? "/home" : "/"} className="logo" style={{ textDecoration: 'none', color: 'inherit' }}><span className="dot" />Scanly</Link>
      <div className="visual-center">
        <div className="scan-stage">
          <div className="resume-card">
            <div className="r-name">Keyur Pithadiya</div>
            <div className="r-role">PRODUCT DESIGNER · BANGALORE</div>
            <div className="r-block">
              <div className="r-block-title">Summary</div>
              <div className="r-line med" />
              <div className="r-line short" />
            </div>
            <div className="r-block">
              <div className="r-block-title">Experience</div>
              <div className="r-line med" />
              <div className="r-line med" />
              <div className="r-line short" />
            </div>
            <div className="r-block">
              <div className="r-block-title">Skills</div>
              <span className="r-tag">Figma</span>
              <span className="r-tag">UX Research</span>
              <span className="r-tag">Design Systems</span>
            </div>
            <div className="scan-line" />
          </div>
        </div>
      </div>
      <p className="visual-quote">
        &quot;Found three formatting issues that were silently dropping my work history from every ATS scan.&quot;
        <span className="name">— R. Iyer, Backend Engineer</span>
      </p>
    </section>
  );
}

export default function Login() {
  const { userLogin, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  function showToast(msg) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3200);
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await userLogin(email, password);
      showToast('Logged in successfully — redirecting…');
      setTimeout(() => navigate('/home'), 800);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <AuthVisual />

      <section className="form-panel">
        <div className="form-wrap">
          <div className="form-top-nav">
            <Link to="/" className="back-link">← Back</Link>
            <Link to={user ? "/home" : "/"} className="mobile-logo" style={{ textDecoration: 'none', color: 'inherit' }}><span className="dot" />Scanly</Link>
          </div>

          <div className="form-eyebrow">Welcome back</div>
          <h1>Log in to Scanly</h1>
          <p className="form-sub">New here? <Link to="/signup">Create a free account</Link></p>

          <form onSubmit={handleLogin} noValidate>
            <div className="field">
              <label htmlFor="email">Email address</label>
              <div className="input-wrap">
                <input
                  type="email"
                  id="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>
              </div>
            </div>

            <div className={`field ${error ? 'invalid' : ''}`}>
              <label htmlFor="password">Password</label>
              <div className="input-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8"><rect x="4" y="10" width="16" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
                <button type="button" className="toggle-pass" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                </button>
              </div>
              {error && <div className="field-error">{error}</div>}
            </div>

            <button type="submit" className={`btn-primary ${loading ? 'loading' : ''}`} disabled={loading}>
              <span className="btxt">Log in</span>
              <span className="spinner" />
            </button>
          </form>
        </div>
      </section>

      <div className={`toast ${toastMsg ? 'show' : ''}`}>
        <span className="dotgreen" />
        <span>{toastMsg}</span>
      </div>
    </div>
  );
}
