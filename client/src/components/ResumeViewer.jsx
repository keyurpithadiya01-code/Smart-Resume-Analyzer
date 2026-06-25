import React, { useState } from 'react';
import { Icon } from './Icons';
import api from '../api/client';

export default function ResumeViewer({ originalText, optimizedJson, optimizedResumeId, selectedSkills = [], atsScore = 50 }) {
  const [page, setPage] = useState(1);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!optimizedResumeId) return;
    try {
      setDownloading(true);
      const response = await api.get(`/resume/download/${optimizedResumeId}`, {
        responseType: 'blob', // Important for receiving binary data
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'optimized_resume.pdf');
      document.body.appendChild(link);
      link.click();
      
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (!optimizedJson) return null;

  const baseScore = atsScore;
  const projectedScore = Math.min(100, baseScore + (selectedSkills?.length || 0) * 3);

  return (
    <div className="scanly-root">
      <div className="result-section w-full">
        <div className="result-header">
          <div className="result-head-left flex flex-col sm:flex-row gap-4 sm:gap-12">
            <div className="flex items-center gap-4">
              <p className="result-title display">Optimized Resume</p>
              <div className="result-badge">
                <Icon name="check" /> ATS-ready
              </div>
            </div>
          </div>

          <div className="download-bar">
            <button className="btn-download" onClick={handleDownload}>
              <Icon name="download" />
              Download ATS PDF
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 mt-6">
          <div className="diff-card flex-1">
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
            <div className="score-delta">+{projectedScore - baseScore} points from {selectedSkills.length} injected skills</div>
          </div>

          <div className="diff-card flex-1">
            <p className="diff-label">Skills injected ({selectedSkills.length})</p>
            {selectedSkills.length === 0 ? (
              <p style={{ fontSize: 12.5, color: "var(--text-tertiary)", margin: 0 }}>No skills selected yet.</p>
            ) : (
              <div className="injected-list max-h-[140px] overflow-y-auto custom-scrollbar pr-2">
                {selectedSkills.map((skill, i) => (
                  <div className="injected-row" key={i}>
                    <span className="injected-name">
                      <Icon name="check" />
                      {skill}
                    </span>
                    <span className="injected-where mono">Injected</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
