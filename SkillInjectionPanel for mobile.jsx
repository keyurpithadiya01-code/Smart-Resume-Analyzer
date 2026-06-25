import React, { useState, useMemo } from "react";

/* ============================================================
   SCANLY — Skill Gap Panel + Generated Resume / PDF Viewer
   Design tokens (from existing Scanly system):
   --ink-navy:      #0a0e14   (page bg)
   --surface:       #11161f   (card bg)
   --surface-raised:#161c28   (raised card / hover)
   --border:        #1f2733
   --scan-green:    #00ffa3   (primary accent)
   --scan-green-dim:#00ffa31a (15% wash)
   --text-primary:  #e8ecf1
   --text-secondary:#7b8696
   --text-tertiary: #4a5364
   --amber:         #ffb454   (gap / attention)
   --red:           #ff5d5d   (missing / critical)
   Fonts: Space Grotesk (display), Inter (body), IBM Plex Mono (data/score)
   ============================================================ */

const styles = `
.scanly-root {
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
  --amber: #ffb454;
  --amber-dim: rgba(255,180,84,0.12);
  --red: #ff5d5d;
  --red-dim: rgba(255,93,93,0.1);
  font-family: 'Inter', -apple-system, sans-serif;
  color: var(--text-primary);
  background: var(--ink-navy);
  padding: 32px;
  border-radius: 16px;
}
.scanly-root * { box-sizing: border-box; }
.mono { font-family: 'IBM Plex Mono', monospace; }
.display { font-family: 'Space Grotesk', sans-serif; }

/* ---------- Skill panel ---------- */
.skill-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 24px;
  max-width: 460px;
}
.skill-card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 4px;
}
.skill-head-title {
  display: flex;
  align-items: center;
  gap: 10px;
}
.skill-icon-badge {
  width: 30px; height: 30px;
  border-radius: 8px;
  background: var(--scan-green-dim);
  border: 1px solid var(--scan-green-line);
  display: flex; align-items: center; justify-content: center;
  color: var(--scan-green);
  flex-shrink: 0;
}
.skill-card-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  letter-spacing: -0.01em;
}
.skill-card-sub {
  font-size: 12.5px;
  color: var(--text-secondary);
  margin: 6px 0 0 40px;
  line-height: 1.5;
}
.match-pill {
  display: flex;
  align-items: baseline;
  gap: 3px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px;
  color: var(--text-tertiary);
  white-space: nowrap;
  padding-top: 4px;
}
.match-pill b {
  font-size: 18px;
  color: var(--scan-green);
  font-weight: 600;
}
.match-pill.up b { color: var(--scan-green); }

.tab-row {
  display: flex;
  gap: 4px;
  margin: 20px 0 16px;
  padding: 3px;
  background: var(--ink-navy);
  border: 1px solid var(--border-soft);
  border-radius: 9px;
}
.tab-btn {
  flex: 1;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 12.5px;
  font-weight: 500;
  padding: 7px 8px;
  border-radius: 7px;
  cursor: pointer;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: background 0.15s, color 0.15s;
}
.tab-btn.active {
  background: var(--surface-raised);
  color: var(--text-primary);
}
.tab-count {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10.5px;
  background: var(--border);
  color: var(--text-secondary);
  padding: 1px 5px;
  border-radius: 5px;
}
.tab-btn.active .tab-count.crit {
  background: var(--red-dim);
  color: var(--red);
}
.tab-btn.active .tab-count.rec {
  background: var(--scan-green-dim);
  color: var(--scan-green);
}

.skill-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 348px;
  overflow-y: auto;
  margin-bottom: 4px;
  padding-right: 2px;
}
.skill-list::-webkit-scrollbar { width: 5px; }
.skill-list::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

.skill-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 11px 12px;
  border-radius: 10px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.skill-row:hover { background: var(--surface-raised); }
.skill-row.checked {
  background: var(--scan-green-dim);
  border-color: var(--scan-green-line);
}

.skill-check {
  width: 20px; height: 20px;
  border-radius: 6px;
  border: 1.5px solid var(--border);
  background: var(--ink-navy);
  flex-shrink: 0;
  margin-top: 1px;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s, border-color 0.15s;
}
.skill-row.checked .skill-check {
  background: var(--scan-green);
  border-color: var(--scan-green);
}
.skill-row.checked .skill-check svg { stroke: #00100a; }
.skill-check svg { width: 12px; height: 12px; stroke: transparent; stroke-width: 3; }

.skill-body { flex: 1; min-width: 0; }
.skill-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.skill-name {
  font-size: 13.5px;
  font-weight: 500;
  color: var(--text-primary);
}
.skill-tag {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 5px;
}
.skill-tag.critical { background: var(--red-dim); color: var(--red); }
.skill-tag.recommended { background: var(--amber-dim); color: var(--amber); }
.skill-reason {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 3px;
  line-height: 1.4;
}
.skill-freq {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px;
  color: var(--text-tertiary);
  flex-shrink: 0;
  text-align: right;
  margin-top: 1px;
  white-space: nowrap;
}

.skill-card-foot {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid var(--border-soft);
}
.foot-score { flex-shrink: 0; text-align: left; }
.foot-score-num {
  font-size: 20px;
  font-weight: 600;
  color: var(--scan-green);
  display: block;
  line-height: 1.1;
}
.foot-score-label {
  font-size: 10px;
  color: var(--text-tertiary);
  white-space: nowrap;
}
.btn-regen {
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
  gap: 7px;
  transition: filter 0.15s, opacity 0.15s;
}
.btn-regen:hover { filter: brightness(1.08); }
.btn-regen:disabled {
  background: var(--border);
  color: var(--text-tertiary);
  cursor: not-allowed;
}
.btn-regen svg { width: 15px; height: 15px; }
.icon-spin { animation: scanly-spin 0.9s linear infinite; }
@keyframes scanly-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.status-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
  font-size: 12.5px;
  color: var(--text-secondary);
}
.status-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: var(--scan-green);
  box-shadow: 0 0 0 3px var(--scan-green-dim);
}
.status-dot.idle { background: var(--text-tertiary); box-shadow: none; }

/* ---------- Generated resume / PDF viewer section ---------- */
.result-section {
  max-width: 920px;
  margin-top: 28px;
}
.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 16px;
  flex-wrap: wrap;
}
.result-head-left { display: flex; align-items: center; gap: 12px; }
.result-title {
  font-size: 17px;
  font-weight: 600;
  margin: 0;
  letter-spacing: -0.01em;
}
.result-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--scan-green);
  background: var(--scan-green-dim);
  border: 1px solid var(--scan-green-line);
  padding: 4px 10px;
  border-radius: 20px;
}
.result-badge svg { width: 12px; height: 12px; }

.download-bar {
  display: flex;
  align-items: center;
  gap: 10px;
}
.btn-download {
  background: var(--scan-green);
  color: #00100a;
  border: none;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 600;
  padding: 11px 18px;
  border-radius: 9px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: filter 0.15s;
}
.btn-download:hover { filter: brightness(1.08); }
.btn-download svg { width: 15px; height: 15px; }
.btn-secondary {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border);
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  padding: 10px 14px;
  border-radius: 9px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: border-color 0.15s, color 0.15s;
}
.btn-secondary:hover { color: var(--text-primary); border-color: var(--text-tertiary); }
.btn-secondary svg { width: 14px; height: 14px; }

.result-grid {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 20px;
  align-items: start;
}
@media (max-width: 760px) {
  .result-grid { grid-template-columns: 1fr; }
}

/* PDF viewer (left) */
.pdf-frame {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  overflow: hidden;
}
.pdf-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-bottom: 1px solid var(--border-soft);
  background: var(--surface-raised);
}
.pdf-toolbar-left {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: var(--text-secondary);
}
.pdf-filename {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11.5px;
  color: var(--text-primary);
}
.pdf-zoom { display: flex; align-items: center; gap: 8px; }
.icon-btn {
  width: 26px; height: 26px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-secondary);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
}
.icon-btn:hover { color: var(--text-primary); border-color: var(--text-tertiary); }
.icon-btn svg { width: 13px; height: 13px; }
.zoom-pct { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: var(--text-tertiary); min-width: 32px; text-align: center; }

.pdf-page-wrap {
  background: #060810;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-height: 640px;
  overflow-y: auto;
}
.pdf-page-wrap::-webkit-scrollbar { width: 6px; }
.pdf-page-wrap::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

.pdf-page {
  background: #ffffff;
  width: 100%;
  max-width: 420px;
  aspect-ratio: 8.5 / 11;
  border-radius: 2px;
  box-shadow: 0 2px 24px rgba(0,0,0,0.5);
  padding: 28px 26px;
  color: #1a1a1a;
  font-size: 7px;
  line-height: 1.5;
  position: relative;
  overflow: hidden;
}
.doc-name { font-family: 'Space Grotesk', sans-serif; font-size: 15px; font-weight: 600; color: #0a0e14; margin: 0; }
.doc-role { font-size: 9px; color: #555; margin: 2px 0 10px; }
.doc-contact { font-size: 7px; color: #777; margin-bottom: 14px; display: flex; gap: 10px; flex-wrap: wrap; }
.doc-section-label {
  font-size: 7.5px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #00997a;
  border-bottom: 1px solid #cdeee2;
  padding-bottom: 3px;
  margin: 12px 0 7px;
  text-transform: uppercase;
}
.doc-line { margin: 0 0 5px; color: #333; }
.doc-skill-chips { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 4px; }
.doc-chip {
  font-size: 6.5px;
  padding: 2px 6px;
  border-radius: 4px;
  background: #f1f5f3;
  color: #333;
}
.doc-chip.new { background: #d9f7eb; color: #00785f; font-weight: 600; }

.pdf-pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 10px;
  border-top: 1px solid var(--border-soft);
  background: var(--surface-raised);
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11.5px;
  color: var(--text-secondary);
}

/* Diff / score rail (right) */
.diff-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 18px;
}
.diff-card + .diff-card { margin-top: 14px; }
.diff-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-tertiary);
  margin: 0 0 12px;
}
.score-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
}
.score-block { text-align: center; }
.score-num {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 26px;
  font-weight: 600;
}
.score-num.before { color: var(--text-tertiary); }
.score-num.after { color: var(--scan-green); }
.score-tag { font-size: 10.5px; color: var(--text-secondary); margin-top: 2px; }
.score-arrow { color: var(--text-tertiary); }
.score-arrow svg { width: 18px; height: 18px; }
.score-delta {
  text-align: center;
  margin-top: 10px;
  font-size: 12px;
  color: var(--scan-green);
  font-family: 'IBM Plex Mono', monospace;
}

.injected-list { display: flex; flex-direction: column; gap: 8px; }
.injected-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12.5px;
  padding: 7px 0;
  border-bottom: 1px solid var(--border-soft);
}
.injected-row:last-child { border-bottom: none; }
.injected-name { display: flex; align-items: center; gap: 7px; color: var(--text-primary); }
.injected-name svg { width: 13px; height: 13px; color: var(--scan-green); flex-shrink: 0; }
.injected-where { font-size: 10.5px; color: var(--text-tertiary); }

/* ---------- Mobile (<=480px) ---------- */
@media (max-width: 480px) {
  .scanly-root { padding: 16px; border-radius: 0; }

  .skill-card { max-width: 100%; padding: 18px 16px; border-radius: 12px; }
  .skill-card-sub { margin-left: 0; margin-top: 10px; font-size: 12.5px; }
  .skill-head-title { align-items: flex-start; }
  .skill-card-head { flex-direction: column; }

  .tab-row { margin: 18px 0 14px; }
  .tab-btn { font-size: 11.5px; padding: 8px 4px; gap: 4px; }
  .tab-btn span.tab-count { font-size: 10px; padding: 1px 4px; }

  .skill-list { max-height: none; gap: 6px; }
  .skill-row { padding: 12px 10px; gap: 10px; min-height: 44px; }
  .skill-check { width: 22px; height: 22px; }
  .skill-name { font-size: 13px; }
  .skill-name-row { gap: 6px; }
  .skill-tag { font-size: 9.5px; padding: 2px 5px; }
  .skill-reason { font-size: 11.5px; }
  .skill-freq { display: none; }

  .skill-card-foot { flex-direction: column; align-items: stretch; gap: 12px; }
  .foot-score { display: flex; align-items: baseline; justify-content: center; gap: 6px; text-align: center; }
  .foot-score-num { font-size: 22px; }
  .btn-regen { width: 100%; padding: 13px 16px; }

  .status-row { font-size: 11.5px; text-align: center; justify-content: center; }

  /* Result section */
  .result-section { max-width: 100%; margin-top: 24px; padding-bottom: 84px; }
  .result-header { flex-direction: column; align-items: flex-start; gap: 10px; margin-bottom: 14px; }
  .result-title { font-size: 16px; }
  .download-bar { display: none; }

  .result-grid { grid-template-columns: 1fr; gap: 14px; }

  .pdf-frame { border-radius: 12px; }
  .pdf-toolbar { padding: 9px 12px; }
  .pdf-filename { font-size: 10px; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .pdf-zoom { display: none; }
  .pdf-page-wrap { padding: 16px; max-height: 480px; }
  .pdf-page { max-width: 100%; font-size: 6.5px; padding: 22px 20px; }
  .doc-name { font-size: 14px; }

  .diff-card { padding: 16px; }
  .score-row { gap: 14px; }
  .score-num { font-size: 22px; }

  /* sticky bottom action bar replaces the top download-bar on mobile */
  .mobile-sticky-bar {
    display: flex;
    position: fixed;
    left: 0; right: 0; bottom: 0;
    gap: 10px;
    padding: 12px 16px;
    padding-bottom: max(12px, env(safe-area-inset-bottom));
    background: var(--surface);
    border-top: 1px solid var(--border);
    z-index: 20;
  }
  .mobile-sticky-bar .btn-secondary {
    flex: 0 0 auto;
    width: 46px;
    padding: 0;
    justify-content: center;
  }
  .mobile-sticky-bar .btn-secondary span { display: none; }
  .mobile-sticky-bar .btn-download { flex: 1; justify-content: center; padding: 13px 16px; }
}
@media (min-width: 481px) {
  .mobile-sticky-bar { display: none; }
}
`;

