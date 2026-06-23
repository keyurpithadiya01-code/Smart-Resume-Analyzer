const DOCUMENT_TYPES = {
  resume: [
    'experience', 'education', 'skills', 'work', 'project', 'objective',
    'summary', 'employment', 'qualification', 'achievements',
  ],
  marksheet: ['grade', 'marks', 'score', 'semester', 'cgpa', 'sgpa', 'examination', 'result', 'academic year', 'percentage'],
  certificate: ['certificate', 'certification', 'awarded', 'completed', 'achievement', 'training', 'course completion', 'qualified'],
  id_card: ['id card', 'identity', 'student id', 'employee id', 'valid until', 'date of issue', 'identification'],
};

function detectDocumentType(text) {
  const lower = text.toLowerCase();
  const scores = {};
  for (const [docType, keywords] of Object.entries(DOCUMENT_TYPES)) {
    const matches = keywords.filter((k) => lower.includes(k)).length;
    const density = matches / keywords.length;
    const frequency = matches / (lower.split(/\s+/).length + 1);
    scores[docType] = density * 0.7 + frequency * 0.3;
  }
  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return best[1] > 0.15 ? best[0] : 'unknown';
}

function calculateKeywordMatch(resumeText, requiredSkills) {
  const lower = resumeText.toLowerCase();
  const found = [];
  const missing = [];
  for (const skill of requiredSkills || []) {
    const s = skill.toLowerCase();
    if (lower.includes(s) || lower.split('.').some((p) => p.includes(s))) found.push(skill);
    else missing.push(skill);
  }
  const score = requiredSkills?.length ? (found.length / requiredSkills.length) * 100 : 0;
  return { score, found_skills: found, missing_skills: missing };
}

function checkResumeSections(text) {
  const lower = text.toLowerCase();
  const sections = {
    contact: ['email', 'phone', 'address', 'linkedin'],
    education: ['education', 'university', 'college', 'degree', 'academic'],
    experience: ['experience', 'work', 'employment', 'job', 'internship'],
    skills: ['skills', 'technologies', 'tools', 'proficiencies', 'expertise'],
  };
  let total = 0;
  for (const keywords of Object.values(sections)) {
    const found = keywords.filter((k) => lower.includes(k)).length;
    total += Math.min(25, (found / keywords.length) * 25);
  }
  return total;
}

function checkFormatting(text) {
  const lines = text.split('\n');
  let score = 100;
  const deductions = [];
  if (text.length < 300) {
    score -= 30;
    deductions.push('Resume is too short');
  }
  if (!lines.some((l) => l === l.toUpperCase() && l.trim().length > 2)) {
    score -= 20;
    deductions.push('No clear section headers found');
  }
  if (!lines.some((l) => /^[•\-*→]/.test(l.trim()))) {
    score -= 20;
    deductions.push('No bullet points found for listing details');
  }
  const contactPatterns = [/\b[\w.-]+@[\w.-]+\.\w+\b/, /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, /linkedin\.com\/\w+/i];
  if (!contactPatterns.some((p) => p.test(text))) {
    score -= 15;
    deductions.push('Missing or improperly formatted contact information');
  }
  return { score: Math.max(0, score), deductions };
}

function extractPersonalInfo(text) {
  const email = text.match(/[\w.-]+@[\w.-]+\.\w+/)?.[0] || '';
  const phone = text.match(/(\+\d{1,3}[-.]?)?\s*\(?\d{3}\)?[-.]?\s*\d{3}[-.]?\s*\d{4}/)?.[0] || '';
  const linkedin = text.match(/linkedin\.com\/in\/[\w-]+/i)?.[0] || '';
  const github = text.match(/github\.com\/[\w-]+/i)?.[0] || '';
  const name = text.split('\n').find((l) => l.trim())?.trim() || 'Unknown';
  return { name, email, phone, linkedin, github, portfolio: '' };
}

