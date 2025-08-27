const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(process.cwd(), 'data', 'names', "slavic");

const loadList = (filename) => {
  const filePath = path.join(DATA_DIR, filename);
  const raw = fs.readFileSync(filePath, 'utf8');
  return raw
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean);
};

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const woman = loadList('woman.txt');
const man = loadList('man.txt');
const nonbinary = loadList('nonbinary.txt');
const surname = loadList('surname.txt');

function pickWeightedGender() {
  const r = Math.random();
  if (r < 0.49) return 'man';
  if (r < 0.98) return 'woman';
  return 'nonbinary';
}

function pickFirstName(gender) {
  if (gender === 'woman') return pick(woman);
  if (gender === 'man') return pick(man);
  if (gender === 'nonbinary') return pick(nonbinary);
  return pick([...woman, ...man, ...nonbinary]);
}

function pickSurname() {
  return pick(surname);
}

module.exports = {
  pickFirstName,
  pickSurname,
  pickWeightedGender
};
