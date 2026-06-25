import React, { useState } from 'react';

export default function SystemHealthPanel({ issues = [] }) {
  const [simulatedHealthy, setSimulatedHealthy] = useState(false);
  const isHealthy = simulatedHealthy || issues.length === 0;

  const circumference = 97.4;
  const dashOffset = isHealthy ? circumference - (circumference * 0.999) : 20;

  return (
    <div className="health-panel">
      <div className="health-head">
        <div className="health-head-left">
          <div className="health-title">System health</div>
          <div className={`status-pill ${isHealthy ? '' : 'degraded'}`}>
            <span className={`pulse-dot ${isHealthy ? '' : 'amber'}`} style={{ position: 'relative', top: 0 }}></span>
            {isHealthy ? 'All systems operational' : `Degraded — ${issues.length} active issue${issues.length > 1 ? 's' : ''}`}
          </div>
        </div>
        <button className="sim-toggle" onClick={() => setSimulatedHealthy(!simulatedHealthy)}>
          simulate: {isHealthy ? 'degraded state' : 'all operational'}
        </button>
      </div>

      <div className="health-grid">
        <div className="health-summary">
          <div className="score-ring-wrap" style={{ width: '54px', height: '54px' }}>
            <svg viewBox="0 0 36 36">
              <circle className="score-ring-track" cx="18" cy="18" r="15.5"></circle>
              <circle className={`score-ring-fill ${isHealthy ? '' : 'warn'}`} cx="18" cy="18" r="15.5" strokeDasharray={circumference} strokeDashoffset={dashOffset}></circle>
            </svg>
          </div>
          <div>
            <div className="health-uptime-label">30-day uptime</div>
            <div className="health-uptime-val">{isHealthy ? '99.9%' : '94.6%'}</div>
          </div>
        </div>

        <div className="error-log">
          {isHealthy ? (
            <div className="error-log-empty">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
              No active issues — all services nominal
            </div>
          ) : (
            issues.length > 0 ? issues.map((issue, idx) => (
              <div key={idx} className="error-row">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 9v4M12 17h.01"/><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
                <div>
                  <div className="error-text">
                    <span className="error-tag">{issue.severity || 'warning'}</span>&nbsp; {issue.title} {issue.description && `— ${issue.description}`}
                  </div>
                  <div className="error-meta">{issue.service} · {issue.timeAgo}</div>
                </div>
              </div>
            )) : (
              <div className="error-row">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 9v4M12 17h.01"/><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
                <div>
                  <div className="error-text"><span className="error-tag">warning</span>&nbsp; OCR worker queue backlog — resumes taking ~40s longer than baseline to parse</div>
                  <div className="error-meta">worker-pool-3 · started 12 min ago</div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