/* ---------- Data ---------- */

const SKILLS = [
  { id: "ts", name: "TypeScript", group: "critical", reason: "Appears in 4 of 5 target job descriptions", freq: "4/5 JDs" },
  { id: "git", name: "Git / version control", group: "critical", reason: "Listed as a core requirement for frontend developer roles", freq: "5/5 JDs" },
  { id: "docker", name: "Docker", group: "recommended", reason: "Mentioned in roles with deployment ownership", freq: "2/5 JDs" },
  { id: "rest", name: "REST API design", group: "critical", reason: "Standard expectation for full-stack-leaning frontend roles", freq: "5/5 JDs" },
  { id: "test", name: "Unit testing (Jest / Mocha)", group: "recommended", reason: "Trending requirement across mid-senior listings", freq: "3/5 JDs" },
  { id: "aws", name: "AWS / cloud services", group: "recommended", reason: "Appears in postings with infra-adjacent responsibilities", freq: "2/5 JDs" },
  { id: "agile", name: "Agile methodology", group: "recommended", reason: "Common soft requirement, low differentiation", freq: "3/5 JDs" },
  { id: "redux", name: "Redux", group: "recommended", reason: "Common in React-heavy job descriptions", freq: "2/5 JDs" },
];

const initialChecked = { ts: true, git: true, docker: true, rest: false, test: false, aws: false, agile: false, redux: false };

