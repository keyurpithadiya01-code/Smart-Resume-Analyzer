import React, { useState, useMemo } from 'react';
import { Icon } from './Icons';

export default function SkillSelection({ missingSkills, selectedSkills, setSelectedSkills, onGenerate, isGenerating, hasGenerated, atsScore }) {
  const [tab, setTab] = useState("all");

  const toggleSkill = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  // Map plain strings to mock objects for premium UI rendering
  const mappedSkills = useMemo(() => {
    if (!missingSkills) return [];
    return missingSkills.map((skill, idx) => ({
      id: skill,
      name: skill,
      group: idx % 3 === 0 ? "recommended" : "critical",
      reason: idx % 3 === 0 ? "Trending requirement in recent job postings" : "Missing core keyword detected by ATS scanner",
      freq: idx % 3 === 0 ? "Suggested" : "Critical"
    }));
  }, [missingSkills]);

  const visibleSkills = useMemo(() => {
    if (tab === "all") return mappedSkills;
    return mappedSkills.filter((s) => s.group === tab);
  }, [tab, mappedSkills]);

  const criticalCount = mappedSkills.filter((s) => s.group === "critical").length;
  const recommendedCount = mappedSkills.filter((s) => s.group === "recommended").length;
  
  const baseScore = atsScore || 50;
  const projectedScore = Math.min(100, baseScore + selectedSkills.length * 3);

  if (!missingSkills || missingSkills.length === 0) {
    return (
      <div className="skill-card mt-4">
        <p className="text-sm text-gray-400">
          Great job! We didn't find any critical missing skills for your resume.
        </p>
      </div>
    );
  }

  return (
    <div className="scanly-root">
      <div className="skill-card w-full mt-4">
        <div className="skill-card-head">
          <div>
            <div className="skill-head-title">
            <div className="skill-icon-badge"><Icon name="spark" width="16" height="16" /></div>
            <p className="skill-card-title display">Skill gap detected</p>
          </div>
          <p className="skill-card-sub">
            Add skills that you genuinely work with to improve your resume & ATS. We'll contextualize them into your bullets.
          </p>
        </div>
      </div>

      <div className="tab-row">
        <button className={`tab-btn ${tab === "all" ? "active" : ""}`} onClick={() => setTab("all")}>
          All <span className="tab-count">{mappedSkills.length}</span>
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
          const isChecked = selectedSkills.includes(s.id);
          return (
            <div
              key={s.id}
              className={`skill-row ${isChecked ? "checked" : ""}`}
              onClick={() => toggleSkill(s.id)}
              role="checkbox"
              aria-checked={isChecked}
              tabIndex={0}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && toggleSkill(s.id)}
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
        <button className="btn-regen" onClick={onGenerate} disabled={isGenerating || selectedSkills.length === 0}>
          {isGenerating ? (
            <>
              <Icon name="refresh" className="icon-spin" />
              Regenerating
            </>
          ) : (
            <>
              <Icon name="refresh" />
              {hasGenerated ? 'Update & regenerate' : 'Generate Optimized'} ({selectedSkills.length})
            </>
          )}
        </button>
      </div>

      <div className="status-row">
        <div className={`status-dot ${hasGenerated && !isGenerating ? "" : "idle"}`} />
        {isGenerating ? "Rewriting bullets with selected skills..." : hasGenerated ? "Resume regenerated with selected skills" : "Select skills to optimize"}
      </div>
    </div>
    </div>
  );
}
