const fs = require('fs');
let code = fs.readFileSync('src/components/NexusAI.jsx', 'utf8');
code = code.replace(/^\s*}\s*$/gm, '');
fs.writeFileSync('src/components/NexusAI.jsx', code);
