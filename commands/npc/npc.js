const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const path = require('path');
const config = require(path.join(process.cwd(), 'config.json'));
const {
  pickFirstName,
  pickSurname,
  pickWeightedGender
} = require(path.join(process.cwd(), 'lib', 'nameUtil.js'));
const { generateHair, formatHair } = require(path.join(process.cwd(), 'lib', 'hairUtil.js'));
const { generateEyes } = require(path.join(process.cwd(), 'lib', 'eyeUtil.js'));

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

module.exports = {
  data: new SlashCommandBuilder()
    .setName('npc')
    .setDescription('Generate a random NPC'),
  async execute(interaction) {
    const gender = pickWeightedGender();
    const first = pickFirstName(gender);
    const last = pickSurname();
    const age = pickWeightedAge();

    const hair = generateHair(age);
    const hairText = formatHair(hair);

    const eyes = generateEyes();

    const genderEmoji =
      gender === 'man' ? '♂️' :
      gender === 'woman' ? '♀️' :
      (config.emojis?.nonbinary_sign || '⚧️');

    const color =
      gender === 'man' ? 0x226699 :
      gender === 'woman' ? 0xea596e :
      0xf4900c;

    const embed = new EmbedBuilder()
      .setTitle('NPC Generated')
      .setColor(color)
      .addFields(
        { name: 'Name', value: `${first} ${last}`, inline: true },
        { name: 'Gender', value: `${genderEmoji} ${gender}`, inline: true },
        {
          name: "\t",
          value: "\t"
        },
        { name: 'Age', value: `${age}`, inline: true },
        { name: 'Eyes', value: eyes.text, inline: true },
        {
          name: "\t",
          value: "\t"
        },
        { name: 'Hair', value: hairText, inline: false }
      )
      .setFooter({ text: `Requested by ${interaction.user.username}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
