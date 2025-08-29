const fs = require('node:fs');
const path = require('node:path');

function findCommandFiles(rootDir) {
  const out = [];
  const stack = [rootDir];
  while (stack.length) {
    const dir = stack.pop();
    for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, d.name);
      if (d.isDirectory()) stack.push(p);
      else if (d.isFile() && d.name === 'command.js') out.push(p);
    }
  }
  return out;
}

function loadCommandsFrom(rootDir) {
  const files = findCommandFiles(rootDir);
  const map = new Map();
  for (const file of files) {
    const cmd = require(file);
    if (cmd && 'data' in cmd && 'execute' in cmd) map.set(cmd.data.name, cmd);
    else console.log(`[WARNING] The command at ${file} is missing a required "data" or "execute" property.`);
  }
  return map;
}

function slashCommandJSON(map) {
  return Array.from(map.values()).map(c => c.data.toJSON());
}

module.exports = { loadCommandsFrom, slashCommandJSON };
