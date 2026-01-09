const fs = require('fs');
try {
    const path = '../frontend/.env.local';
    let content = fs.readFileSync(path, 'utf8');

    const privateKey = 'abe22543d651b659942e67bd5ef2360972abf2fea372b33ec90762d637ca167a';

    // Remove existing key if any
    content = content.replace(/ROGUE_AGENT_PRIVATE_KEY=.*/g, '');

    // Append new key
    content += `\nROGUE_AGENT_PRIVATE_KEY=${privateKey}`;

    // Clean up empty lines
    content = content.replace(/^\s*[\r\n]/gm, '');

    fs.writeFileSync(path, content, 'utf8');
    console.log("Updated .env.local with ROGUE_AGENT_PRIVATE_KEY");
} catch (e) {
    console.error(e);
}
