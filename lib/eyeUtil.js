const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(process.cwd(), 'data', 'appearance');

function loadList(filename) {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, 'utf8');
  return raw
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean);
}

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const eyeColoursCommon   = loadList('eye_colours_common.txt');
const eyeColoursUncommon = loadList('eye_colours_uncommon.txt');
const eyeColoursRare     = loadList('eye_colours_rare.txt');
const eyeTypes           = loadList('eye_types.txt');

const COLOUR_WEIGHTS = {
  common: 70,
  uncommon: 25,
  rare: 5
};

function pickEyeType() {
  if (!eyeTypes.length) return null;
  return pick(eyeTypes);
}

function pickEyeColour() {
  const pools = [
    { list: eyeColoursCommon,   weight: COLOUR_WEIGHTS.common },
    { list: eyeColoursUncommon, weight: COLOUR_WEIGHTS.uncommon },
    { list: eyeColoursRare,     weight: COLOUR_WEIGHTS.rare }
  ].filter(p => p.list.length > 0);

  const total = pools.reduce((s, p) => s + p.weight, 0);
  if (total === 0) return 'brown';

  let r = Math.random() * total;
  for (const p of pools) {
    if ((r -= p.weight) <= 0) {
      return pick(p.list);
    }
  }
  return pick(pools[0].list);
}

function generateEyes() {
  const colour = pickEyeColour();
  if (Math.random() < 0.25) {
    const type = pickEyeType();
    if (type) return { type, colour, text: `${type} ${colour}` };
  }
  return { type: null, colour, text: `${colour}` };
}

module.exports = {
  pickEyeType,
  pickEyeColour,
  generateEyes
};
