const fs = require('fs');
let code = fs.readFileSync('src/components/NexusAI.jsx', 'utf8');

// The file has lines that are just `            }` or `          } ` etc.
// Let's replace any `            }\n` with `\n`.

code = code.replace(/^\s*}\s*$/gm, '');
fs.writeFileSync('src/components/NexusAI.jsx', code);
