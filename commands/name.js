const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const path = require('path');
const config = require(path.join(process.cwd(), 'config.json'));
const { pickFirstName, pickSurname, pickWeightedGender } = require(path.join(process.cwd(), 'lib', 'name', 'nameUtil.js'));

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
    const gender = interaction.options.getString('gender') || pickWeightedGender();

    const first = pickFirstName(gender);
    const last = pickSurname();
    const full = `${first} ${last}`;

    const genderEmoji =
      gender === 'man'
        ? '♂️'
        : gender === 'woman'
        ? '♀️'
        : config.emojis.nonbinary_sign || '⚧️';

    const color =
      gender === 'man'
        ? 0x226699
        : gender === 'woman'
        ? 0xea596e
        : 0xf4900c;

    const embed = new EmbedBuilder()
      .setTitle('Generated Name')
      .setColor(color)
      .addFields({
        name: 'Name',
        value: `${full} ${genderEmoji}`,
        inline: true
      })
      .setFooter({ text: `Requested by ${interaction.user.username}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
