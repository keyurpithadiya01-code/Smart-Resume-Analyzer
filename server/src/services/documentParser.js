import { createRequire } from 'module';
import mammoth from 'mammoth';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

export async function extractTextFromBuffer(buffer, mimetype, originalname = '') {
  const name = (originalname || '').toLowerCase();
  const isPdf = mimetype === 'application/pdf' || name.endsWith('.pdf');
  const isDocx =
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    name.endsWith('.docx');

  if (isPdf) {
    const data = await pdfParse(buffer);
    return data.text || '';
  }
  if (isDocx) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || '';
  }
  throw new Error('Unsupported file type. Upload PDF or DOCX.');
}
