import { GoogleGenerativeAI } from '@google/generative-ai';
import fetch, { Headers, Request, Response } from 'node-fetch';

if (!globalThis.fetch || !globalThis.fetch.isNodeFetch) {
  globalThis.fetch = fetch;
  globalThis.Headers = Headers;
  globalThis.Request = Request;
  globalThis.Response = Response;
  globalThis.fetch.isNodeFetch = true;
}

// Stable first, then newer models. Deprecated 1.5 / gemini-pro names removed (404).
// "latest" aliases auto-route to Google's least-loaded flash model.
const GEMINI_MODELS = [
  'gemini-flash-lite-latest',
  'gemini-flash-latest',
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash',
  'gemini-2.5-pro',
];

function extractScore(text, label) {
  const re = new RegExp(`${label}\\s*Score:\\s*(\\d{1,3})\\s*/\\s*100`, 'i');
  const m = text.match(re);
  return m ? parseInt(m[1], 10) : 0;
}

function isRetryableError(err) {
  const msg = err?.message || '';
  const status = err?.status;
  return (
    status === 503 ||
    status === 429 ||
    status === 500 ||
    status === 502 ||
    msg.includes('503') ||
    msg.includes('429') ||
    msg.includes('high demand') ||
    msg.includes('overloaded') ||
    msg.includes('UNAVAILABLE') ||
    msg.includes('fetch failed')
  );
}

