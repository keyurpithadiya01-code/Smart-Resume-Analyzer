import { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import api from '../api/client';
import ScoreGauge from '../components/ScoreGauge';
import PageHeader from '../components/PageHeader';
import PillTabs from '../components/PillTabs';
import MetricBar from '../components/MetricBar';
import Reveal from '../components/Reveal';
import { useAuth } from '../context/AuthContext';
import SkillSelection from '../components/SkillSelection';
import ResumeViewer from '../components/ResumeViewer';
import DownloadResumeButton from '../components/DownloadResumeButton';

function ScanPreview() {
  return (
    <div className="scan-preview">
      <div className="scan-preview-card">
        <div className="font-display font-bold text-sm text-[#1a1d22]">Your Resume</div>
        <div className="text-[9px] text-[#7a8088] mt-1 tracking-wide uppercase">Scanly · ATS Preview</div>
        <div className="r-line med" />
        <div className="r-line short" />
        <div className="r-line med" style={{ marginTop: 18 }} />
        <div className="r-line med" />
        <div className="scan-line-app" />
      </div>
    </div>
  );
}

export default function Analyzer() {
  const { isAdmin } = useAuth();
  const [tab, setTab] = useState('standard');
  const [categories, setCategories] = useState([]);
  const [roles, setRoles] = useState({});
  const [category, setCategory] = useState('');
  const [role, setRole] = useState('');
  const [file, setFile] = useState(null);
  const [isSavedResume, setIsSavedResume] = useState(false);
  const [savedResumeMeta, setSavedResumeMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stdResult, setStdResult] = useState(null);
  const [courses, setCourses] = useState([]);
  const [videos, setVideos] = useState({ resume: {}, interview: {} });
  const [jobDesc, setJobDesc] = useState('');
  const [aiResult, setAiResult] = useState(null);
  const [optimizerResult, setOptimizerResult] = useState(null);
  const [aiStats, setAiStats] = useState(null);
  
  // Optimizer state
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [optimizedResumeId, setOptimizedResumeId] = useState(null);
  const [optimizedJson, setOptimizedJson] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    api.get('/config/job-roles').then(({ data }) => {
      setCategories(data.categories);
      setRoles(data.roles);
      if (data.categories[0]) setCategory(data.categories[0]);
    });
    api.get('/config/videos').then(({ data }) => setVideos(data));
    loadAiStats();
  }, []);

  const { user } = useAuth();
  useEffect(() => {
    api.get('/storage/mine').then(({ data }) => {
      if (data.exists) {
        setSavedResumeMeta(data.metadata);
        setIsSavedResume(true);
      }
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (category && roles[category]) {
      const r = Object.keys(roles[category])[0];
      setRole(r);
    }
  }, [category, roles]);

  useEffect(() => {
    if (role) {
      api.get(`/config/courses/${encodeURIComponent(role)}`).then(({ data }) => setCourses(data.courses || []));
    }
  }, [role]);

  async function loadAiStats() {
    const { data } = await api.get('/ai/stats');
    setAiStats(data);
  }

  async function runStandard(e) {
    e.preventDefault();
    if (!file && !savedResumeMeta) return setError('Upload a PDF or DOCX resume');
    setLoading(true);
    setError('');
    setStdResult(null);
    try {
      const fd = new FormData();
      if (file) fd.append('resume', file);
      else if (isSavedResume) fd.append('useSavedResume', 'true');
      fd.append('category', category);
      fd.append('role', role);
      const { data } = await api.post('/analyze/standard', fd);
      setStdResult(data.result);
    } catch (err) {
      const backendError = err.response?.data?.error;
      setError(backendError ? String(backendError) : (err.message || 'Unknown error occurred'));
    } finally {
      setLoading(false);
    }
  }

  async function runAi(e) {
    e.preventDefault();
    if (!file && !savedResumeMeta) return setError('Upload a PDF or DOCX resume');
    setLoading(true);
    setError('');
    setAiResult(null);
    try {
      const fd = new FormData();
      if (file) fd.append('resume', file);
      else if (isSavedResume) fd.append('useSavedResume', 'true');
      fd.append('jobRole', role);
      if (jobDesc) fd.append('jobDescription', jobDesc);
      const { data } = await api.post('/ai/analyze', fd);
      setAiResult(data);
      loadAiStats();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }

  async function runOptimizer(e) {
    e.preventDefault();
    if (!file && !savedResumeMeta) return setError('Upload a PDF or DOCX resume');
    setLoading(true);
    setError('');
    setOptimizerResult(null);
    setOptimizedResumeId(null);
    setOptimizedJson(null);
    setSelectedSkills([]);
    try {
      const fd = new FormData();
      if (file) fd.append('resume', file);
      else if (isSavedResume) fd.append('useSavedResume', 'true');
      
      const { data } = await api.post('/resume/optimizer/analyze', fd);
      setOptimizerResult(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to analyze resume');
    } finally {
      setLoading(false);
    }
  }

  const generateImprovedResume = async () => {
    if (!optimizerResult) return;
    setIsGenerating(true);
    setError('');
    try {
      const payload = {
        resumeText: optimizerResult.resumeText,
        selectedSkills,
        atsScore: optimizerResult.atsScore
      };
      const { data } = await api.post('/resume/optimize', payload);
      setOptimizedResumeId(data.optimizedResumeId);
      setOptimizedJson(data.optimizedResume);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to generate optimized resume');
    } finally {
      setIsGenerating(false);
    }
  };

  async function resetAiStats() {
    await api.delete('/ai/stats');
    loadAiStats();
  }

  const roleList = category ? Object.keys(roles[category] || {}) : [];
  const hasResult = tab === 'standard' ? !!stdResult : tab === 'ai' ? !!aiResult : !!optimizerResult;
  const activeScores = tab === 'standard' && stdResult
    ? [
        { label: 'ATS Score', value: stdResult.ats_score },
        { label: 'Keyword Match', value: stdResult.keyword_match?.score },
        { label: 'Format', value: stdResult.format_score },
      ]
    : tab === 'ai' && aiResult
      ? [
          { label: 'Resume Score', value: aiResult.score },
          { label: 'ATS Score', value: aiResult.ats_score },
        ]
      : [];

  return (
    <div className="page-container">
      <PageHeader
        eyebrow="Scanly · ATS Analysis"
        title="Resume Analyzer"
        subtitle="Drop in your resume — Scanly scores it line by line, just like the landing demo."
      />

      <PillTabs
        tabs={[
          { id: 'standard', label: 'Standard Analyzer' },
          { id: 'ai', label: 'AI Analyzer' },
          { id: 'optimizer', label: 'AI Optimizer' },
        ]}
        active={tab}
        onChange={setTab}
      />

      <Reveal>
        <div className="split-panel">
          <div className="split-panel-left">
            <p className="form-section-label">Upload & Configure</p>
            <div className="flex flex-col gap-8 mt-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="min-w-0">
                  <label className="label">Category</label>
                  <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="min-w-0">
                  <label className="label">Target Role</label>
                  <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
                    {roleList.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Resume File</label>
                {isSavedResume && savedResumeMeta ? (
                  <div className="modern-card p-5 flex items-center justify-between border-[#374151] bg-[#1e2530] shadow-[0_8px_28px_rgba(0,0,0,0.45)] relative group gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 flex-shrink-0 rounded-xl bg-[#00ffa3]/10 flex items-center justify-center text-[#00ffa3] shadow-[inset_0_0_0_1px_rgba(0,255,163,0.2)]">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                      </div>
                      <div className="min-w-0 pr-2">
                        <p className="text-[15px] font-semibold text-[#f0f0ec] truncate">{savedResumeMeta.filename}</p>
                        <p className="text-[13px] text-[#9ca3af] mt-0.5">Saved Resume • {(savedResumeMeta.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="flex-shrink-0 text-[13px] font-medium px-4 py-2 rounded-lg border border-[#374151] bg-[#161d26] hover:bg-[#232b35] hover:text-white transition">
                      Replace
                    </button>
                    <input ref={fileInputRef} type="file" accept=".pdf,.docx" className="hidden" onChange={async (e) => {
                      const selected = e.target.files?.[0];
                      if (selected) {
                        try {
                          const fd = new FormData();
                          fd.append('resume', selected);
                          const { data } = await api.post('/storage/upload', fd);
                          if (data.metadata) {
                            setSavedResumeMeta(data.metadata);
                            setIsSavedResume(true);
                            setFile(null);
                          }
                        } catch (err) {
                          console.error('Storage upload failed:', err);
                          setError(err.response?.data?.error || err.message || 'Failed to upload resume to backend');
                        }
                      }
                    }} />
                  </div>
                ) : (
                  <div
                    role="button"
                    tabIndex={0}
                    className={`upload-zone-app ${file ? 'has-file' : ''}`}
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                  >
                    <svg className="w-8 h-8 mx-auto mb-3 text-[#00ffa3]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="upload-title truncate w-full px-4">{file ? file.name : 'Drop resume or click to browse'}</p>
                    <p className="upload-sub">PDF or DOCX · max 10 MB</p>
                    <input ref={fileInputRef} type="file" accept=".pdf,.docx" className="hidden" onChange={async (e) => {
                      const selected = e.target.files?.[0];
                      if (selected) {
                        try {
                          const fd = new FormData();
                          fd.append('resume', selected);
                          const { data } = await api.post('/storage/upload', fd);
                          if (data.metadata) {
                            setSavedResumeMeta(data.metadata);
                            setIsSavedResume(true);
                            setFile(null);
                          }
                        } catch (err) {
                          console.error('Storage upload failed:', err);
                          setError(err.response?.data?.error || err.message || 'Failed to upload resume to backend');
                        }
                      }
                    }} />
                  </div>
                )}
              </div>

              {tab === 'ai' && (
                <div>
                  <label className="label">Job Description (optional)</label>
                  <textarea className="input min-h-[90px]" value={jobDesc} onChange={(e) => setJobDesc(e.target.value)} placeholder="Paste job description for smarter AI matching…" />
                </div>
              )}

              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button 
                type="button" 
                onClick={tab === 'standard' ? runStandard : tab === 'ai' ? runAi : runOptimizer} 
                disabled={loading} 
                className="btn-primary w-full sm:w-auto"
              >
                {loading ? 'Scanning…' : tab === 'optimizer' ? 'Analyze for Optimization →' : 'Scan my resume →'}
              </button>
            </div>
          </div>

          <div className="split-panel-right dark">
            {!hasResult && !loading && (
              <div className="empty-state-panel">
                <ScanPreview />
                <p className="mt-6">Upload a resume and hit scan — live metrics appear here with animated bars.</p>
              </div>
            )}
            {loading && (
              <div className="empty-state-panel">
                <ScanPreview />
                <p className="mt-6 text-[#00ffa3]">Scanning your resume…</p>
              </div>
            )}
            {!loading && hasResult && (
              <div>
                {tab === 'optimizer' ? (
                  <div>
                    <h3 className="text-xl font-bold text-[#00ffa3] mb-4 flex items-center gap-2">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Skill Injection
                    </h3>
                    <SkillSelection 
                      missingSkills={optimizerResult.missingSkills}
                      selectedSkills={selectedSkills}
                      setSelectedSkills={setSelectedSkills}
                      onGenerate={generateImprovedResume}
                      isGenerating={isGenerating}
                      hasGenerated={!!optimizedJson}
                    />
                    {optimizedJson && (
                      <div className="mt-6 pt-6 border-t border-[#232b35]">
                        <p className="text-sm text-[#00ffa3] mb-4 font-medium flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#00ffa3] animate-ping"></span>
                          Optimization Complete!
                        </p>
                        <DownloadResumeButton optimizedId={optimizedResumeId} />
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <p className="form-section-label" style={{ color: '#00ffa3' }}>Live Results</p>
                    <div className="flex flex-wrap justify-center gap-6 mb-6">
                      {tab === 'standard' && stdResult && (
                        <>
                          <ScoreGauge score={stdResult.ats_score} label="ATS Score" />
                          <ScoreGauge score={stdResult.keyword_match?.score} label="Keywords" />
                          <ScoreGauge score={stdResult.format_score} label="Format" />
                        </>
                      )}
                      {tab === 'ai' && aiResult && (
                        <>
                          <ScoreGauge score={aiResult.score} label="Resume Score" />
                          <ScoreGauge score={aiResult.ats_score} label="ATS Score" />
                        </>
                      )}
                    </div>
                    {activeScores.map((s, i) => (
                      <MetricBar key={s.label} label={s.label} value={s.value} delay={i * 120} />
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </Reveal>

      {tab === 'optimizer' && optimizerResult && (
        <Reveal className="mt-10">
          <ResumeViewer 
            originalText={optimizerResult.resumeText} 
            optimizedJson={optimizedJson} 
            defaultTab={optimizedJson ? "optimized" : "original"}
          />
        </Reveal>
      )}

      {tab === 'standard' && stdResult && (
        <Reveal className="mt-10">
          <div className="bento-grid cols-2">
            {stdResult.keyword_match?.missing_skills?.length > 0 && (
              <div className="modern-card lift">
                <h3 className="modern-card-title">Missing Skills</h3>
                <div className="flex flex-wrap gap-2 mt-3">
                  {stdResult.keyword_match.missing_skills.map((s) => (
                    <span key={s} className="px-2.5 py-1 bg-[#ffb454]/10 text-[#ffb454] border border-[#ffb454]/20 rounded-lg text-sm">{s}</span>
                  ))}
                </div>
              </div>
            )}
            <div className={`modern-card lift ${!stdResult.keyword_match?.missing_skills?.length ? 'bento-span-2' : ''}`}>
              <h3 className="modern-card-title">Recommendations</h3>
              <ul className="list-disc list-inside text-sm text-[#c9cbc5] space-y-1.5 mt-3">
                {stdResult.suggestions?.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
            {courses.length > 0 && (
              <div className="modern-card lift">
                <h3 className="modern-card-title">Recommended Courses</h3>
                <ul className="space-y-2 mt-3">
                  {courses.map(([title, url]) => (
                    <li key={url}><a href={url} target="_blank" rel="noreferrer" className="text-[#00ffa3] hover:underline text-sm">{title}</a></li>
                  ))}
                </ul>
              </div>
            )}
            {(videos.resume && Object.keys(videos.resume).length > 0) && (
              <div className="modern-card lift bento-span-2">
                <h3 className="modern-card-title">Resume & Interview Videos</h3>
                {Object.entries(videos.resume).map(([cat, items]) => (
                  <div key={cat} className="mt-3">
                    <p className="text-sm text-[#00ffa3] mb-1">{cat}</p>
                    <ul className="space-y-1 text-sm">
                      {(items || []).map(([t, u]) => <li key={u}><a href={u} target="_blank" rel="noreferrer" className="text-[#c9cbc5] hover:text-white">{t}</a></li>)}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Reveal>
      )}

      {tab === 'ai' && (
        <Reveal className="mt-10">
          {aiStats && (
            <div className="bento-grid cols-4 mb-6">
              {[
                ['Total AI Scans', aiStats.total],
                ['Avg Score', aiStats.averageScore],
                ['Avg ATS', aiStats.averageAts],
              ].map(([l, v]) => (
                <div key={l} className="stat-tile">
                  <p className="stat-tile-value">{v}</p>
                  <p className="stat-tile-label">{l}</p>
                </div>
              ))}
              {isAdmin && (
                <button type="button" onClick={resetAiStats} className="stat-tile text-left hover:border-[#ffb454]/30">
                  <p className="stat-tile-value text-[#ffb454]">↺</p>
                  <p className="stat-tile-label">Reset Stats</p>
                </button>
              )}
            </div>
          )}
          {aiResult && (
            <div className="modern-card">
              <h3 className="modern-card-title">AI Full Report</h3>
              <div className="prose prose-invert prose-sm max-w-none mt-4 border-t border-[#232b35] pt-4">
                <ReactMarkdown>{aiResult.full_response}</ReactMarkdown>
              </div>
            </div>
          )}
        </Reveal>
      )}
    </div>
  );
}
