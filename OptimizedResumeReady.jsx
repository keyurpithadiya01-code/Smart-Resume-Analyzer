import React from "react";

/* ============================================================
   SCANLY — Optimized Resume Ready (result summary card)
   Standalone component. Drop in below the skill-injection panel.
   ============================================================ */

const styles = `
.orr-root {
  --ink-navy: #0a0e14;
  --surface: #11161f;
  --surface-raised: #161c28;
  --border: #1f2733;
  --border-soft: #1a212c;
  --scan-green: #00ffa3;
  --scan-green-dim: rgba(0,255,163,0.12);
  --scan-green-line: rgba(0,255,163,0.35);
  --text-primary: #e8ecf1;
  --text-secondary: #7b8696;
  --text-tertiary: #4a5364;
  font-family: 'Inter', -apple-system, sans-serif;
  color: var(--text-primary);
}
.orr-root * { box-sizing: border-box; }
.mono { font-family: 'IBM Plex Mono', monospace; }
.display { font-family: 'Space Grotesk', sans-serif; }

.orr-card {
  background: var(--surface);
  border: 1px solid var(--scan-green-line);
  border-radius: 14px;
  max-width: 620px;
  overflow: hidden;
}

/* status banner */
.orr-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 22px;
  background: linear-gradient(180deg, var(--scan-green-dim), transparent);
  border-bottom: 1px solid var(--border-soft);
}
.orr-banner-left {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.orr-check {
  width: 32px; height: 32px;
  border-radius: 9px;
  background: var(--scan-green);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  margin-top: 1px;
}
.orr-check svg { width: 16px; height: 16px; stroke: #00100a; stroke-width: 3; }
.orr-title { font-size: 16px; font-weight: 600; margin: 0; letter-spacing: -0.01em; }
.orr-sub { font-size: 12.5px; color: var(--text-secondary); margin: 3px 0 0; line-height: 1.45; }
.orr-timestamp {
  font-size: 11px;
  color: var(--text-tertiary);
  white-space: nowrap;
  text-align: right;
  flex-shrink: 0;
}

/* body */
.orr-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
}
@media (max-width: 560px) {
  .orr-body { grid-template-columns: 1fr; }
  .orr-score-col { border-right: none !important; border-bottom: 1px solid var(--border-soft); }
}

.orr-score-col {
  padding: 20px 22px;
  border-right: 1px solid var(--border-soft);
  display: flex;
  flex-direction: column;
}
.orr-label {
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-tertiary);
  margin: 0 0 14px;
}
.orr-score-row {
  display: flex;
  align-items: center;
  gap: 16px;
}
.orr-score-block { text-align: center; }
.orr-score-num { font-size: 30px; font-weight: 600; line-height: 1; }
.orr-score-num.before { color: var(--text-tertiary); }
.orr-score-num.after { color: var(--scan-green); }
.orr-score-tag { font-size: 11px; color: var(--text-secondary); margin-top: 4px; }
.orr-arrow { color: var(--text-tertiary); flex-shrink: 0; }
.orr-arrow svg { width: 16px; height: 16px; }

.orr-delta-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid var(--border-soft);
}
.orr-delta-pill {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 12px;
  font-weight: 600;
  color: var(--scan-green);
  background: var(--scan-green-dim);
  padding: 3px 9px;
  border-radius: 6px;
  flex-shrink: 0;
}
.orr-delta-text { font-size: 12px; color: var(--text-secondary); }

/* skills + download col */
.orr-action-col {
  padding: 20px 22px;
  display: flex;
  flex-direction: column;
}
.orr-skill-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-bottom: 16px;
}
.orr-skill-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-soft);
}
.orr-skill-row:first-child { padding-top: 0; }
.orr-skill-row:last-child { border-bottom: none; padding-bottom: 0; }
.orr-skill-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-primary);
}
.orr-skill-name svg {
  width: 14px; height: 14px;
  color: var(--scan-green);
  flex-shrink: 0;
}
.orr-skill-status {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10.5px;
  color: var(--scan-green);
  background: var(--scan-green-dim);
  padding: 2px 7px;
  border-radius: 5px;
}

.orr-download {
  margin-top: auto;
  display: flex;
  gap: 8px;
}
.orr-btn-download {
  flex: 1;
  background: var(--scan-green);
  color: #00100a;
  border: none;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 600;
  padding: 12px 16px;
  border-radius: 9px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: filter 0.15s;
}
.orr-btn-download:hover { filter: brightness(1.08); }
.orr-btn-download svg { width: 15px; height: 15px; }
.orr-btn-icon {
  width: 42px;
  flex-shrink: 0;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 9px;
  color: var(--text-secondary);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}
.orr-btn-icon:hover { color: var(--text-primary); border-color: var(--text-tertiary); }
.orr-btn-icon svg { width: 16px; height: 16px; }

.orr-filemeta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  font-size: 11px;
  color: var(--text-tertiary);
}
.orr-filemeta svg { width: 12px; height: 12px; }
`;

function Icon({ name, ...props }) {
  const paths = {
    check: <polyline points="20 6 9 17 4 12" />,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></>,
    eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>,
    arrowRight: <><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></>,
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {paths[name]}
    </svg>
  );
}

export default function OptimizedResumeReady({
  beforeScore = 78,
  afterScore = 84,
  injectedSkills = [
    { name: "Docker" },
    { name: "AWS" },
  ],
  generatedAt = "Just now",
  fileSize = "142 KB",
}) {
  const delta = afterScore - beforeScore;

  return (
    <div className="orr-root">
      <style>{styles}</style>

      <div className="orr-card">
        <div className="orr-banner">
          <div className="orr-banner-left">
            <div className="orr-check"><Icon name="check" /></div>
            <div>
              <p className="orr-title display">Optimized resume ready</p>
              <p className="orr-sub">Rewritten with ATS-safe formatting and {injectedSkills.length} injected skills.</p>
            </div>
          </div>
          <span className="orr-timestamp mono">{generatedAt}</span>
        </div>

        <div className="orr-body">
          <div className="orr-score-col">
            <p className="orr-label">ATS match score</p>
            <div className="orr-score-row">
              <div className="orr-score-block">
                <div className="orr-score-num before mono">{beforeScore}</div>
                <div className="orr-score-tag">before</div>
              </div>
              <div className="orr-arrow"><Icon name="arrowRight" /></div>
              <div className="orr-score-block">
                <div className="orr-score-num after mono">{afterScore}</div>
                <div className="orr-score-tag">after</div>
              </div>
            </div>
            <div className="orr-delta-row">
              <span className="orr-delta-pill">+{delta}</span>
              <span className="orr-delta-text">from {injectedSkills.length} injected skills</span>
            </div>
          </div>

          <div className="orr-action-col">
            <p className="orr-label">Skills injected ({injectedSkills.length})</p>
            <div className="orr-skill-list">
              {injectedSkills.map((s) => (
                <div className="orr-skill-row" key={s.name}>
                  <span className="orr-skill-name">
                    <Icon name="check" />
                    {s.name}
                  </span>
                  <span className="orr-skill-status">Injected</span>
                </div>
              ))}
            </div>

            <div className="orr-download">
              <button className="orr-btn-icon" aria-label="Preview resume">
                <Icon name="eye" />
              </button>
              <button className="orr-btn-download">
                <Icon name="download" />
                Download ATS PDF
              </button>
            </div>
            <div className="orr-filemeta">
              <Icon name="file" />
              <span className="mono">resume_optimized.pdf · {fileSize}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