function extractSectionLines(text, keywords, maxItems = 8) {
  const lines = text.split('\n');
  const items = [];
  let inSection = false;
  let current = [];
  for (const line of lines) {
    const t = line.trim();
    const isHeader = keywords.some((k) => t.toLowerCase().includes(k) && t.length < 40);
    if (isHeader) {
      if (current.length) items.push(current.join(' '));
      inSection = true;
      current = [];
      continue;
    }
    if (inSection) {
      if (!t) {
        if (current.length) {
          items.push(current.join(' '));
          current = [];
        }
        if (items.length >= maxItems) break;
        continue;
      }
      if (/^(experience|education|skills|projects|summary)/i.test(t) && !keywords.some((k) => t.toLowerCase() === k)) {
        inSection = false;
        if (current.length) items.push(current.join(' '));
        break;
      }
      current.push(t);
    }
  }
  if (current.length) items.push(current.join(' '));
  return items.filter(Boolean).slice(0, maxItems);
}

function extractSkills(text) {
  const skills = new Set();
  const lower = text.toLowerCase();
  const skillSection = lower.split(/skills/i)[1]?.slice(0, 800) || lower;
  const tokens = skillSection.match(/\b[a-z+#.]{2,30}\b/gi) || [];
  tokens.forEach((t) => {
    if (t.length > 2 && !['and', 'the', 'with', 'for'].includes(t.toLowerCase())) skills.add(t);
  });
  return [...skills].slice(0, 40);
}

export function analyzeResume(rawText, jobRequirements = {}) {
  const text = rawText || '';
  const docType = detectDocumentType(text);
  if (docType !== 'resume') {
    return {
      ats_score: 0,
      document_type: docType,
      keyword_match: { score: 0, found_skills: [], missing_skills: [] },
      section_score: 0,
      format_score: 0,
      suggestions: [`This appears to be a ${docType} document. Please upload a resume for ATS analysis.`],
    };
  }

  const personal = extractPersonalInfo(text);
  const requiredSkills = jobRequirements.required_skills || [];
  const keyword_match = calculateKeywordMatch(text, requiredSkills);
  const education = extractSectionLines(text, ['education', 'university', 'college', 'degree']);
  const experience = extractSectionLines(text, ['experience', 'employment', 'work history']);
  const projects = extractSectionLines(text, ['projects', 'project']);
  const skills = extractSkills(text);
  const summary = text.split('\n').slice(0, 6).join(' ').slice(0, 400);
  const section_score = checkResumeSections(text);
  const { score: format_score, deductions } = checkFormatting(text);

  const contact_suggestions = [];
  if (!personal.email) contact_suggestions.push('Add your email address');
  if (!personal.phone) contact_suggestions.push('Add your phone number');
  if (!personal.linkedin) contact_suggestions.push('Add your LinkedIn profile URL');

  const summary_suggestions = [];
  if (!summary.trim()) summary_suggestions.push('Add a professional summary');
  else if (summary.split(/\s+/).length < 30) summary_suggestions.push('Expand your professional summary');

  const skills_suggestions = [];
  if (!skills.length) skills_suggestions.push('Add a dedicated skills section');
  if (keyword_match.score < 70) skills_suggestions.push('Add more skills that match the job requirements');

  const experience_suggestions = [];
  if (!experience.length) experience_suggestions.push('Add your work experience section');

  const education_suggestions = [];
  if (!education.length) education_suggestions.push('Add your educational background');

  const format_suggestions = [...deductions];
  const contact_score = 100 - contact_suggestions.length * 25;
  const summary_score = 100 - summary_suggestions.length * 33;
  const skills_score = keyword_match.score;
  const experience_score = 100 - experience_suggestions.length * 25;
  const education_score = 100 - education_suggestions.length * 25;

  const ats_score = Math.round(
    contact_score * 0.1 +
      summary_score * 0.1 +
      skills_score * 0.3 +
      experience_score * 0.2 +
      education_score * 0.1 +
      format_score * 0.2
  );

  const suggestions = [
    ...contact_suggestions,
    ...summary_suggestions,
    ...skills_suggestions,
    ...experience_suggestions,
    ...education_suggestions,
    ...format_suggestions,
  ];
  if (!suggestions.length) suggestions.push('Your resume is well-optimized for ATS systems');

  return {
    ...personal,
    ats_score,
    document_type: 'resume',
    keyword_match,
    section_score,
    format_score,
    education,
    experience,
    projects,
    skills,
    summary,
    suggestions,
    contact_suggestions,
    summary_suggestions,
    skills_suggestions,
    experience_suggestions,
    education_suggestions,
    format_suggestions,
    section_scores: {
      contact: contact_score,
      summary: summary_score,
      skills: skills_score,
      experience: experience_score,
      education: education_score,
      format: format_score,
    },
  };
}
