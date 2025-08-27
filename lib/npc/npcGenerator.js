const path = require('path');
const config = require(path.join(process.cwd(), 'config.json'));

const {
  pickFirstName,
  pickSurname,
  pickWeightedGender
} = require(path.join(process.cwd(), 'lib', 'name', 'nameUtil.js'));

const { generateHair, formatHair } = require(path.join(process.cwd(), 'lib', 'npc', 'hairUtil.js'));
const { generateEyes } = require(path.join(process.cwd(), 'lib', 'npc', 'eyeUtil.js'));
const { pickTrait, pickBeardTrait } = require(path.join(process.cwd(), 'lib', 'npc', 'traitUtil.js'));

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickWeightedAge() {
  const bands = [
    { min: 20, max: 24, weight: 6 },
    { min: 25, max: 34, weight: 32 },
    { min: 35, max: 44, weight: 27 },
    { min: 45, max: 54, weight: 18 },
    { min: 55, max: 64, weight: 11 },
    { min: 65, max: 80, weight: 6 }
  ];
  const total = bands.reduce((s, b) => s + b.weight, 0);
  let r = Math.random() * total;
  for (const b of bands) {
    if ((r -= b.weight) <= 0) return randInt(b.min, b.max);
  }
  return randInt(25, 40);
}

function buildGenderEmoji(gender) {
  if (gender === 'man') return '♂️';
  if (gender === 'woman') return '♀️';
  return config.emojis?.nonbinary_sign || '⚧️';
}

function buildColor(gender) {
  if (gender === 'man') return 0x226699;
  if (gender === 'woman') return 0xea596e;
  return 0xf4900c;
}

function generateNpc() {
  const gender = pickWeightedGender();
  const first = pickFirstName(gender);
  const last = pickSurname();
  const age = pickWeightedAge();

  const hair = generateHair(age);
  const hairText = formatHair(hair);

  const eyes = generateEyes();
  const trait = pickTrait();
  const beard = gender === 'man' ? pickBeardTrait() : null;

  const genderEmoji = buildGenderEmoji(gender);
  const color = buildColor(gender);

  return {
    first,
    last,
    fullName: `${first} ${last}`,
    gender,
    genderEmoji,
    color,
    age,
    hairText,
    eyesText: eyes.text,
    trait,
    beard
  };
}

module.exports = {
  generateNpc
};
