import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Landing() {
  useEffect(() => {
    const revealEls = document.querySelectorAll('.reveal');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
    }, { threshold: 0.15 });
    revealEls.forEach(el => obs.observe(el));

    const bars = [
      {bar:'bar1', val:'val1', target:96},
      {bar:'bar2', val:'val2', target:81},
      {bar:'bar3', val:'val3', target:74},
      {bar:'bar4', val:'val4', target:88},
    ];
    let demoPlayed = false;
    function playDemo(){
      bars.forEach((b, i) => {
        const barEl = document.getElementById(b.bar);
        const valEl = document.getElementById(b.val);
        if(!barEl || !valEl) return;
        setTimeout(() => {
          barEl.style.width = b.target + '%';
          let cur = 0;
          const step = setInterval(() => {
            cur += 2;
            if (cur >= b.target){ cur = b.target; clearInterval(step); }
            valEl.textContent = cur + '%';
          }, 18);
        }, i * 160);
      });
    }

    const demoSection = document.getElementById('demo');
    if (demoSection) {
      const demoObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting && !demoPlayed){ demoPlayed = true; playDemo(); }
        });
      }, { threshold: 0.4 });
      demoObs.observe(demoSection);
    }
  }, []);

  const handleDemoClick = () => {
    const bars = [
      {bar:'bar1', val:'val1', target:96},
      {bar:'bar2', val:'val2', target:81},
      {bar:'bar3', val:'val3', target:74},
      {bar:'bar4', val:'val4', target:88},
    ];
    bars.forEach(b => { 
      const bEl = document.getElementById(b.bar);
      const vEl = document.getElementById(b.val);
      if (bEl) bEl.style.width = '0%'; 
      if (vEl) vEl.textContent = '0%'; 
    });
    setTimeout(() => {
      bars.forEach((b, i) => {
        const barEl = document.getElementById(b.bar);
        const valEl = document.getElementById(b.val);
        if(!barEl || !valEl) return;
        setTimeout(() => {
          barEl.style.width = b.target + '%';
          let cur = 0;
          const step = setInterval(() => {
            cur += 2;
            if (cur >= b.target){ cur = b.target; clearInterval(step); }
            valEl.textContent = cur + '%';
          }, 18);
        }, i * 160);
      });
    }, 80);
  };

  return (
    <>
      <section className="hero">
        <div className="hero-grid"></div>
        <div className="hero-copy">
          <div className="eyebrow"><span className="blip"></span> AI resume scan · 8 second read</div>
          <h1>
            <span className="strike"><span>Your resume,</span></span>
            <span className="strike"><span><span className="accent">read</span> like an</span></span>
            <span className="strike"><span>ATS would.</span></span>
          </h1>
          <p className="hero-sub">Drop in your resume and Scanly scores it line by line — keyword match, formatting risk, and the exact edits that move you from "filtered out" to "shortlisted."</p>
          <div className="hero-cta">
            <Link to="/signup" className="btn-primary">Scan my resume free →</Link>
            <a href="#demo" className="btn-secondary">See it work</a>
          </div>
          <div className="hero-meta">
            <div><div className="num">2.4M+</div><div className="label">Resumes scanned</div></div>
            <div><div className="num">93%</div><div className="label">Interview lift*</div></div>
            <div><div className="num">8 sec</div><div className="label">Avg. scan time</div></div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="scan-stage">
            <div className="resume-card">
              <div className="r-name">Keyur Pithadiya</div>
              <div className="r-role">PRODUCT DESIGNER · BANGALORE</div>
              <div className="r-block">
                <div className="r-block-title">Summary</div>
                <div className="r-line med"></div>
                <div className="r-line short"></div>
              </div>
              <div className="r-block">
                <div className="r-block-title">Experience</div>
                <div className="r-line med"></div>
                <div className="r-line med"></div>
                <div className="r-line short"></div>
              </div>
              <div className="r-block">
                <div className="r-block-title">Skills</div>
                <span className="r-tag">Figma</span><span className="r-tag">UX Research</span><span className="r-tag">Prototyping</span><span className="r-tag">Design Systems</span>
              </div>
              <div className="scan-tint"></div>
              <div className="scan-line"></div>
            </div>
            <div className="tag-callout green tag-1">✓ ATS-safe format</div>
            <div className="tag-callout amber tag-2">⚠ Add metrics to bullet 2</div>
            <div className="tag-callout green tag-3">✓ 12 keywords matched</div>
            <div className="tag-callout amber tag-4">⚠ Summary too generic</div>
            <div className="score-ring">
              <svg viewBox="0 0 100 100"><circle className="bg" cx="50" cy="50" r="46"></circle><circle className="fg" cx="50" cy="50" r="46"></circle></svg>
              <div className="num">92</div>
              <div className="lab">SCORE</div>
            </div>
          </div>
        </div>
      </section>

      <div className="stats-strip">
        <div className="stat"><div className="snum">2.4M<span className="u">+</span></div><div className="slabel">RESUMES PARSED</div></div>
        <div className="stat"><div className="snum">140<span className="u">+</span></div><div className="slabel">ATS RULESETS MODELED</div></div>
        <div className="stat"><div className="snum">93<span className="u">%</span></div><div className="slabel">REPORTED INTERVIEW LIFT</div></div>
        <div className="stat"><div className="snum">4.9<span className="u">/5</span></div><div className="slabel">AVG. USER RATING</div></div>
      </div>

      <section id="how">
        <div className="section-head reveal">
          <div className="section-eyebrow">The scan sequence</div>
          <h2>Four passes. One file. Every weak spot surfaced.</h2>
          <p>Scanly runs your resume through the same checks recruiting software does — then explains, in plain language, exactly what to fix.</p>
        </div>
        <div className="flow reveal">
          <div className="flow-step">
            <div className="fnum">01 / PARSE</div>
            <h3>Structure check</h3>
            <p>We extract every section the way an ATS would — flagging tables, columns, and graphics that get silently dropped.</p>
          </div>
          <div className="flow-step">
            <div className="fnum">02 / MATCH</div>
            <h3>Keyword match</h3>
            <p>Paste a job description and we map your skills against it, surfacing exact terms you're missing.</p>
          </div>
          <div className="flow-step">
            <div className="fnum">03 / SCORE</div>
            <h3>Impact scoring</h3>
            <p>Every bullet is rated for weak verbs, missing metrics, and clarity — not just keyword stuffing.</p>
          </div>
          <div className="flow-step">
            <div className="fnum">04 / REWRITE</div>
            <h3>Guided fixes</h3>
            <p>Get rewritten bullet suggestions you can accept, edit, or ignore — never auto-replaced without you.</p>
          </div>
        </div>
      </section>

      <section id="features">
        <div className="section-head reveal">
          <div className="section-eyebrow">What it checks</div>
          <h2>Built around the things that actually sink resumes.</h2>
        </div>
        <div className="feature-grid reveal">
          <div className="feature-card">
            <div className="ficon-wrap">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00ffa3" strokeWidth="1.8"><path d="M12 2 3 7l9 5 9-5-9-5Z"/><path d="M3 12l9 5 9-5M3 17l9 5 9-5" opacity=".5"/></svg>
            </div>
            <h3>ATS compatibility</h3>
            <p>Catches parsing traps — tables, text boxes, icons-as-bullets — modeled against 140+ real applicant tracking systems.</p>
          </div>
          <div className="feature-card">
            <div className="ficon-wrap">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00ffa3" strokeWidth="1.8"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>
            </div>
            <h3>Keyword gap analysis</h3>
            <p>Paste the job post. Scanly shows exactly which required skills are missing from your resume — and where to add them.</p>
          </div>
          <div className="feature-card">
            <div className="ficon-wrap">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00ffa3" strokeWidth="1.8"><path d="M3 17v4h4M21 7V3h-4M3 7l8-4 8 4M3 17l8 4 8-4M3 7v10M21 7v10"/></svg>
            </div>
            <h3>Bullet-level scoring</h3>
            <p>Each line gets a clarity and impact score, with the weak verb or missing number called out directly.</p>
          </div>
          <div className="feature-card wide">
            <div className="ficon-wrap">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00ffa3" strokeWidth="1.8"><path d="M12 20V10M18 20V4M6 20v-4"/></svg>
            </div>
            <h3>Benchmarked against your field</h3>
            <p>Your score is compared against resumes that landed interviews in the same role and seniority — so "good enough" actually means something.</p>
          </div>
          <div className="feature-card">
            <div className="ficon-wrap">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00ffa3" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
            </div>
            <h3>Version history</h3>
            <p>Track every edit and the score change it produced, so you know which changes actually helped.</p>
          </div>
        </div>
      </section>

      <section id="demo">
        <div className="section-head reveal">
          <div className="section-eyebrow">See it work</div>
          <h2>Upload once. Read the breakdown instantly.</h2>
        </div>
        <div className="demo-panel reveal">
          <div className="demo-left">
            <div className="upload-zone" id="uploadZone" tabIndex="0" role="button" onClick={handleDemoClick}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#00ffa3" strokeWidth="1.6"><path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/></svg>
              <div className="ut">Drop your resume here</div>
              <div className="us">PDF or DOCX · click to try a sample scan</div>
            </div>
          </div>
          <div className="demo-right">
            <h4>Live breakdown</h4>
            <div className="metric-row">
              <div className="mlabel">ATS FORMAT</div>
              <div className="metric-bar-wrap"><div className="metric-bar" id="bar1"></div></div>
              <div className="metric-val" id="val1">0%</div>
            </div>
            <div className="metric-row">
              <div className="mlabel">KEYWORD MATCH</div>
              <div className="metric-bar-wrap"><div className="metric-bar" id="bar2"></div></div>
              <div className="metric-val" id="val2">0%</div>
            </div>
            <div className="metric-row">
              <div className="mlabel">BULLET IMPACT</div>
              <div className="metric-bar-wrap"><div className="metric-bar" id="bar3"></div></div>
              <div className="metric-val" id="val3">0%</div>
            </div>
            <div className="metric-row">
              <div className="mlabel">CLARITY</div>
              <div className="metric-bar-wrap"><div className="metric-bar" id="bar4"></div></div>
              <div className="metric-val" id="val4">0%</div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2>Stop guessing why you're not <span className="accent">getting calls back.</span></h2>
        <p>Free scan, no credit card. Takes about as long as making coffee.</p>
        <Link to="/signup" className="btn-primary">Create free account →</Link>
      </section>
    </>
  );
}
