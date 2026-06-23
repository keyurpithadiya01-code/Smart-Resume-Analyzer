import { useState } from 'react';
import api from '../api/client';
import PageHeader from '../components/PageHeader';
import Reveal from '../components/Reveal';

const TEMPLATES = ['Modern', 'Professional', 'Minimal', 'Creative'];
const emptyExp = { position: '', company: '', start_date: '', end_date: '', description: '' };
const emptyEdu = { school: '', degree: '', field: '', graduation_date: '', gpa: '' };

export default function Builder() {
  const [template, setTemplate] = useState('Modern');
  const [personal, setPersonal] = useState({
    full_name: '', email: '', phone: '', location: '', linkedin: '', portfolio: '', title: '',
  });
  const [summary, setSummary] = useState('');
  const [experience, setExperience] = useState([{ ...emptyExp }]);
  const [education, setEducation] = useState([{ ...emptyEdu }]);
  const [skills, setSkills] = useState({ technical: '', soft: '', tools: '', languages: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState('');

  function parseList(str) {
    return str.split(',').map((s) => s.trim()).filter(Boolean);
  }

  async function handleImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportStatus('Extracting details...');
    setError('');

    const fd = new FormData();
    fd.append('resume', file);

    try {
      const { data } = await api.post('/ai/parse-to-json', fd);
      
      if (data.personal_info) {
        setPersonal(prev => ({ ...prev, ...data.personal_info }));
      }
      if (data.summary) setSummary(data.summary);
      if (data.experience && data.experience.length > 0) {
        setExperience(data.experience.map(exp => ({ ...emptyExp, ...exp })));
      }
      if (data.education && data.education.length > 0) {
        setEducation(data.education.map(edu => ({ ...emptyEdu, ...edu })));
      }
      if (data.skills) {
        setSkills({
          technical: Array.isArray(data.skills.technical) ? data.skills.technical.join(', ') : data.skills.technical || '',
          soft: Array.isArray(data.skills.soft) ? data.skills.soft.join(', ') : data.skills.soft || '',
          tools: Array.isArray(data.skills.tools) ? data.skills.tools.join(', ') : data.skills.tools || '',
          languages: Array.isArray(data.skills.languages) ? data.skills.languages.join(', ') : data.skills.languages || '',
        });
      }
      setImportStatus('Resume imported successfully!');
      setTimeout(() => setImportStatus(''), 3000);
    } catch (err) {
      const backendError = err.response?.data?.error;
      setError(backendError ? String(backendError) : (err.message || 'Import failed'));
    } finally {
      setImporting(false);
      e.target.value = ''; // Reset file input
    }
  }

  async function generate(e) {
    e.preventDefault();
    if (!personal.email) return setError('Email is required');
    setLoading(true);
    setError('');
    try {
      const payload = {
        template,
        personal_info: personal,
        summary,
        experience,
        education,
        projects: [],
        skills: {
          technical: parseList(skills.technical),
          soft: parseList(skills.soft),
          tools: parseList(skills.tools),
          languages: parseList(skills.languages),
        },
      };
      const { data } = await api.post('/builder/generate', payload, { responseType: 'blob' });
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${personal.full_name || 'resume'}_resume.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      if (err.response?.data instanceof Blob) {
        const text = await err.response.data.text();
        try {
          const j = JSON.parse(text);
          setError(j.error);
        } catch {
          setError('Generation failed');
        }
      } else {
        setError(err.response?.data?.error || err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-container max-w-4xl">
      <PageHeader
        eyebrow="Scanly · Resume Builder"
        title="Resume Builder"
        subtitle="Create a polished DOCX resume or import from an existing PDF/DOCX file."
        actions={
          <>
            {importStatus && <span className="text-sm text-[#00ffa3] self-center">{importStatus}</span>}
            <label className={`btn-secondary cursor-pointer text-sm ${importing ? 'opacity-50 pointer-events-none' : ''}`}>
              {importing ? 'Parsing…' : 'Import Resume'}
              <input type="file" accept=".pdf,.docx" className="hidden" onChange={handleImport} disabled={importing} />
            </label>
          </>
        }
      />
      
      <form onSubmit={generate} className="space-y-6">
        <Reveal>
        <div className="modern-card">
          <h3 className="section-card-title">Template</h3>
          <div className="flex flex-wrap gap-2">
            {TEMPLATES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTemplate(t)}
                className={`chip ${template === t ? 'chip-active' : 'chip-inactive'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        </Reveal>

        <Reveal delay={60}>
        <div className="modern-card space-y-3">
          <h3 className="section-card-title">Personal Info</h3>
          {['full_name', 'email', 'phone', 'location', 'linkedin', 'portfolio', 'title'].map((key) => (
            <div key={key}>
              <label className="label capitalize">{key.replace('_', ' ')}</label>
              <input
                className="input"
                value={personal[key]}
                onChange={(e) => setPersonal({ ...personal, [key]: e.target.value })}
                required={key === 'email'}
              />
            </div>
          ))}
        </div>
        </Reveal>

        <Reveal delay={80}>
        <div className="modern-card">
          <label className="label">Summary</label>
          <textarea className="input min-h-[80px]" value={summary} onChange={(e) => setSummary(e.target.value)} />
        </div>
        </Reveal>

        <Reveal delay={100}>
        <div className="modern-card space-y-3">
          <h3 className="section-card-title">Education</h3>
          {education.map((edu, i) => (
            <div key={i} className="border border-[#232b35] rounded-lg p-3 space-y-2">
              {['school', 'degree', 'field', 'graduation_date', 'gpa'].map((k) => (
                <input
                  key={k}
                  className="input"
                  placeholder={k}
                  value={edu[k]}
                  onChange={(e) => {
                    const next = [...education];
                    next[i] = { ...next[i], [k]: e.target.value };
                    setEducation(next);
                  }}
                />
              ))}
            </div>
          ))}
          <button type="button" className="btn-secondary text-sm" onClick={() => setEducation([...education, { ...emptyEdu }])}>+ Add Education</button>
        </div>
        </Reveal>

        <Reveal delay={120}>
        <div className="modern-card space-y-3">
          <h3 className="section-card-title">Experience</h3>
          {experience.map((exp, i) => (
            <div key={i} className="border border-[#232b35] rounded-lg p-3 space-y-2">
              {['position', 'company', 'start_date', 'end_date'].map((k) => (
                <input key={k} className="input" placeholder={k} value={exp[k]} onChange={(e) => {
                  const next = [...experience];
                  next[i] = { ...next[i], [k]: e.target.value };
                  setExperience(next);
                }} />
              ))}
              <textarea className="input" placeholder="Description" value={exp.description} onChange={(e) => {
                const next = [...experience];
                next[i] = { ...next[i], description: e.target.value };
                setExperience(next);
              }} />
            </div>
          ))}
          <button type="button" className="btn-secondary text-sm" onClick={() => setExperience([...experience, { ...emptyExp }])}>+ Add Experience</button>
        </div>
        </Reveal>

        <Reveal delay={140}>
        <div className="modern-card space-y-3">
          <h3 className="section-card-title">Skills (comma-separated)</h3>
          {['technical', 'soft', 'tools', 'languages'].map((k) => (
            <div key={k}>
              <label className="label capitalize">{k}</label>
              <input className="input" value={skills[k]} onChange={(e) => setSkills({ ...skills, [k]: e.target.value })} />
            </div>
          ))}
        </div>
        </Reveal>

        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Generating…' : 'Download DOCX'}</button>
      </form>
    </div>
  );
}
