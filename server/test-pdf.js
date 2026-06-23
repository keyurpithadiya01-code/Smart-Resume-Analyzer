import { readFileSync } from 'fs';
import { extractTextFromBuffer } from './src/services/documentParser.js';

async function test() {
  try {
    const buffer = readFileSync('C:\\Users\\DC\\Downloads\\Keyur Pithadiya Resume.pdf');
    console.log('File read, size:', buffer.length);
    const text = await extractTextFromBuffer(buffer, 'application/pdf', 'Keyur Pithadiya Resume.pdf');
    console.log('Parsed text length:', text.length);
    console.log('Preview:', text.substring(0, 100));
  } catch (err) {
    console.error('Error parsing PDF:', err);
  }
}

test();
