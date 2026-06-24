import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import Reveal from '../components/Reveal';

const EMPTY_HOME = {
  summary: { totalAnalyses: 0, totalResumes: 0, avgAts: 0, bestAts: 0, standardCount: 0, aiCount: 0 },
  scoreTrend: [],
  dailyTrend: [],
  breakdown: null,
  byRole: [],
  recentAnalyses: [],
  frequentGaps: [],
};

export default function Home() {
  const { user } = useAuth();
  const [home, setHome] = useState(null);
  const [scoreFilter, setScoreFilter] = useState('all');

  useEffect(() => {
    // Reset to null so loading spinner shows on user switch
    setHome(null);
    api.get('/dashboard/home')
      .then(({ data }) => setHome(data))
      .catch(() => setHome(EMPTY_HOME));
  }, [user?.id]);

  if (!home) {
    return (
      <div className="page-container flex items-center justify-center h-64">
        <p className="text-[#6b7785]">Loading dashboard…</p>
      </div>
    );
  }

  const { summary, scoreTrend, dailyTrend, breakdown, byRole, recentAnalyses, frequentGaps } = home;
  const hasData = summary.totalAnalyses > 0;

  const filteredScoreTrend = scoreTrend.filter((p) => {
    if (scoreFilter === 'all') return true;
    const type = p.type || 'standard';
    return type === scoreFilter;
  });

  const breakdownChart = breakdown
    ? [
        { name: 'Format', score: breakdown.format },
        { name: 'Keywords', score: breakdown.keywords },
        { name: 'Sections', score: breakdown.sections },
      ]
    : [];

  return (
    <div className="page-container">
      <PageHeader
        eyebrow="Scanly · Dashboard"
        title="Dashboard"
        subtitle={hasData
          ? `${summary.totalAnalyses} analyses across your resumes`
          : 'Run your first analysis to populate charts'}
        actions={
          <>
            <Link to="/analyzer" className="app-quick-chip primary">Analyze Resume</Link>
            <Link to="/builder" className="app-quick-chip">Build Resume</Link>
          </>
        }
      />

      <Reveal>
        <div className="bento-grid cols-4">
          <StatCard label="Total Analyses" value={summary.totalAnalyses} hint={`${summary.standardCount} std · ${summary.aiCount} AI`} />
          <StatCard label="Average ATS" value={hasData ? `${summary.avgAts}%` : '—'} hint="Across all scans" />
          <StatCard label="Best ATS Score" value={hasData ? `${summary.bestAts}%` : '—'} hint="Your highest result" accent />
          <StatCard label="Resumes Saved" value={summary.totalResumes} hint="From uploads" />
        </div>
      </Reveal>

      <Reveal delay={80}>
        <div className="bento-grid cols-2 mt-6">
        <ChartCard title="ATS Score Over Time" subtitle="Each point is one analysis run">
          <div className="mb-4">
            <select
              className="input py-1.5 px-3 text-sm max-w-[200px]"
              value={scoreFilter}
              onChange={(e) => setScoreFilter(e.target.value)}
            >
              <option value="all">All Analyses</option>
              <option value="standard">Standard</option>
              <option value="ai">AI</option>
            </select>
          </div>
          {filteredScoreTrend.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredScoreTrend}>
                  <CartesianGrid stroke="#232b35" strokeDasharray="3 3" />
                  <XAxis dataKey="label" stroke="#6b7785" fontSize={11} tickLine={false} />
                  <YAxis stroke="#6b7785" fontSize={11} domain={[0, 100]} tickLine={false} unit="%" />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12, color: '#c9cbc5' }} />
                  <Line
                    type="monotone"
                    dataKey="atsScore"
                    name="ATS %"
                    stroke="#00ffa3"
                    strokeWidth={2}
                    dot={{ fill: '#ffb454', r: 5, strokeWidth: 0 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart message="No analyses match this filter" action={{ label: 'Run ATS Analysis', to: '/analyzer' }} />
          )}
        </ChartCard>

        <ChartCard title="Daily Average ATS" subtitle="Grouped by day (standard analyses)">
          {dailyTrend.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyTrend}>
                  <CartesianGrid stroke="#232b35" strokeDasharray="3 3" />
                  <XAxis dataKey="date" stroke="#6b7785" fontSize={11} tickLine={false} />
                  <YAxis stroke="#6b7785" fontSize={11} domain={[0, 100]} tickLine={false} unit="%" />
                  <Tooltip content={<DailyTooltip />} />
                  <Line type="monotone" dataKey="avgAts" name="Avg ATS %" stroke="#00ffa3" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart message="Daily trend appears after standard analyses" action={{ label: 'Analyze Resume', to: '/analyzer' }} />
          )}
        </ChartCard>
        </div>
      </Reveal>

      <Reveal delay={120}>
        <div className="bento-grid cols-2 mt-6">
        <ChartCard title="Score Breakdown" subtitle="Average from standard analyses">
          {breakdownChart.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={breakdownChart} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid stroke="#232b35" strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} stroke="#6b7785" fontSize={11} unit="%" />
                  <YAxis type="category" dataKey="name" stroke="#6b7785" fontSize={12} width={72} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="score" name="Score" fill="#00ffa3" radius={[0, 6, 6, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart message="Breakdown available after standard ATS scans" action={{ label: 'Standard Analyzer', to: '/analyzer' }} />
          )}
        </ChartCard>

        <ChartCard title="Analyses by Role" subtitle="Which roles you target most">
          {byRole.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byRole}>
                  <CartesianGrid stroke="#232b35" strokeDasharray="3 3" />
                  <XAxis dataKey="role" stroke="#6b7785" fontSize={10} tickLine={false} interval={0} angle={-20} textAnchor="end" height={60} />
                  <YAxis stroke="#6b7785" fontSize={11} allowDecimals={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" name="Analyses" fill="#ffb454" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart message="Role breakdown appears when analyses include a target role" />
          )}
        </ChartCard>
        </div>
      </Reveal>

      {frequentGaps.length > 0 && (
        <Reveal delay={160}>
        <div className="modern-card lift mt-6">
          <h3 className="font-semibold text-[#f0f0ec] mb-1">Common Skill Gaps</h3>
          <p className="text-xs text-[#6b7785] mb-6">Skills missing most often across your analyses</p>
          <div className="flex flex-wrap gap-4">
            {frequentGaps.map(({ skill, count }) => (
              <span
                key={skill}
                className="px-3.5 py-2 rounded-lg text-sm bg-[#ffb454]/10 text-[#ffb454] border border-[#ffb454]/20 flex items-center font-medium"
              >
                {skill}
                <span className="ml-2 opacity-70 text-[11px]">×{count}</span>
              </span>
            ))}
          </div>
          <Link to="/analyzer" className="inline-block mt-4 text-sm text-[#00ffa3] hover:underline">
            Improve your resume →
          </Link>
        </div>
        </Reveal>
      )}

      <Reveal delay={200}>
      <div className="modern-card mt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-[#f0f0ec]">Analysis History</h3>
            <p className="text-xs text-[#6b7785]">Your latest standard and AI scans</p>
          </div>
          <Link to="/analyzer" className="text-sm text-[#00ffa3] hover:underline">New analysis →</Link>
        </div>
        {recentAnalyses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[#6b7785] border-b border-[#232b35]">
                  <th className="py-4 pr-4 font-medium tracking-wide">Role</th>
                  <th className="py-4 pr-4 font-medium tracking-wide">Type</th>
                  <th className="py-4 pr-4 font-medium tracking-wide">ATS</th>
                  <th className="py-4 pr-4 hidden sm:table-cell font-medium tracking-wide">Keywords</th>
                  <th className="py-4 pr-4 hidden sm:table-cell font-medium tracking-wide">Format</th>
                  <th className="py-4 font-medium tracking-wide">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentAnalyses.map((row) => (
                  <tr key={row._id} className="border-b border-[#232b35]/40 hover:bg-[#161d26]/50">
                    <td className="py-5 pr-4 font-medium text-[#f0f0ec]">{row.title}</td>
                    <td className="py-5 pr-4">
                      <span className={`text-[11px] px-2.5 py-1 rounded font-medium uppercase tracking-wider ${row.type === 'ai' ? 'bg-[#ffb454]/20 text-[#ffb454]' : 'bg-[#00ffa3]/20 text-[#00ffa3]'}`}>
                        {row.type === 'ai' ? 'AI' : 'Standard'}
                      </span>
                    </td>
                    <td className="py-5 pr-4">
                      <ScoreBadge score={row.atsScore} />
                    </td>
                    <td className="py-5 pr-4 hidden sm:table-cell text-[#c9cbc5]">
                      {row.keywordScore != null ? `${row.keywordScore}%` : '—'}
                    </td>
                    <td className="py-5 pr-4 hidden sm:table-cell text-[#c9cbc5]">
                      {row.formatScore != null ? `${row.formatScore}%` : '—'}
                    </td>
                    <td className="py-5 text-[#6b7785]">
                      {new Date(row.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-[#6b7785] mb-4">No analyses recorded yet.</p>
            <Link to="/analyzer" className="btn-primary text-sm inline-block">Analyze your first resume</Link>
          </div>
        )}
      </div>
      </Reveal>
    </div>
  );
}

function StatCard({ label, value, hint, accent = false }) {
  return (
    <div className="stat-tile">
      <p className={`stat-tile-value ${accent ? '' : ''}`} style={accent ? {} : undefined}>{value}</p>
      <p className="stat-tile-label">{label}</p>
      {hint && <p className="stat-tile-hint">{hint}</p>}
    </div>
  );
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="modern-card">
      <div className="modern-card-header">
        <div>
          <h3 className="modern-card-title">{title}</h3>
          {subtitle && <p className="modern-card-sub">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

function EmptyChart({ message, action }) {
  return (
    <div className="h-64 flex flex-col items-center justify-center text-center px-4">
      <p className="text-sm text-[#6b7785] mb-4">{message}</p>
      {action && (
        <Link to={action.to} className="btn-primary text-sm">{action.label}</Link>
      )}
    </div>
  );
}

function ScoreBadge({ score }) {
  if (score == null) return <span className="text-[#6b7785]">—</span>;
  const color = score >= 70 ? 'text-[#00ffa3]' : score >= 50 ? 'text-[#ffb454]' : 'text-[#f87171]';
  return <span className={`font-bold ${color}`}>{score}%</span>;
}

const tooltipStyle = {
  background: '#10161d',
  border: '1px solid #232b35',
  borderRadius: '12px',
  fontSize: 12,
};

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div style={tooltipStyle} className="px-3 py-2">
      <p className="text-[#f0f0ec] font-medium">{p.atsScore ?? p.score}% ATS</p>
      {p.role && <p className="text-[#c9cbc5] text-xs mt-0.5">{p.role}</p>}
      {p.type && (
        <p className="text-[#6b7785] text-xs">{p.type === 'ai' ? 'AI analysis' : 'Standard analysis'}</p>
      )}
    </div>
  );
}

function DailyTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div style={tooltipStyle} className="px-3 py-2">
      <p className="text-[#f0f0ec] font-medium">{p.avgAts}% avg ATS</p>
      <p className="text-[#c9cbc5] text-xs">{p.count} analysis{p.count !== 1 ? 'es' : ''} on {p.fullDate}</p>
    </div>
  );
}
