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

  if (!originalText) return null;

  const baseScore = atsScore;
  const projectedScore = Math.min(100, baseScore + (selectedSkills?.length || 0) * 3);

  const { personal_info, sections } = optimizedJson || {};

  return (
    <div className="scanly-root">
      <div className="result-section w-full">
        <div className="result-header">
          <div className="result-head-left flex flex-col sm:flex-row gap-4 sm:gap-12">
          {optimizedJson ? (
            <div className="flex items-center gap-4">
              <p className="result-title display">Optimized Resume</p>
              <div className="result-badge">
                <Icon name="check" /> ATS-ready
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <p className="result-title display">Original Resume Text</p>
            </div>
          )}
        </div>

        {optimizedJson && (
          <div className="download-bar">
            <button className="btn-secondary" onClick={() => window.open(window.URL.createObjectURL(new Blob([originalText])), '_blank')}>
              <Icon name="eye" />
              Preview Text
            </button>
            <button className="btn-download" onClick={handleDownload}>
              <Icon name="download" />
              Download ATS PDF
            </button>
          </div>
        )}
      </div>

      <div className="result-grid">
        {/* Document Frame */}
        <div className="pdf-frame">
          <div className="pdf-toolbar">
            <div className="pdf-toolbar-left">
              <Icon name="file" width="14" height="14" />
              <span className="pdf-filename mono">{optimizedJson ? 'optimized_resume.pdf' : 'original_text.txt'}</span>
            </div>
            {optimizedJson && (
              <div className="pdf-zoom">
                <button className="icon-btn" aria-label="Zoom out"><Icon name="minus" /></button>
                <span className="zoom-pct">100%</span>
                <button className="icon-btn" aria-label="Zoom in"><Icon name="plus" /></button>
              </div>
            )}
          </div>

          <div className="pdf-page-wrap">
            {!optimizedJson ? (
              <div className="w-full text-sm text-[#c9cbc5] whitespace-pre-wrap font-mono p-4 text-left">
                {originalText}
              </div>
            ) : (
              <div className="pdf-page">
                {personal_info && (
                  <>
                    <p className="doc-name">{personal_info.full_name}</p>
                    {personal_info.title && <p className="doc-role">{personal_info.title}</p>}
                    <div className="doc-contact">
                      {personal_info.email && <span>{personal_info.email}</span>}
                      {personal_info.phone && <span>{personal_info.phone}</span>}
                      {personal_info.location && <span>{personal_info.location}</span>}
                      {personal_info.linkedin && <span>{personal_info.linkedin}</span>}
                    </div>
                  </>
                )}

                {sections && sections.map((sec, idx) => (
                  <div key={idx}>
                    <p className="doc-section-label">{sec.heading}</p>
                    {sec.items && sec.items.map((item, i) => (
                      <div key={i} className="mb-2">
                        {(item.title || item.subtitle || item.date) && (
                          <div className="flex justify-between items-baseline mb-1">
                            <p className="doc-line m-0" style={{ fontWeight: 600, color: "#111" }}>
                              {item.title}
                              {item.subtitle && <span style={{ fontStyle: 'italic', fontWeight: 400 }}> at {item.subtitle}</span>}
                            </p>
                            {item.date && <span style={{ fontSize: '6.5px', color: '#555', fontWeight: 600 }}>{item.date}</span>}
                          </div>
                        )}
                        
                        {item.description && (
                          <div className="doc-line mt-1">
                            {sec.heading && sec.heading.toLowerCase().includes('skill') ? (
                              item.description.split('\n').map((line, li) => {
                                const colonIdx = line.indexOf(':');
                                if (colonIdx > 0 && colonIdx < 40) {
                                  return (
                                    <div key={li}>
                                      <span style={{ fontWeight: 700, color: '#111' }}>{line.substring(0, colonIdx + 1)}</span>
                                      {line.substring(colonIdx + 1)}
                                    </div>
                                  );
                                }
                                return <div key={li}>{line}</div>;
                              })
                            ) : (
                              <div className="whitespace-pre-wrap">{item.description}</div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {optimizedJson && (
            <div className="pdf-pager">
              <button className="icon-btn" onClick={() => setPage((p) => Math.max(1, p - 1))} aria-label="Previous page">
                <Icon name="chevLeft" />
              </button>
              <span>Page {page} of 1</span>
              <button className="icon-btn" onClick={() => setPage((p) => Math.min(1, p + 1))} aria-label="Next page">
                <Icon name="chevRight" />
              </button>
            </div>
          )}
        </div>

        {/* Diff Rail (Only show when optimized) */}
        {optimizedJson && (
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
              <div className="score-delta">+{projectedScore - baseScore} points from {selectedSkills.length} injected skills</div>
            </div>

            <div className="diff-card mt-4">
              <p className="diff-label">Skills injected ({selectedSkills.length})</p>
              {selectedSkills.length === 0 ? (
                <p style={{ fontSize: 12.5, color: "var(--text-tertiary)", margin: 0 }}>No skills selected yet.</p>
              ) : (
                <div className="injected-list">
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
        )}
      </div>
    </div>
    </div>
  );
}
