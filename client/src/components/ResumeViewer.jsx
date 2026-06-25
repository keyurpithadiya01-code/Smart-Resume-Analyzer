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
      <div className="skill-card w-full lg:w-1/2 mx-auto mt-6">
        <div className="skill-card-head p-4">
          <div>
            <div className="skill-head-title">
              <div className="skill-icon-badge" style={{ backgroundColor: 'var(--scan-green)', color: '#00100a', width: '24px', height: '24px' }}>
                <Icon name="check" width="12" height="12" />
              </div>
              <p className="skill-card-title display text-[15px]">Optimized Resume Ready</p>
            </div>
            <p className="skill-card-sub text-[12px] mt-1 ml-8">
              Successfully rewritten with ATS formatting & skills.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row p-4 gap-6">
          <div className="flex-1 md:border-r border-[#232b35] md:pr-6 flex flex-col justify-center">
            <p className="diff-label text-center mb-4 text-[11px]">ATS match score</p>
            <div className="score-row gap-3">
              <div className="score-block">
                <div className="score-num before mono" style={{ fontSize: '24px' }}>{baseScore}</div>
                <div className="score-tag text-[10px]">before</div>
              </div>
              <div className="score-arrow"><Icon name="arrowRight" width="12" height="12" /></div>
              <div className="score-block">
                <div className="score-num after mono" style={{ fontSize: '24px' }}>{projectedScore}</div>
                <div className="score-tag text-[10px]">after</div>
              </div>
            </div>
            <div className="score-delta text-[11px] mt-2 text-center">+{projectedScore - baseScore} points from {selectedSkills.length} skills</div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-full text-center mb-4">
              <button 
                className="btn-download mx-auto" 
                style={{ padding: '8px 14px', fontSize: '12.5px', borderRadius: '8px' }}
                onClick={handleDownload} 
                disabled={downloading}
              >
                <Icon name="download" width="14" height="14" />
                {downloading ? 'Downloading...' : 'Download ATS PDF'}
              </button>
            </div>

            <div className="w-full">
              <p className="diff-label text-center mb-2 text-[11px]">Skills injected ({selectedSkills.length})</p>
              {selectedSkills.length === 0 ? (
                <p style={{ fontSize: 11, color: "var(--text-tertiary)", margin: 0, textAlign: 'center' }}>No skills selected.</p>
              ) : (
                <div className="injected-list max-h-[100px] overflow-y-auto custom-scrollbar pr-2 gap-1.5">
                  {selectedSkills.map((skill, i) => (
                    <div className="injected-row py-1 px-2 text-[12px]" key={i}>
                      <span className="injected-name gap-1.5">
                        <Icon name="check" width="10" height="10" />
                        {skill}
                      </span>
                      <span className="injected-where mono text-[10px]">Injected</span>
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
