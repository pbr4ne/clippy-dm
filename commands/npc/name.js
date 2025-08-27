const { SlashCommandBuilder } = require('discord.js');
const path = require('path');
const config = require(path.join(process.cwd(), 'config.json'));
const { pickFirstName, pickSurname, pickWeightedGender } = require(path.join(process.cwd(), 'lib', 'nameUtil.js'));

module.exports = {
  data: new SlashCommandBuilder()
    .setName('name')
    .setDescription('Generate a random name.')
    .addStringOption(option =>
      option
        .setName('gender')
        .setDescription('Optional gender')
        .setRequired(false)
        .addChoices(
          { name: 'woman', value: 'woman' },
          { name: 'man', value: 'man' },
          { name: 'nonbinary', value: 'nonbinary' }
        )
    ),
  async execute(interaction) {
    let gender = interaction.options.getString('gender') || pickWeightedGender();

    const first = pickFirstName(gender);
    const last = pickSurname();
    const full = `${first} ${last}`;

    let genderEmoji;
    if (gender === 'man') genderEmoji = '♂️';
    else if (gender === 'woman') genderEmoji = '♀️';
    else genderEmoji = config.emojis.nonbinary_sign;

    await interaction.reply(`NPC name: **${full}** ${genderEmoji}`);
  },
};
