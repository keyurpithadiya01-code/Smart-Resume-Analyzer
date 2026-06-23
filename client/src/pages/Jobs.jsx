import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client';
import PageHeader from '../components/PageHeader';
import Reveal from '../components/Reveal';

const JOB_TYPE_OPTIONS = [
  { id: 'full-time', label: 'Full-time' },
  { id: 'part-time', label: 'Part-time' },
  { id: 'remote', label: 'Remote' },
];

export default function Jobs() {
  const [searchParams] = useSearchParams();
  const [insights, setInsights] = useState(null);
  const [title, setTitle] = useState('Software Engineer');
  const [location, setLocation] = useState(searchParams.get('location') || 'Bangalore');
  const [salaryMin, setSalaryMin] = useState(3);
  const [salaryMax, setSalaryMax] = useState(25);
  const [jobTypes, setJobTypes] = useState(['full-time']);
  const [portals, setPortals] = useState([]);
  const [linkedInUrl, setLinkedInUrl] = useState('');

  useEffect(() => {
    api.get('/jobs/insights').then(({ data }) => setInsights(data));
    search();
  }, []);

  useEffect(() => {
    const loc = searchParams.get('location');
    if (loc) setLocation(loc);
  }, [searchParams]);

  function toggleJobType(id) {
    setJobTypes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }

  async function search() {
    const { data } = await api.get('/jobs/search', {
      params: {
        title,
        location,
        jobTypes: jobTypes.join(','),
        salaryMin,
        salaryMax,
      },
    });
    setPortals(data.portals);
    setLinkedInUrl(data.linkedInUrl);
  }

  return (
    <div className="page-container">
      <PageHeader
        eyebrow="Scanly · Job Search"
        title="Job Seats Explorer"
        subtitle="Search across top job portals with salary and work-type filters."
      />

      {insights && (
        <Reveal>
        <div className="modern-card lift">
          <h3 className="font-semibold text-[#00ffa3] mb-2">Market Insights</h3>
          <p className="text-sm text-[#c9cbc5] mb-2">{insights.market.hiring_tip}</p>
          <p className="text-sm text-[#c9cbc5]">
            <strong className="text-[#f0f0ec]">Trending:</strong> {insights.market.trending_roles.join(', ')}
          </p>
          <p className="text-sm text-[#c9cbc5] mt-1">
            <strong className="text-[#f0f0ec]">Salary:</strong> {insights.market.avg_salary_range}
          </p>
        </div>
        </Reveal>
      )}

      <Reveal delay={80}>
      <div className="modern-card space-y-5">
        <h3 className="section-card-title">Search Jobs</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label">Job Title</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="label">Location</label>
            <input className="input" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label">Job Type</label>
            <select
              className="input"
              value={jobTypes[0] || 'full-time'}
              onChange={(e) => setJobTypes([e.target.value])}
            >
              {JOB_TYPE_OPTIONS.map(({ id, label }) => (
                <option key={id} value={id}>{label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="label">Salary Range (LPA)</label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <div>
                <input
                  type="number"
                  min="0"
                  className="input"
                  placeholder="Min"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(Number(e.target.value))}
                />
              </div>
              <div>
                <input
                  type="number"
                  min="0"
                  className="input"
                  placeholder="Max"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(Number(e.target.value))}
                />
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={search}
          disabled={jobTypes.length === 0}
          className="btn-primary"
        >
          Search Portals
        </button>
      </div>
      </Reveal>

      {linkedInUrl && (
        <a href={linkedInUrl} target="_blank" rel="noreferrer" className="btn-secondary inline-block">
          Open LinkedIn Jobs
        </a>
      )}

      {portals.length > 0 && (
        <Reveal delay={120}>
        <div className="mt-6">
          <h2 className="modern-card-title mb-4">Portal Results</h2>
          <div className="bento-grid cols-2">
            {portals.map((p) => (
              <a
                key={p.portal}
                href={p.url}
                target="_blank"
                rel="noreferrer"
                className="modern-card lift block"
              >
                <span className="font-semibold" style={{ color: p.color }}>{p.portal}</span>
                <p className="text-sm text-[#c9cbc5] mt-1">{p.title}</p>
                {p.filters?.jobTypes?.length > 0 && (
                  <p className="text-xs text-[#6b7785] mt-2">
                    {p.filters.jobTypes.join(' · ')}
                    {p.filters.salaryMin ? ` · ₹${p.filters.salaryMin}+ LPA` : ''}
                  </p>
                )}
              </a>
            ))}
          </div>
        </div>
        </Reveal>
      )}

      {insights?.companies && (
        <Reveal delay={160}>
        <div className="mt-6">
          <h2 className="modern-card-title mb-4">Featured Companies</h2>
          <div className="bento-grid cols-2">
            {insights.companies.map((c) => (
              <a
                key={c.name}
                href={c.careers_url}
                target="_blank"
                rel="noreferrer"
                className="modern-card lift block"
              >
                <h3 className="font-semibold" style={{ color: c.color }}>{c.name}</h3>
                <p className="text-sm text-[#c9cbc5]">{c.description}</p>
              </a>
            ))}
          </div>
        </div>
        </Reveal>
      )}

      {insights?.cityJobs && (
        <Reveal delay={200}>
        <div className="mt-6">
          <h2 className="modern-card-title mb-4">Open Seats by City</h2>
          <div className="bento-grid cols-4">
            {insights.cityJobs.map((city) => (
              <button
                key={city.city}
                type="button"
                onClick={() => setLocation(city.city)}
                className="stat-tile text-left"
              >
                <div className="text-2xl mb-1">{city.emoji}</div>
                <p className="text-sm font-medium">{city.city}</p>
                <p className="text-lg font-bold">{city.seats.toLocaleString()}</p>
                <p className="text-xs text-[#00ffa3]">+{city.growth}%</p>
              </button>
            ))}
          </div>
        </div>
        </Reveal>
      )}
    </div>
  );
}
