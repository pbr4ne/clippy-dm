const { SlashCommandBuilder } = require('discord.js');
const path = require('path');
const { buildRollingEmbed, buildFinalEmbed } = require(path.join(process.cwd(), 'commands', 'roll', 'embed.js'));

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

const formatRoll = (dieSides, value) => {
  if (dieSides === 20 && value === 20) return `${value}✨`;
  if (dieSides === 20 && value === 1) return `${value}💀`;
  return value.toString();
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roll')
    .setDescription('Roll dice.')
    .addStringOption(option =>
      option
        .setName('dice')
        .setDescription('Dice to roll')
        .setRequired(true)
        .addChoices(
          { name: 'd2', value: '2' },
          { name: 'd4', value: '4' },
          { name: 'd6', value: '6' },
          { name: 'd8', value: '8' },
          { name: 'd10', value: '10' },
          { name: 'd12', value: '12' },
          { name: 'd20', value: '20' }
        )
    )
    .addIntegerOption(option =>
      option
        .setName('count')
        .setDescription('Number of dice (1-20)')
        .setMinValue(1)
        .setMaxValue(20)
        .setRequired(true)
    ),
  async execute(interaction) {
    const dieSides = parseInt(interaction.options.getString('dice'), 10);
    const count = interaction.options.getInteger('count') || 1;
    const requestedBy = interaction.user.displayName || interaction.user.username;

    const rolls = [];
    const displays = [];

    await interaction.reply({ embeds: [buildRollingEmbed({ dieSides, count, displays, rolls, requestedBy })] });
    const msg = await interaction.fetchReply();

    for (let i = 0; i < count; i++) {
      const roll = Math.floor(Math.random() * dieSides) + 1;
      rolls.push(roll);
      displays.push(formatRoll(dieSides, roll));
      await msg.edit({ embeds: [buildRollingEmbed({ dieSides, count, displays, rolls, requestedBy })] });
      if (i < count - 1) await sleep(500);
    }

    const total = rolls.reduce((a, b) => a + b, 0);
    const finalEmbed = buildFinalEmbed({ dieSides, count, displays, rolls, total, requestedBy });
    await msg.edit({ embeds: [finalEmbed] });
  },
};
