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
      <div className="skill-card w-full mt-4">
        <div className="skill-card-head">
          <div>
            <div className="skill-head-title">
              <div className="skill-icon-badge" style={{ backgroundColor: 'var(--scan-green)', color: '#00100a' }}><Icon name="check" /></div>
              <p className="skill-card-title display">Optimized Resume Ready</p>
            </div>
            <p className="skill-card-sub">
              Your resume has been successfully rewritten with ATS-friendly formatting and injected skills.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row p-6 gap-8">
          <div className="flex-1 md:border-r border-[#232b35] md:pr-8 flex flex-col justify-center">
            <p className="diff-label text-center mb-6">ATS match score</p>
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

          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-full text-center mb-6">
              <button className="btn-download mx-auto" onClick={handleDownload} disabled={downloading}>
                <Icon name="download" />
                {downloading ? 'Downloading...' : 'Download ATS PDF'}
              </button>
            </div>

            <div className="w-full">
              <p className="diff-label text-center mb-3">Skills injected ({selectedSkills.length})</p>
              {selectedSkills.length === 0 ? (
                <p style={{ fontSize: 12.5, color: "var(--text-tertiary)", margin: 0, textAlign: 'center' }}>No skills selected.</p>
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
    </div>
  );
}
