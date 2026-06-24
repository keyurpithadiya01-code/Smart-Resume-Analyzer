import { GoogleGenerativeAI } from '@google/generative-ai';
import fetch, { Headers, Request, Response } from 'node-fetch';

if (!globalThis.fetch || !globalThis.fetch.isNodeFetch) {
  globalThis.fetch = fetch;
  globalThis.Headers = Headers;
  globalThis.Request = Request;
  globalThis.Response = Response;
  globalThis.fetch.isNodeFetch = true;
}

function extractScore(text, label) {
  const re = new RegExp(`${label}\\s*Score:\\s*(\\d{1,3})\\s*/\\s*100`, 'i');
  const m = text.match(re);
  return m ? parseInt(m[1], 10) : 0;
}

async function generateContentWithFallback(genAI, modelNames, prompt, maxRetriesPerModel = 2) {
  for (const modelName of modelNames) {
    const model = genAI.getGenerativeModel({ model: modelName });
    let attempt = 0;
    while (attempt < maxRetriesPerModel) {
      try {
        const result = await model.generateContent(prompt);
        return { result, modelUsed: modelName };
      } catch (err) {
        if (err.message?.includes('503') || err.message?.includes('429') || err.status === 503 || err.status === 429) {
          attempt++;
          if (attempt >= maxRetriesPerModel) {
            console.warn(`[Gemini Fallback] Model ${modelName} overloaded, switching to next model...`);
            break; // Break retry loop, try next model
          }
          const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
          await new Promise(r => setTimeout(r, delay));
        } else if (err.message?.includes('404') || err.status === 404) {
          console.warn(`[Gemini Fallback] Model ${modelName} not found or unsupported. Skipping to next model...`);
          break; // Model doesn't exist, try next model immediately
        } else {
          throw err; // Hard errors (e.g., 400 Bad Request, 403 API key invalid) fail immediately
        }
      }
    }
  }
  throw new Error('All Gemini models are currently experiencing high demand (503). Please try again later.');
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
    const { result, modelUsed } = await generateContentWithFallback(
      genAI,
      ['gemini-2.5-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-flash', 'gemini-pro'],
      prompt
    );
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
  const { result } = await generateContentWithFallback(
    genAI,
    ['gemini-2.5-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-flash', 'gemini-pro'],
    prompt
  );
  let text = result.response.text().trim();
  
  if (text.startsWith('\`\`\`json')) text = text.replace(/^\`\`\`json/, '');
  if (text.startsWith('\`\`\`')) text = text.replace(/^\`\`\`/, '');
  if (text.endsWith('\`\`\`')) text = text.replace(/\`\`\`$/, '');

  return JSON.parse(text.trim());
}


