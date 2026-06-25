const fs = require('fs');
const code = fs.readFileSync('SkillInjectionPanel.jsx', 'utf8');
const startIndex = code.indexOf('const styles = `') + 16;
const endIndex = code.indexOf('`;', startIndex);
const css = code.substring(startIndex, endIndex);
fs.appendFileSync('client/src/index.css', '\n\n/* --- Premium Optimizer Styles --- */\n' + css);
console.log('CSS Appended successfully.');
