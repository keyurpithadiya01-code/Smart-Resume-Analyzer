import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const { sendOtp, signup, user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const countryCode = '+91';

  // Form Fields
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI State
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [showToastObj, setShowToastObj] = useState(false);
  
  // Errors
  const [nameError, setNameError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [passError, setPassError] = useState(false);

  // Password Visibility
  const [showPass1, setShowPass1] = useState(false);
  const [showPass2, setShowPass2] = useState(false);

  // Timer
  const [resendSeconds, setResendSeconds] = useState(0);

  const otpRefs = useRef([]);
  const timerRef = useRef(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setShowToastObj(true);
    setTimeout(() => setShowToastObj(false), 2800);
  };

  const startResendTimer = () => {
    setResendSeconds(30);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const goToStep = (n) => {
    setStep(n);
  };

  const handleBack = () => {
    if (step > 1 && step < 5) goToStep(step - 1);
  };

  // STEP 1
  const handleToStep2 = (e) => {
    e?.preventDefault();
    const val = fullname.trim();
    if (val.length < 2 || !/[a-zA-Z]/.test(val)) {
      setNameError(true);
      return;
    }
    setNameError(false);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      goToStep(2);
    }, 500);
  };

  // STEP 2
  const handleToStep3 = async (e) => {
    e?.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setEmailError(true);
      return;
    }
    setEmailError(false);
    setLoading(true);

    try {
      await sendOtp(email);
      goToStep(3);
      showToast('OTP sent to ' + email);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
      startResendTimer();
    } catch (err) {
      setEmailError(true);
      showToast(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await sendOtp(email);
      showToast('New OTP sent to ' + email);
      startResendTimer();
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      showToast('Failed to resend OTP');
    }
  };

  // STEP 3
  const handleOtpChange = (index, value) => {
    const digits = value.replace(/\D/g, '');
    
    // Handle autofill/paste of multiple digits into a single input
    if (digits.length > 1) {
      const newOtp = [...otp];
      digits.split('').forEach((d, i) => {
        if (index + i < 6) newOtp[index + i] = d;
      });
      setOtp(newOtp);
      setOtpError('');
      const nextIndex = Math.min(index + digits.length, 5);
      setTimeout(() => otpRefs.current[nextIndex]?.focus(), 10);
      return;
    }

    const cleanValue = digits.slice(-1);
    if (value && !cleanValue) return;

    const newOtp = [...otp];
    newOtp[index] = cleanValue;
    setOtp(newOtp);
    setOtpError('');

    if (cleanValue && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const digits = (e.clipboardData.getData('text').match(/\d/g) || []).slice(0, 6);
    const newOtp = [...otp];
    digits.forEach((d, idx) => {
      if (idx < 6) newOtp[idx] = d;
    });
    setOtp(newOtp);
    const next = Math.min(digits.length, 5);
    setTimeout(() => otpRefs.current[next]?.focus(), 10);
  };

  const handleToStep4 = (e) => {
    e?.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      setOtpError('Please enter all 6 digits.');
      return;
    }
    setOtpError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (timerRef.current) clearInterval(timerRef.current);
      goToStep(4);
      showToast('Email verified ✓');
    }, 700);
  };

  // STEP 4
  const hasLen = password.length >= 8;
  const hasNum = /\d/.test(password);
  const hasCase = /[a-z]/.test(password) && /[A-Z]/.test(password);
  const pwValid = hasLen && hasNum && hasCase;
  const score = [hasLen, hasNum, hasCase, password.length >= 12].filter(Boolean).length;
  
  const strengthLabels = ['Enter a password', 'Weak', 'Fair', 'Good', 'Strong'];
  const currentStrengthLabel = password.length === 0 ? strengthLabels[0] : (strengthLabels[score] || strengthLabels[1]);

  const handleSignup = async (e) => {
    e?.preventDefault();
    if (step !== 4) return;

    if (!pwValid) {
      setPassError(true);
      return;
    }
    setPassError(false);

    if (confirmPassword !== password || confirmPassword === '') {
      setPassError(true);
      return;
    }

    setLoading(true);
    try {
      const code = otp.join('');
      await signup({ email, otp: code, password, name: fullname });
      setStep(5);
    } catch (err) {
      setPassError(true);
      showToast(err.response?.data?.error || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const firstName = fullname.split(' ')[0] || 'there';

  return (
    <div className="auth-shell">
      <section className="visual-panel">
        <div className="grid-bg"></div>
        <Link to={user ? "/home" : "/"} className="logo" style={{ textDecoration: 'none', color: 'inherit' }}><span className="dot"></span>Scanly</Link>

        <div className="visual-center">
          <div className="journey">
            {[1, 2, 3, 4].map((s, i) => {
              const isActive = step === s;
              const isDone = step > s || step === 5;
              const titles = ['Your name', 'Email address', 'Verify OTP', 'Set password'];
              const subs = ['Tell us who you are', "We'll send a verification code", 'Enter the 6-digit code', 'Secure your account'];
              
              return (
                <div key={s} className={`journey-step ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}>
                  <div className="j-dot">{s}</div>
                  <div className="j-text">
                    <div className="j-title">{titles[i]}</div>
                    <div className="j-sub">{subs[i]}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p className="visual-quote">
          "Sign-up took less than a minute. Scanned my resume and had three actionable fixes before I'd even finished my coffee."
          <span className="name">— D. Shah, CS Undergrad</span>
        </p>
      </section>

      <section className="form-panel">
        <div className="form-wrap">
          <div className="form-top-nav">
            <button 
              className="back-link" 
              onClick={handleBack}
              style={{ visibility: (step === 1 || step === 5) ? 'hidden' : 'visible' }}
            >
              ← Back
            </button>
            <Link to={user ? "/home" : "/"} className="mobile-logo" style={{ textDecoration: 'none', color: 'inherit' }}><span className="dot"></span>Scanly</Link>
          </div>

          <div className="mobile-steps">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className={`pill ${step >= s || step === 5 ? 'done' : ''}`}></div>
            ))}
          </div>

          <form id="signupForm" noValidate onSubmit={handleSignup}>

            {/* STEP 1: NAME */}
            {step === 1 && (
              <div className="step active">
                <div className="step-eyebrow"><span className="stepcount">STEP 1 / 4</span> · GETTING STARTED</div>
                <h1>What's your name?</h1>
                <p className="form-sub">Already have an account? <Link to="/login">Log in</Link></p>

                <div className={`field ${nameError ? 'invalid' : ''}`}>
                  <label htmlFor="fullname">Full name</label>
                  <div className="input-wrap">
                    <input 
                      type="text" 
                      id="fullname" 
                      placeholder="e.g. Keyur Pithadiya" 
                      autoComplete="name"
                      value={fullname}
                      onChange={e => setFullname(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleToStep2(e)}
                    />
                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>
                  </div>
                  <div className="field-error">Please enter your full name</div>
                </div>

                <button type="button" className={`btn-primary ${loading ? 'loading' : ''}`} onClick={handleToStep2} disabled={loading}>
                  <span className="btxt">Continue →</span><span className="spinner"></span>
                </button>

                <div className="divider"><span>or sign up with</span></div>
                <div className="social-row">
                  <button type="button" className="btn-social">
                    <svg viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z"/><path fill="#FBBC05" d="M5.84 14.1A7.1 7.1 0 0 1 5.46 12c0-.73.13-1.43.38-2.1V7.06H2.18A11.9 11.9 0 0 0 1 12c0 1.93.46 3.76 1.18 5.94l3.66-2.84Z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.46 1.99 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52Z"/></svg>
                    Google
                  </button>
                  <button type="button" className="btn-social">
                    <svg viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45Z"/></svg>
                    LinkedIn
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: EMAIL */}
            {step === 2 && (
              <div className="step active">
                <div className="step-eyebrow"><span className="stepcount">STEP 2 / 4</span> · VERIFICATION</div>
                <h1>What's your email?</h1>
                <p className="form-sub">Hey <b><span>{firstName}</span></b> — we'll email a 6-digit code to verify it's really you.</p>

                <div className={`field ${emailError ? 'invalid' : ''}`}>
                  <label htmlFor="email">Email address</label>
                  <div className="input-wrap">
                    <input 
                      type="email" 
                      id="email" 
                      placeholder="you@example.com" 
                      autoComplete="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleToStep3(e)}
                    />
                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>
                  </div>
                  <div className="field-error">Enter a valid email address</div>
                  <div className="field-hint">We'll never share your email or use it to spam you.</div>
                </div>

                <button type="button" className={`btn-primary ${loading ? 'loading' : ''}`} onClick={handleToStep3} disabled={loading}>
                  <span className="btxt">Send OTP →</span><span className="spinner"></span>
                </button>
              </div>
            )}

            {/* STEP 3: OTP */}
            {step === 3 && (
              <div className="step active">
                <div className="step-eyebrow"><span className="stepcount">STEP 3 / 4</span> · VERIFICATION</div>
                <h1>Enter the code</h1>
                <p className="form-sub">We sent a 6-digit code to <b><span>{email}</span></b>.</p>

                <div className="otp-row">
                  {otp.map((digit, index) => (
                    <input 
                      key={index}
                      className={`otp-box ${digit ? 'filled' : ''} ${otpError ? 'error' : ''}`} 
                      type="text" 
                      inputMode="numeric" 
                      maxLength="1"
                      value={digit}
                      ref={el => otpRefs.current[index] = el}
                      onChange={e => handleOtpChange(index, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(index, e)}
                      onPaste={handleOtpPaste}
                      onFocus={e => e.target.select()}
                    />
                  ))}
                </div>
                {otpError && <div className="field-error" style={{ display: 'block', marginBottom: '8px' }}>{otpError}</div>}

                <div className="otp-meta">
                  <span className="otp-sent-to" style={{ display: resendSeconds > 0 ? 'inline' : 'none' }}>Resend code in <b>{resendSeconds}s</b></span>
                  <button type="button" className="resend-btn" onClick={handleResend} style={{ display: resendSeconds === 0 ? 'inline' : 'none' }}>Resend code</button>
                </div>

                <button type="button" className={`btn-primary ${loading ? 'loading' : ''}`} onClick={handleToStep4} disabled={loading}>
                  <span className="btxt">Verify →</span><span className="spinner"></span>
                </button>
              </div>
            )}

            {/* STEP 4: PASSWORD */}
            {step === 4 && (
              <div className="step active">
                <div className="step-eyebrow"><span className="stepcount">STEP 4 / 4</span> · ALMOST DONE</div>
                <h1>Set a password</h1>
                <p className="form-sub">Last step — secure your Scanly account.</p>

                <div className={`field ${passError && !pwValid ? 'invalid' : ''}`}>
                  <label htmlFor="password">Password</label>
                  <div className="input-wrap">
                    <input 
                      type={showPass1 ? "text" : "password"} 
                      id="password" 
                      placeholder="Create a password" 
                      autoComplete="new-password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                    />
                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8"><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>
                    <button type="button" className="toggle-pass" onClick={() => setShowPass1(!showPass1)}>
                      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" className="eyeIcon">
                        {showPass1 ? (
                          <><path d="M2 2l20 20"/><path d="M9.88 9.88a3 3 0 0 0 4.24 4.24"/><path d="M6.1 6.1C3.6 7.6 1 12 1 12s4 7 11 7c2 0 3.7-.5 5.1-1.3M12 5c7 0 11 7 11 7a13.5 13.5 0 0 1-2.1 2.9"/></>
                        ) : (
                          <><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"/><circle cx="12" cy="12" r="3"/></>
                        )}
                      </svg>
                    </button>
                  </div>
                  <div className="strength-row">
                    {[0, 1, 2, 3].map(i => {
                      let bg = 'var(--line)';
                      if (i < score) {
                        bg = score <= 1 ? '#ff6b6b' : score <= 2 ? '#ffb454' : '#00ffa3';
                      }
                      return <div key={i} className="seg" style={{ background: bg }}></div>;
                    })}
                  </div>
                  <div className="strength-label">{currentStrengthLabel}</div>
                </div>

                <div className={`field ${passError && (confirmPassword !== password || confirmPassword === '') ? 'invalid' : ''}`}>
                  <label htmlFor="confirmPassword">Confirm password</label>
                  <div className="input-wrap">
                    <input 
                      type={showPass2 ? "text" : "password"} 
                      id="confirmPassword" 
                      placeholder="Re-enter your password" 
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                    />
                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8"><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>
                    <button type="button" className="toggle-pass" onClick={() => setShowPass2(!showPass2)}>
                      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" className="eyeIcon">
                        {showPass2 ? (
                          <><path d="M2 2l20 20"/><path d="M9.88 9.88a3 3 0 0 0 4.24 4.24"/><path d="M6.1 6.1C3.6 7.6 1 12 1 12s4 7 11 7c2 0 3.7-.5 5.1-1.3M12 5c7 0 11 7 11 7a13.5 13.5 0 0 1-2.1 2.9"/></>
                        ) : (
                          <><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"/><circle cx="12" cy="12" r="3"/></>
                        )}
                      </svg>
                    </button>
                  </div>
                  <div className="field-error">Passwords don't match</div>
                </div>

                <div className="req-list">
                  <div className={`req-item ${hasLen ? 'met' : ''}`}><svg viewBox="0 0 24 24" fill="none" strokeWidth="2"><path d="M20 6 9 17l-5-5"/></svg>At least 8 characters</div>
                  <div className={`req-item ${hasNum ? 'met' : ''}`}><svg viewBox="0 0 24 24" fill="none" strokeWidth="2"><path d="M20 6 9 17l-5-5"/></svg>At least 1 number</div>
                  <div className={`req-item ${hasCase ? 'met' : ''}`}><svg viewBox="0 0 24 24" fill="none" strokeWidth="2"><path d="M20 6 9 17l-5-5"/></svg>Upper & lowercase letters</div>
                </div>

                <button type="submit" className={`btn-primary ${loading ? 'loading' : ''}`} style={{ marginTop: '26px' }} disabled={loading}>
                  <span className="btxt">Create account →</span><span className="spinner"></span>
                </button>
              </div>
            )}

            {/* STEP 5: SUCCESS */}
            {step === 5 && (
              <div className="step active">
                <div className="success-wrap">
                  <div className="success-icon"><svg viewBox="0 0 24 24" fill="none" strokeWidth="2.4"><path d="M20 6 9 17l-5-5"/></svg></div>
                  <div className="step-eyebrow" style={{ justifyContent: 'center' }}>ACCOUNT CREATED</div>
                  <h1 style={{ textAlign: 'center' }}>You're all set, <span>{firstName}</span></h1>
                  <p className="form-sub" style={{ textAlign: 'center' }}>Your account is ready. Log in to run your first resume scan.</p>
                  <Link to="/login" className="btn-primary" style={{ textDecoration: 'none' }}>
                    <span className="btxt">Go to login →</span>
                  </Link>
                </div>
              </div>
            )}

          </form>
        </div>
      </section>

      <div className={`toast ${showToastObj ? 'show' : ''}`}>
        <span className="dotgreen"></span>
        <span>{toastMsg}</span>
      </div>
    </div>
  );
}