function Icon({ name, ...props }) {
  const paths = {
    spark: <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />,
    check: <polyline points="20 6 9 17 4 12" />,
    refresh: <><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></>,
    chevDown: <polyline points="6 9 12 15 18 9" />,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></>,
    eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>,
    minus: <line x1="5" y1="12" x2="19" y2="12" />,
    plus: <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>,
    arrowRight: <><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></>,
    chevLeft: <polyline points="15 18 9 12 15 6" />,
    chevRight: <polyline points="9 18 15 12 9 6" />,
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {paths[name]}
    </svg>
  );
}

export default function SkillInjectionPanel() {
  const [checked, setChecked] = useState(initialChecked);
  const [tab, setTab] = useState("all");
  const [generated, setGenerated] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [page, setPage] = useState(1);

  const toggle = (id) => setChecked((c) => ({ ...c, [id]: !c[id] }));

  const visibleSkills = useMemo(() => {
    if (tab === "all") return SKILLS;
    return SKILLS.filter((s) => s.group === tab);
  }, [tab]);

  const selectedCount = Object.values(checked).filter(Boolean).length;
  const criticalCount = SKILLS.filter((s) => s.group === "critical").length;
  const recommendedCount = SKILLS.filter((s) => s.group === "recommended").length;

  const baseScore = 61;
  const projectedScore = Math.min(96, baseScore + selectedCount * 4);

  const injectedSkills = SKILLS.filter((s) => checked[s.id]);

  const handleRegenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
    }, 1100);
  };

  return (
    <div className="scanly-root">
      <style>{styles}</style>

      {/* ---------- Skill panel ---------- */}
      <div className="skill-card">
        <div className="skill-card-head">
          <div>
            <div className="skill-head-title">
              <div className="skill-icon-badge"><Icon name="spark" width="16" height="16" /></div>
              <p className="skill-card-title display">Skill gap detected</p>
            </div>
            <p className="skill-card-sub">
              Cross-checked against 5 frontend developer postings. Select the skills you genuinely have — we'll work them into your bullets, not just bolt on a list.
            </p>
          </div>
        </div>

        <div className="tab-row">
          <button className={`tab-btn ${tab === "all" ? "active" : ""}`} onClick={() => setTab("all")}>
            All <span className="tab-count">{SKILLS.length}</span>
          </button>
          <button className={`tab-btn ${tab === "critical" ? "active" : ""}`} onClick={() => setTab("critical")}>
            Missing <span className="tab-count crit">{criticalCount}</span>
          </button>
          <button className={`tab-btn ${tab === "recommended" ? "active" : ""}`} onClick={() => setTab("recommended")}>
            Recommended <span className="tab-count rec">{recommendedCount}</span>
          </button>
        </div>

        <div className="skill-list">
          {visibleSkills.map((s) => {
            const isChecked = !!checked[s.id];
            return (
              <div
                key={s.id}
                className={`skill-row ${isChecked ? "checked" : ""}`}
                onClick={() => toggle(s.id)}
                role="checkbox"
                aria-checked={isChecked}
                tabIndex={0}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && toggle(s.id)}
              >
                <div className="skill-check">
                  <Icon name="check" stroke={isChecked ? "#00100a" : "transparent"} />
                </div>
                <div className="skill-body">
                  <div className="skill-name-row">
                    <span className="skill-name">{s.name}</span>
                    <span className={`skill-tag ${s.group}`}>
                      {s.group === "critical" ? "missing" : "suggested"}
                    </span>
                  </div>
                  <p className="skill-reason">{s.reason}</p>
                </div>
                <div className="skill-freq mono">{s.freq}</div>
              </div>
            );
          })}
        </div>

        <div className="skill-card-foot">
          <div className="foot-score">
            <span className="foot-score-num mono">{projectedScore}</span>
            <span className="foot-score-label">projected ATS score</span>
          </div>
          <button className="btn-regen" onClick={handleRegenerate} disabled={generating || selectedCount === 0}>
            {generating ? (
              <>
                <Icon name="refresh" className="icon-spin" />
                Regenerating
              </>
            ) : (
              <>
                <Icon name="refresh" />
                Update &amp; regenerate ({selectedCount})
              </>
            )}
          </button>
        </div>

        <div className="status-row">
          <div className={`status-dot ${generated && !generating ? "" : "idle"}`} />
          {generating ? "Rewriting bullets with selected skills..." : generated ? "Resume regenerated with selected skills" : "Select skills to regenerate"}
        </div>
      </div>

      {/* ---------- Generated resume / PDF viewer ---------- */}
      {generated && !generating && (
        <div className="result-section">
          <div className="result-header">
            <div className="result-head-left">
              <p className="result-title display">Optimized resume</p>
              <div className="result-badge">
                <Icon name="check" />
                ATS-ready
              </div>
            </div>
            <div className="download-bar">
              <button className="btn-secondary">
                <Icon name="eye" />
                Preview full size
              </button>
              <button className="btn-download">
                <Icon name="download" />
                Download ATS PDF
              </button>
            </div>
          </div>

          <div className="result-grid">
            {/* PDF preview pane */}
            <div className="pdf-frame">
              <div className="pdf-toolbar">
                <div className="pdf-toolbar-left">
                  <Icon name="file" width="14" height="14" />
                  <span className="pdf-filename mono">keyur_pithadiya_resume_optimized.pdf</span>
                </div>
                <div className="pdf-zoom">
                  <button className="icon-btn" aria-label="Zoom out"><Icon name="minus" /></button>
                  <span className="zoom-pct">100%</span>
                  <button className="icon-btn" aria-label="Zoom in"><Icon name="plus" /></button>
                </div>
              </div>

              <div className="pdf-page-wrap">
                <div className="pdf-page">
                  <p className="doc-name">Keyur Pithadiya</p>
                  <p className="doc-role">Frontend Developer</p>
                  <div className="doc-contact">
                    <span>keyur.pithadiya@email.com</span>
                    <span>+91 00000 00000</span>
                    <span>Vadodara, GJ</span>
                  </div>

                  <p className="doc-section-label">Summary</p>
                  <p className="doc-line">
                    CS &amp; Design undergraduate with full-stack MERN experience across two internships, building
                    production features in React with disciplined version control and containerized delivery workflows.
                  </p>

                  <p className="doc-section-label">Core skills</p>
                  <div className="doc-skill-chips">
                    <span className="doc-chip">React</span>
                    <span className="doc-chip">Node.js</span>
                    <span className="doc-chip">MongoDB</span>
                    {injectedSkills.map((s) => (
                      <span className="doc-chip new" key={s.id}>{s.name}</span>
                    ))}
                  </div>

                  <p className="doc-section-label">Experience</p>
                  <p className="doc-line" style={{ fontWeight: 600, color: "#111" }}>MERN Stack Intern — Prelytix</p>
                  <p className="doc-line">
                    Shipped React components against a {checked.git ? "Git-managed " : ""}
                    feature-branch workflow{checked.docker ? ", with builds packaged into Docker images for staging" : ""}.
                  </p>
                  <p className="doc-line" style={{ fontWeight: 600, color: "#111" }}>Web Development Intern — Coders Crafter</p>
                  <p className="doc-line">
                    Built and maintained client-facing pages{checked.rest ? ", integrating REST APIs for dynamic content" : ""}
                    {checked.test ? " with unit-tested components" : ""}.
                  </p>

                  <p className="doc-section-label">Projects</p>
                  <p className="doc-line" style={{ fontWeight: 600, color: "#111" }}>AI Resume Analyzer — React, Node.js, MongoDB, Gemini API</p>
                  <p className="doc-line">End-to-end resume scoring tool with Gemini-powered feedback generation.</p>
                  <p className="doc-line" style={{ fontWeight: 600, color: "#111" }}>Job Recruitment System — Socket.io, real-time matching</p>
                  <p className="doc-line">Real-time recruitment platform with live status updates and AI-assisted rejection feedback.</p>

                  <p className="doc-section-label">Education</p>
                  <p className="doc-line" style={{ fontWeight: 600, color: "#111" }}>B.Tech, Computer Science and Design — GCET, CVM University</p>
                  <p className="doc-line">Sem 5 CGPA 8.34 · NPTEL certified in IoT and Cloud Computing</p>
                </div>
              </div>

              <div className="pdf-pager">
                <button className="icon-btn" onClick={() => setPage((p) => Math.max(1, p - 1))} aria-label="Previous page">
                  <Icon name="chevLeft" />
                </button>
                <span>Page {page} of 2</span>
                <button className="icon-btn" onClick={() => setPage((p) => Math.min(2, p + 1))} aria-label="Next page">
                  <Icon name="chevRight" />
                </button>
              </div>
            </div>

            {/* Diff / score rail */}
            <div>
              <div className="diff-card">
                <p className="diff-label">ATS match score</p>
                <div className="score-row">
                  <div className="score-block">
                    <div className="score-num before mono">{baseScore}</div>
                    <div className="score-tag">before</div>
                  </div>
                  <div className="score-arrow"><Icon name="arrowRight" /></div>
                  <div className="score-block">
                    <div className="score-num after mono">{projectedScore}</div>
                    <div className="score-tag">after</div>
                  </div>
                </div>
                <div className="score-delta">+{projectedScore - baseScore} points from {selectedCount} injected skills</div>
              </div>

              <div className="diff-card">
                <p className="diff-label">Skills injected ({injectedSkills.length})</p>
                {injectedSkills.length === 0 ? (
                  <p style={{ fontSize: 12.5, color: "var(--text-tertiary)", margin: 0 }}>No skills selected yet.</p>
                ) : (
                  <div className="injected-list">
                    {injectedSkills.map((s) => (
                      <div className="injected-row" key={s.id}>
                        <span className="injected-name">
                          <Icon name="check" />
                          {s.name}
                        </span>
                        <span className="injected-where mono">{s.freq}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {generated && !generating && (
        <div className="mobile-sticky-bar">
          <button className="btn-secondary" aria-label="Preview full size">
            <Icon name="eye" />
            <span>Preview</span>
          </button>
          <button className="btn-download">
            <Icon name="download" />
            Download ATS PDF
          </button>
        </div>
      )}
    </div>
  );
}
