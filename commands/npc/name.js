const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require(path.join(process.cwd(), 'config.json'));

const loadNames = (filename) => {
  const filePath = path.join(process.cwd(), 'data', 'names', filename);
  return fs.readFileSync(filePath, 'utf8')
    .split('\n')
    .map(name => name.trim())
    .filter(Boolean);
};

const feminineNames = loadNames('feminine.txt');
const masculineNames = loadNames('masculine.txt');
const nonbinaryNames = loadNames('nonbinary.txt');
const surnames = loadNames('surnames.txt');

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('name')
    .setDescription('Generate a random NPC name.')
    .addStringOption(option =>
      option
        .setName('gender')
        .setDescription('Optional gender')
        .setRequired(false)
        .addChoices(
          { name: 'feminine', value: 'feminine' },
          { name: 'masculine', value: 'masculine' },
          { name: 'nonbinary', value: 'nonbinary' }
        )
    ),
  async execute(interaction) {
    let gender = interaction.options.getString('gender');

    if (!gender) {
      const roll = Math.random();
      if (roll < 0.49) gender = 'masculine';
      else if (roll < 0.98) gender = 'feminine';
      else gender = 'nonbinary';
    }

    let firstName;
    switch (gender) {
      case 'feminine':
        firstName = pick(feminineNames);
        break;
      case 'masculine':
        firstName = pick(masculineNames);
        break;
      case 'nonbinary':
        firstName = pick(nonbinaryNames);
        break;
    }

    const surname = pick(surnames);
    const fullName = `${firstName} ${surname}`;

    let genderEmoji;
    if (gender === 'masculine') genderEmoji = '♂️';
    else if (gender === 'feminine') genderEmoji = '♀️';
    else genderEmoji = config.emojis.nonbinary_sign;

    await interaction.reply(`NPC name: **${fullName}** ${genderEmoji}`);
  },
};
