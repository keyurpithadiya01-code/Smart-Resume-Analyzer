import React, { useState, useEffect } from 'react';
import api from '../../api/client';

export default function ResetPasswordModal({ isOpen, user, onClose, onToast }) {
  const [pwd1, setPwd1] = useState('');
  const [pwd2, setPwd2] = useState('');
  const [showPwd1, setShowPwd1] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, sending, success

  useEffect(() => {
    if (isOpen) {
      setPwd1('');
      setPwd2('');
      setShowPwd1(false);
      setShowPwd2(false);
      setStatus('idle');
    }
  }, [isOpen]);

  if (!isOpen || !user) return null;

  const handleOverlayClick = (e) => {
    if (e.target.className.includes('overlay')) {
      onClose();
    }
  };

  const isMismatch = pwd2.length > 0 && pwd1 !== pwd2;
  const isValid = pwd1.length > 0 && pwd1 === pwd2;

  const handleSubmit = async () => {
    if (!isValid || status !== 'idle') return;
    setStatus('sending');

    try {
      await api.post(`/admin/users/${user._id}/reset-password`, { newPassword: pwd1 });
      setStatus('success');
    } catch (err) {
      setStatus('idle');
      onToast('Failed to reset password', 'error');
    }
  };

  const initials = user.name ? user.name.split(' ').map(p=>p[0]).join('').slice(0,2).toUpperCase() : 'U';

  return (
    <div className={`overlay ${isOpen ? 'show' : ''}`} onClick={handleOverlayClick}>
      <div 
        style={{
          background: 'var(--ink-soft)', 
          border: '1px solid var(--ink-border-strong)', 
          borderRadius: '20px', 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          overflow: 'hidden', 
          fontFamily: '-apple-system,Inter,sans-serif', 
          color: '#e9eef6',
          width: '800px',
          maxWidth: '90vw',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding: '28px', borderRight: '1px solid var(--ink-border)', minHeight: '480px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ width: '14px', height: '2px', background: '#f5a623', display: 'inline-block', borderRadius: '1px' }}></span>
            <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '11px', letterSpacing: '1.4px', color: '#f5a623', textTransform: 'uppercase' }}>Change password</span>
          </div>

          <div style={{ fontSize: '17px', fontWeight: 600, marginBottom: '6px' }}>Change password</div>
          <div style={{ fontSize: '12.5px', color: '#8d98ab', lineHeight: 1.55, marginBottom: '16px' }}>Set a new password below — it's emailed to them directly so they can sign in right away.</div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '12px', padding: '12px 14px', background: 'rgba(255,255,255,0.02)', marginBottom: '18px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(26,242,155,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--scan)', fontWeight: 'bold', fontSize: '14px' }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '13.5px' }}>{user.name || 'User'}</div>
              <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '11px', color: '#5d6779', marginTop: '2px' }}>{user.email}</div>
            </div>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', border: '1px solid rgba(255,255,255,0.12)', padding: '3px 9px', borderRadius: '99px', color: '#8d98ab', flexShrink: 0 }}>Active</div>
          </div>

          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10.5px', letterSpacing: '0.8px', color: '#8d98ab', textTransform: 'uppercase', marginBottom: '6px' }}>New password</div>
          <div style={{ position: 'relative', marginBottom: '14px' }}>
            <input 
              type={showPwd1 ? "text" : "password"} 
              placeholder="Enter new password" 
              value={pwd1}
              onChange={e => setPwd1(e.target.value)}
              style={{ width: '100%', background: '#141a24', border: '1px solid rgba(255,255,255,0.1)', outline: 'none', borderRadius: '10px', padding: '11px 40px 11px 14px', color: '#e9eef6', fontSize: '13.5px', fontFamily: 'inherit', boxSizing: 'border-box' }} 
              onFocus={(e) => e.target.style.borderColor = '#1af29b'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
            <span onClick={() => setShowPwd1(!showPwd1)} style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#5d6779', display: 'flex' }}>
              {showPwd1 ? (
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 7 11 7a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
              ) : (
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>
              )}
            </span>
          </div>

          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10.5px', letterSpacing: '0.8px', color: '#8d98ab', textTransform: 'uppercase', marginBottom: '6px' }}>Confirm new password</div>
          <div style={{ position: 'relative', marginBottom: '6px' }}>
            <input 
              type={showPwd2 ? "text" : "password"} 
              placeholder="Re-enter new password" 
              value={pwd2}
              onChange={e => setPwd2(e.target.value)}
              style={{ width: '100%', background: '#141a24', border: '1px solid rgba(255,255,255,0.1)', outline: 'none', borderRadius: '10px', padding: '11px 40px 11px 14px', color: '#e9eef6', fontSize: '13.5px', fontFamily: 'inherit', boxSizing: 'border-box' }} 
              onFocus={(e) => e.target.style.borderColor = '#1af29b'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
            <span onClick={() => setShowPwd2(!showPwd2)} style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#5d6779', display: 'flex' }}>
              {showPwd2 ? (
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 7 11 7a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
              ) : (
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>
              )}
            </span>
          </div>
          <div style={{ fontSize: '11.5px', color: '#f0556b', minHeight: '16px', marginBottom: '14px', opacity: isMismatch ? 1 : 0, transition: 'opacity .2s' }}>Passwords don't match</div>

          <button 
            disabled={!isValid || status !== 'idle'}
            onClick={handleSubmit}
            style={{ 
              width: '100%', 
              background: status === 'success' ? 'transparent' : '#1af29b', 
              color: status === 'success' ? '#1af29b' : '#06140d', 
              fontWeight: 700, 
              fontSize: '14px', 
              border: status === 'success' ? '1px solid rgba(26,242,155,0.4)' : 'none', 
              borderRadius: '12px', 
              padding: '13px', 
              cursor: (!isValid || status !== 'idle') ? 'not-allowed' : 'pointer', 
              opacity: (!isValid && status === 'idle') ? 0.4 : (status === 'sending' ? 0.7 : 1), 
              boxShadow: status === 'success' ? 'none' : '0 0 0 1px rgba(26,242,155,0.35), 0 8px 22px rgba(26,242,155,0.3)', 
              transition: 'all .2s', 
              fontFamily: 'inherit' 
            }}
          >
            {status === 'idle' ? 'Change & send password \u2192' : (status === 'sending' ? 'Sending…' : 'Password sent')}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px', opacity: status === 'success' ? 1 : 0, transform: status === 'success' ? 'translateY(0)' : 'translateY(-4px)', transition: 'all .35s ease' }}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#1af29b" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
            <span style={{ fontSize: '12px', color: '#9fb3a8' }}>New password sent to <span style={{ color: '#e9eef6' }}>{user.email}</span></span>
          </div>
        </div>

        <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '18px', minHeight: '480px' }}>
          <div style={{ width: '208px', background: '#edeee7', borderRadius: '16px', padding: '24px 20px', boxShadow: '0 18px 40px rgba(0,0,0,0.45)', transform: 'rotate(3deg)' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#14181f', marginBottom: '2px' }}>Secure delivery</div>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '9.5px', letterSpacing: '0.8px', color: '#8b9088', textTransform: 'uppercase', marginBottom: '18px' }}>Scanly &middot; password change</div>

            <div style={{ position: 'relative', width: '74px', height: '74px', margin: '0 auto 18px' }}>
              <svg viewBox="0 0 74 74" width="74" height="74" style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
                <circle cx="37" cy="37" r="32" fill="none" stroke="#dededa" strokeWidth="3"></circle>
                <circle cx="37" cy="37" r="32" fill="none" stroke="#0fb87f" strokeWidth="3" strokeLinecap="round" strokeDasharray="201" strokeDashoffset={status === 'success' ? 0 : 201} style={{ transition: 'stroke-dashoffset 1.1s ease' }}></circle>
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#14181f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"></rect><path d="M8 11V7a4 4 0 0 1 8 0v4"></path></svg>
              </div>
              <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '22px', height: '22px', borderRadius: '50%', background: '#0fb87f', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: status === 'success' ? 1 : 0, transform: status === 'success' ? 'scale(1)' : 'scale(0.4)', transition: 'all .4s cubic-bezier(.34,1.56,.64,1) 1.1s' }}>
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
              </div>
            </div>

            <div style={{ display: status === 'success' ? 'none' : 'flex', flexDirection: 'column', gap: '7px' }}>
              <div style={{ height: '6px', width: '90%', background: '#d6d7cf', borderRadius: '3px', animation: 'shimmerpulse 1.8s ease-in-out infinite' }}></div>
              <div style={{ height: '6px', width: '70%', background: '#d6d7cf', borderRadius: '3px', animation: 'shimmerpulse 1.8s ease-in-out infinite' }}></div>
              <div style={{ height: '6px', width: '80%', background: '#d6d7cf', borderRadius: '3px', animation: 'shimmerpulse 1.8s ease-in-out infinite' }}></div>
            </div>

            <div style={{ display: status === 'success' ? 'flex' : 'none', gap: '5px', justifyContent: 'center' }}>
              {[...Array(9)].map((_, i) => (
                <span key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#14181f', opacity: status === 'success' ? 1 : 0, transition: `opacity .25s ${1.5 + (i * 0.05)}s` }}></span>
              ))}
            </div>
          </div>

          <div style={{ fontSize: '12.5px', color: '#8d98ab', textAlign: 'center', lineHeight: 1.55, maxWidth: '210px' }}>
            {status === 'success' ? `Sent to ${user.email} — they'll be asked to change it at next login.` : 'Enter a new password on the left to get started.'}
          </div>
        </div>
      </div>
    </div>
  );
}
