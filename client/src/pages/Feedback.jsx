import { useEffect, useState } from 'react';
import api from '../api/client';
import PageHeader from '../components/PageHeader';
import PillTabs from '../components/PillTabs';
import Reveal from '../components/Reveal';

export default function Feedback() {
  const [tab, setTab] = useState('form');
  const [stats, setStats] = useState(null);
  const [form, setForm] = useState({
    rating: 4, usability_score: 4, feature_satisfaction: 4,
    missing_features: '', improvement_suggestions: '', user_experience: '',
  });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (tab === 'stats') api.get('/feedback/stats').then(({ data }) => setStats(data));
  }, [tab]);

  async function submit(e) {
    e.preventDefault();
    await api.post('/feedback', form);
    setMsg('Thank you for your feedback!');
    setForm({ rating: 4, usability_score: 4, feature_satisfaction: 4, missing_features: '', improvement_suggestions: '', user_experience: '' });
  }

  return (
    <div className="page-container max-w-4xl">
      <PageHeader
        eyebrow="Scanly · Feedback"
        title="Share Your Feedback"
        subtitle="Help us improve Scanly with your experience and suggestions."
      />

      <PillTabs
        tabs={[
          { id: 'form', label: 'Submit Feedback' },
          { id: 'stats', label: 'Statistics' },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === 'form' && (
        <Reveal>
          <form onSubmit={submit} className="modern-card space-y-5">
            <p className="form-section-label">Rate Your Experience</p>
            {['rating', 'usability_score', 'feature_satisfaction'].map((key) => (
              <div key={key}>
                <label className="label capitalize">{key.replace(/_/g, ' ')} (1-5)</label>
                <input type="range" min={1} max={5} className="w-full accent-[#00ffa3]" value={form[key]} onChange={(e) => setForm({ ...form, [key]: +e.target.value })} />
                <span className="text-sm font-medium text-[#00ffa3]">{form[key]}</span>
              </div>
            ))}
            <div>
              <label className="label">Missing features</label>
              <textarea className="input min-h-[80px]" value={form.missing_features} onChange={(e) => setForm({ ...form, missing_features: e.target.value })} placeholder="What features would you like to see?" />
            </div>
            <div>
              <label className="label">Improvements</label>
              <textarea className="input min-h-[80px]" value={form.improvement_suggestions} onChange={(e) => setForm({ ...form, improvement_suggestions: e.target.value })} placeholder="How can we improve Scanly?" />
            </div>
            <div>
              <label className="label">User experience</label>
              <textarea className="input min-h-[80px]" value={form.user_experience} onChange={(e) => setForm({ ...form, user_experience: e.target.value })} placeholder="Tell us about your overall experience…" />
            </div>
            {msg && <p className="text-[#00ffa3] text-sm">{msg}</p>}
            <button type="submit" className="btn-primary">Submit Feedback</button>
          </form>
        </Reveal>
      )}

      {tab === 'stats' && stats && (
        <Reveal>
          <div className="bento-grid cols-4">
            {[
              ['Avg Rating', stats.avg_rating],
              ['Usability', stats.avg_usability],
              ['Satisfaction', stats.avg_satisfaction],
              ['Responses', stats.total_responses],
            ].map(([l, v]) => (
              <div key={l} className="stat-tile">
                <p className="stat-tile-value">{v}</p>
                <p className="stat-tile-label">{l}</p>
              </div>
            ))}
          </div>
        </Reveal>
      )}
    </div>
  );
}
