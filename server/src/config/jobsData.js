export const JOB_SUGGESTIONS = [
  'Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'Data Scientist', 'Data Analyst', 'DevOps Engineer', 'UI Designer', 'UX Designer',
  'Project Manager', 'Product Manager', 'Security Analyst', 'Machine Learning Engineer',
];

export const LOCATION_SUGGESTIONS = [
  'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Pune', 'Remote', 'Gurgaon', 'Noida',
];

export const EXPERIENCE_RANGES = ['Fresher', '0-1 years', '1-3 years', '3-5 years', '5-10 years', '10+ years'];

export const JOB_TYPES = ['full-time', 'part-time', 'remote'];

export const CITY_JOB_SEATS = [
  { city: 'Bengaluru', seats: 2840, growth: 12.5, emoji: '🏙️' },
  { city: 'Pune', seats: 1520, growth: 9.2, emoji: '🌆' },
  { city: 'Hyderabad', seats: 1980, growth: 11.8, emoji: '🏛️' },
  { city: 'Delhi NCR', seats: 2210, growth: 8.4, emoji: '🕌' },
  { city: 'Mumbai', seats: 2650, growth: 10.1, emoji: '🌉' },
];

export const AI_SUGGESTIONS = [
  'Add more quantifiable achievements to your experience bullets',
  'Include role-specific keywords from the job description',
  'Strengthen your professional summary with impact metrics',
  'Add certifications relevant to your target role',
  'Optimize skills section — list tools used in recent projects',
];

export const PORTALS = [
  { name: 'LinkedIn', color: '#0A66C2', url: 'https://www.linkedin.com/jobs/search/?keywords={q}&location={l}{extra}' },
  { name: 'Naukri', color: '#FF7555', url: 'https://www.naukri.com/{q}-jobs-in-{l}{extra}' },
  { name: 'Foundit (Monster)', color: '#5D3FD3', url: 'https://www.foundit.in/srp/results?query={q}&locations={l}{extra}' },
  { name: 'FreshersWorld', color: '#003A9B', url: 'https://www.freshersworld.com/jobs/jobsearch/{q}-jobs-in-{l}{extra}' },
  { name: 'TimesJobs', color: '#003A9B', url: 'https://www.timesjobs.com/candidate/job-search.html?txtKeywords={q}&txtLocation={l}{extra}' },
  { name: 'Indeed', color: '#003A9B', url: 'https://in.indeed.com/jobs?q={q}&l={l}{extra}' },
];

function linkedInExtra(jobTypes, salaryMin, salaryMax) {
  const params = [];
  if (jobTypes.includes('remote')) params.push('f_WT=2');
  if (jobTypes.includes('full-time')) params.push('f_JT=F');
  if (jobTypes.includes('part-time')) params.push('f_JT=P');
  if (salaryMin) params.push(`f_SB2=${salaryMin * 100000}`);
  if (params.length) return `&${params.join('&')}`;
  return '';
}

function indeedExtra(jobTypes, salaryMin) {
  const parts = [];
  if (jobTypes.includes('remote')) parts.push('remotejob=1');
  if (salaryMin) parts.push(`salary=${salaryMin * 100000}`);
  return parts.length ? `&${parts.join('&')}` : '';
}

function portalExtra(portalName, jobTypes, salaryMin, salaryMax) {
  if (portalName === 'LinkedIn') return linkedInExtra(jobTypes, salaryMin, salaryMax);
  if (portalName === 'Indeed') return indeedExtra(jobTypes, salaryMin);
  if (jobTypes.includes('remote')) return '&remote=true';
  return '';
}

export function searchJobPortals(jobTitle, location, options = {}) {
  const { jobTypes = [], salaryMin = 0, salaryMax = 50 } = options;
  const types = Array.isArray(jobTypes) ? jobTypes : String(jobTypes).split(',').filter(Boolean);
  const q = encodeURIComponent(jobTitle || 'developer');
  const l = encodeURIComponent(location || 'India');
  const qSlug = (jobTitle || 'developer').toLowerCase().replace(/\s+/g, '-');
  const lSlug = (location || 'india').toLowerCase().replace(/\s+/g, '-');

  return PORTALS.map((portal) => {
    const extra = portalExtra(portal.name, types, Number(salaryMin), Number(salaryMax));
    let url = portal.url
      .replace('{q}', portal.name === 'Naukri' ? qSlug : q)
      .replace('{l}', portal.name === 'Naukri' ? lSlug : l)
      .replace('{extra}', extra);
    return {
      portal: portal.name,
      color: portal.color,
      title: `${jobTitle || 'Jobs'} in ${location || 'India'}`,
      url,
      filters: { jobTypes: types, salaryMin, salaryMax },
    };
  });
}

export const FEATURED_COMPANIES = [
  { name: 'Google', color: '#4285F4', careers_url: 'https://careers.google.com', description: 'Search, cloud, and innovation' },
  { name: 'Microsoft', color: '#00A4EF', careers_url: 'https://careers.microsoft.com', description: 'Software and cloud' },
  { name: 'Amazon', color: '#FF9900', careers_url: 'https://www.amazon.jobs', description: 'E-commerce and AWS' },
  { name: 'TCS', color: '#0066CC', careers_url: 'https://www.tcs.com/careers', description: 'IT services leader' },
  { name: 'Infosys', color: '#007CC3', careers_url: 'https://www.infosys.com/careers', description: 'Global consulting and IT' },
];

export const MARKET_INSIGHTS = {
  trending_roles: ['AI Engineer', 'Full Stack Developer', 'Cloud Architect', 'Cybersecurity Analyst'],
  avg_salary_range: '₹6–18 LPA (varies by role & city)',
  hiring_tip: 'Tailor your resume keywords to each job description for better ATS match.',
};

export function buildLinkedInSearchUrl(jobTitle, location, options = {}) {
  const { jobTypes = [], salaryMin = 0 } = options;
  const types = Array.isArray(jobTypes) ? jobTypes : String(jobTypes).split(',').filter(Boolean);
  const q = encodeURIComponent(jobTitle || '');
  const l = encodeURIComponent(location || '');
  const base = `https://www.linkedin.com/jobs/search/?keywords=${q}&location=${l}`;
  return `${base}${linkedInExtra(types, Number(salaryMin), 0)}`;
}
