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

const commonTraits   = loadList('traits_common.txt');
const uncommonTraits = loadList('traits_uncommon.txt');
const rareTraits     = loadList('traits_rare.txt');

const beardCommon    = loadList('beard_common.txt');
const beardUncommon  = loadList('beard_uncommon.txt');
const beardRare      = loadList('beard_rare.txt');

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function pickTrait() {
  const r = Math.random() * 100;
  if (r < 70 && commonTraits.length)   return pick(commonTraits);
  if (r < 90 && uncommonTraits.length) return pick(uncommonTraits);
  if (rareTraits.length)               return pick(rareTraits);
  if (uncommonTraits.length) return pick(uncommonTraits);
  if (commonTraits.length)   return pick(commonTraits);
  return 'distinctive look';
}

function pickBeardTrait() {
  const r = Math.random() * 100;
  if (r < 60 && beardCommon.length)     return pick(beardCommon);
  if (r < 90 && beardUncommon.length)   return pick(beardUncommon);
  if (beardRare.length)                 return pick(beardRare);
  if (beardUncommon.length) return pick(beardUncommon);
  if (beardCommon.length)   return pick(beardCommon);
  return null;
}

module.exports = {
  pickTrait,
  pickBeardTrait
};