function isModelUnavailableError(err) {
  const msg = err?.message || '';
  const status = err?.status;
  return status === 404 || msg.includes('404') || msg.includes('not found') || msg.includes('not supported');
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateContentWithFallback(genAI, modelNames, prompt, maxRetriesPerModel = 2) {
  const failures = [];

  for (const modelName of modelNames) {
    const model = genAI.getGenerativeModel({ model: modelName });

    for (let attempt = 0; attempt < maxRetriesPerModel; attempt++) {
      try {
        const result = await model.generateContent(prompt);
        return { result, modelUsed: modelName };
      } catch (err) {
        const detail = err?.message || String(err);

        if (isModelUnavailableError(err)) {
          console.warn(`[Gemini] Model ${modelName} unavailable: ${detail.slice(0, 120)}`);
          failures.push(`${modelName}: unavailable`);
          break;
        }

        if (isRetryableError(err)) {
          const isLastAttempt = attempt >= maxRetriesPerModel - 1;
          if (isLastAttempt) {
            console.warn(`[Gemini] Model ${modelName} overloaded after ${maxRetriesPerModel} attempts`);
            failures.push(`${modelName}: overloaded`);
            break;
          }
          const delay = Math.pow(2, attempt + 1) * 1000 + Math.random() * 500;
          console.warn(`[Gemini] ${modelName} busy (attempt ${attempt + 1}), retrying in ${Math.round(delay)}ms`);
          await sleep(delay);
          continue;
        }

        throw err;
      }
    }
  }

  const summary = failures.length ? failures.join('; ') : 'unknown error';
  throw new Error(
    `All Gemini models failed (${summary}). Please wait a moment and try again.`
  );
}

export async function analyzeWithGemini(resumeText, { jobDescription, jobRole, apiKey }) {
  if (!resumeText?.trim()) return { error: 'Resume text is required for analysis.' };
  if (!apiKey) return { error: 'Google API key is not configured. Add GOOGLE_API_KEY to server .env' };

  let prompt = `You are an expert resume analyst. Structure your response in markdown with these sections:
## Overall Assessment
## Professional Profile Analysis
## Skills Analysis
- **Current Skills**:
- **Skill Proficiency**:
- **Missing Skills**:
## Experience Analysis
## Education Analysis
## Key Strengths
## Areas for Improvement
## ATS Optimization Assessment
(Include "ATS Score: XX/100")
## Recommended Courses/Certifications
## Resume Score
(Include exactly "Resume Score: XX/100")

Resume:
${resumeText}`;

  if (jobRole) {
    prompt += `\n\nTarget role: ${jobRole}\n## Role Alignment Analysis`;
  }
  if (jobDescription) {
    prompt += `\n\nJob Description:\n${jobDescription}\n## Job Match Analysis\n## Key Job Requirements Not Met`;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const { result, modelUsed } = await generateContentWithFallback(genAI, GEMINI_MODELS, prompt);
    const analysis = result.response.text();
    return {
      analysis,
      resume_score: extractScore(analysis, 'Resume'),
      ats_score: extractScore(analysis, 'ATS'),
      model_used: modelUsed,
    };
  } catch (err) {
    return { error: `Analysis failed: ${err.message}` };
  }
}

export async function parseResumeToJson(resumeText, apiKey) {
  if (!resumeText?.trim()) throw new Error('Resume text is required.');
  if (!apiKey) throw new Error('Google API key is not configured.');

  const prompt = `You are an expert data extractor. Extract the information from the following resume into a strict JSON object. 
Do NOT include any markdown formatting or code blocks (like \`\`\`json), just the raw JSON string.
The JSON must EXACTLY match this structure (use empty strings or arrays if data is missing):
{
  "personal_info": {
    "full_name": "", "email": "", "phone": "", "location": "", "linkedin": "", "portfolio": "", "title": ""
  },
  "summary": "",
  "experience": [
    { "position": "", "company": "", "start_date": "", "end_date": "", "description": "" }
  ],
  "education": [
    { "school": "", "degree": "", "field": "", "graduation_date": "", "gpa": "" }
  ],
  "skills": {
    "technical": "",
    "soft": "",
    "tools": "",
    "languages": ""
  }
}
Note for skills: provide them as a comma-separated string within the respective category (e.g. "React, Node.js, Python").

Resume Text:
${resumeText}`;

  const genAI = new GoogleGenerativeAI(apiKey);
  const { result } = await generateContentWithFallback(genAI, GEMINI_MODELS, prompt);
  let text = result.response.text().trim();

  if (text.startsWith('```json')) text = text.replace(/^```json/, '');
  if (text.startsWith('```')) text = text.replace(/^```/, '');
  if (text.endsWith('```')) text = text.replace(/```$/, '');

  return JSON.parse(text.trim());
}

export async function analyzeForOptimizer(resumeText, apiKey) {
  if (!resumeText?.trim()) throw new Error('Resume text is required.');
  if (!apiKey) throw new Error('Google API key is not configured.');

  const prompt = `You are an expert ATS resume analyst. Analyze the provided resume and return a strict JSON object with an ATS score and a list of missing skills.
Do NOT include any markdown formatting or code blocks (like \`\`\`json), just the raw JSON string.
The JSON must EXACTLY match this structure:
{
  "atsScore": 0,
  "missingSkills": ["Skill 1", "Skill 2"]
}

Resume Text:
${resumeText}`;

  const genAI = new GoogleGenerativeAI(apiKey);
  const { result } = await generateContentWithFallback(genAI, GEMINI_MODELS, prompt);
  let text = result.response.text().trim();
  if (text.startsWith('```json')) text = text.replace(/^```json/, '');
  if (text.startsWith('```')) text = text.replace(/^```/, '');
  if (text.endsWith('```')) text = text.replace(/```$/, '');

  return JSON.parse(text.trim());
}

export async function optimizeResume(resumeText, selectedSkills, apiKey) {
  if (!resumeText?.trim()) throw new Error('Resume text is required.');
  if (!apiKey) throw new Error('Google API key is not configured.');

  const prompt = `You are an expert resume writer and ATS optimizer. 
Your task is to rewrite the provided resume to be highly ATS-friendly, incorporating ONLY the user-selected skills into the experience or summary where appropriate.
CRITICAL AI RULES: 
1. You must NEVER invent work experience, projects, or education. You must only improve phrasing, structure, and ATS keywords. Do NOT hallucinate.
2. You MUST preserve the ENTIRE resume. Do NOT drop, omit, or summarize away any work experience, projects, or education entries. If the resume has 5 jobs, you must output 5 jobs. If it has 2 pages of content, include all of it. Do not truncate the output.

Selected Skills to incorporate seamlessly: ${selectedSkills.join(', ')}

Extract and optimize the information into a strict JSON object. 
The JSON must EXACTLY match this flexible structure:
{
  "personal_info": {
    "full_name": "", "email": "", "phone": "", "location": "", "linkedin": "", "portfolio": "", "title": ""
  },
  "sections": [
    {
      "heading": "String (e.g., SUMMARY, EXPERIENCE, PROJECTS, EDUCATION, CERTIFICATIONS, SKILLS, etc.)",
      "items": [
        {
          "title": "String (e.g., Job Title, Degree, Project Name, Certification Name) - Leave empty if not applicable",
          "subtitle": "String (e.g., Company, University, Issuer) - Leave empty if not applicable",
          "date": "String - Leave empty if not applicable",
          "description": "String (Detailed text or bullet points)"
        }
      ]
    }
  ]
}

CRITICAL: You must iterate through EVERY SINGLE SECTION in the original text and map it into the "sections" array. Do not miss any custom sections the user has.

Resume Text:
${resumeText}`;

  const genAI = new GoogleGenerativeAI(apiKey);
  const { result } = await generateContentWithFallback(genAI, GEMINI_MODELS, prompt);
  let text = result.response.text().trim();
  if (text.startsWith('```json')) text = text.replace(/^```json/, '');
  if (text.startsWith('```')) text = text.replace(/^```/, '');
  if (text.endsWith('```')) text = text.replace(/```$/, '');

  return JSON.parse(text.trim());
}
