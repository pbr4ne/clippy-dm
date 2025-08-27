const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(process.cwd(), 'data', 'appearance');

function loadList(filename) {
  const filePath = path.join(DATA_DIR, filename);
  const raw = fs.readFileSync(filePath, 'utf8');
  return raw
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean);
}

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const eyeColours = loadList('eye_colours.txt');
const eyeTypes   = loadList('eye_types.txt');

function sanitiseColour(colour) {
  return colour.replace(/^(light|dark)\s+/i, '').trim();
}

function pickEyeType() {
  return pick(eyeTypes);
}

function pickEyeColour() {
  return sanitiseColour(pick(eyeColours));
}

function generateEyes() {
  const colour = pickEyeColour();

  if (Math.random() < 0.25) {
    const type = pickEyeType();
    return { type, colour, text: `${type} ${colour}` };
  }

  return { type: null, colour, text: `${colour}` };
}

module.exports = {
  pickEyeType,
  pickEyeColour,
  generateEyes
};
