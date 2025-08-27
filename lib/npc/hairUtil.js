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

const hairColours = loadList('hair_colours.txt');
const hairTypes   = loadList('hair_types.txt');
const hairLengths = loadList('hair_lengths.txt');

const SENIOR_COLOUR_KEYS = new Set(['grey', 'white', 'silver', 'salt & pepper']);
const isSeniorColour = (name) => SENIOR_COLOUR_KEYS.has(name.toLowerCase());

function pickWeightedHairLength() {
  const weights = {
    shaved: 1,
    'very short': 4,
    short: 6,
    'chin-length': 6,
    'shoulder-length': 8,
    long: 7,
    'very long': 4,
    'waist-length': 1
  };

  const weightedList = [];
  for (const length of hairLengths) {
    const weight = weights[length.toLowerCase()] ?? 5;
    for (let i = 0; i < weight; i++) {
      weightedList.push(length);
    }
  }

  return pick(weightedList);
}

function pickHairColourForAge(age) {
  const senior = hairColours.filter(c => isSeniorColour(c));
  const nonSenior = hairColours.filter(c => !isSeniorColour(c));

  if (senior.length === 0) return pick(hairColours);
  if (age < 40) return pick(nonSenior);
  if (age < 55) return Math.random() < 0.15 ? pick(senior) : pick(nonSenior);
  return Math.random() < 0.65 ? pick(senior) : pick(nonSenior);
}

function pickHairType() {
  return pick(hairTypes);
}

function generateHair(age) {
  const length = pickWeightedHairLength();
  if (length.toLowerCase() === 'shaved') {
    return { colour: null, type: null, length };
  }
  return {
    colour: pickHairColourForAge(age),
    type: pickHairType(),
    length
  };
}

function formatHair(hair) {
  if (!hair) return '';
  if (hair.length && hair.length.toLowerCase() === 'shaved') return 'shaved';
  const parts = [hair.length, hair.type, hair.colour].filter(Boolean);
  return parts.join(', ');
}

module.exports = {
  generateHair,
  formatHair
};
