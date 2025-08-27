const { SlashCommandBuilder } = require('discord.js');
const path = require('path');
const config = require(path.join(process.cwd(), 'config.json'));

const numbers = config.emojis.numbers;
const animatedDice = config.emojis.animatedDice;

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

const formatRoll = (dieSides, value) => {
  const base = numbers[value] || value.toString();

  if (dieSides === 20 && value === 20) return `✨${base}✨`;
  if (dieSides === 20 && value === 1) return `💀${base}💀`;

  return base;
};

const formatTotal = (total) => {
  return numbers[total] || total.toString();
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
        .setDescription('Number of dice (1-10)')
        .setMinValue(1)
        .setMaxValue(10)
        .setRequired(true)
    ),
  async execute(interaction) {
    const dieSides = parseInt(interaction.options.getString('dice'), 10);
    const count = interaction.options.getInteger('count') || 1;

    const dots = (step) => '.'.repeat((step % 3) + 1);
    const rollingHeader = (step) => `${animatedDice} Rolling ${count} d${dieSides}${dots(step)}`;

    await interaction.reply({ content: rollingHeader(0) });
    const msg = await interaction.fetchReply();

    const results = [];
    const parts = [];

    for (let i = 0; i < count; i++) {
      const roll = Math.floor(Math.random() * dieSides) + 1;
      results.push(roll);
      parts.push(formatRoll(dieSides, roll));

      await msg.edit({
        content: `${rollingHeader(i)}\n${parts.join(' • ')}`
      });

      if (i < count) {
        await sleep(500);
      }
    }

    const finalHeader = `✅ Rolled ${count} d${dieSides}`;
    if (count > 1) {
      const total = results.reduce((a, b) => a + b, 0);
      await msg.edit({
        content: `${finalHeader}\n${parts.join(' • ')}\n**Total:** ${formatTotal(total)}`
      });
    } else {
      await msg.edit({
        content: `${finalHeader}\n${parts.join(' • ')}`
      });
    }
  },
};
