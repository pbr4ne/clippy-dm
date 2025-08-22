const { SlashCommandBuilder } = require('discord.js');

const numberEmojis = {
  '0': '0️⃣',
  '1': '1️⃣',
  '2': '2️⃣',
  '3': '3️⃣',
  '4': '4️⃣',
  '5': '5️⃣',
  '6': '6️⃣',
  '7': '7️⃣',
  '8': '8️⃣',
  '9': '9️⃣'
};

const toEmoji = (num) =>
  num
    .toString()
    .split('')
    .map(d => numberEmojis[d])
    .join('');

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

const formatRoll = (dieSides, value) => {
  const base = toEmoji(value);
  if (dieSides === 20 && value === 20) return `✨${base}✨`;
  if (dieSides === 20 && value === 1)  return `💀${base}💀`;
  return base;
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roll')
    .setDescription('Rolls dice!')
    .addStringOption(option =>
      option
        .setName('dice')
        .setDescription('Dice to roll')
        .setRequired(true)
        .addChoices(
          { name: 'D2',  value: '2'  },
          { name: 'D4',  value: '4'  },
          { name: 'D6',  value: '6'  },
          { name: 'D8',  value: '8'  },
          { name: 'D10', value: '10' },
          { name: 'D12', value: '12' },
          { name: 'D20', value: '20' }
        )
    )
    .addIntegerOption(option =>
      option
        .setName('count')
        .setDescription('Number of dice (1–10)')
        .setMinValue(1)
        .setMaxValue(10)
        .setRequired(true)
    ),
  async execute(interaction) {
    const dieSides = parseInt(interaction.options.getString('dice'), 10);
    const count = interaction.options.getInteger('count') || 1;

    const dots = (step) => '.'.repeat((step % 3) + 1);
    const rollingHeader = (step) => `🎲 Rolling ${count} D${dieSides}${dots(step)}`;

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

    const finalHeader = `✅ Rolled ${count} D${dieSides}`;
    if (count > 1) {
      const total = results.reduce((a, b) => a + b, 0);
      await msg.edit({
        content: `${finalHeader}\n${parts.join(' • ')}\n**Total:** ${toEmoji(total)}`
      });
    } else {
      await msg.edit({
        content: `${finalHeader}\n${parts.join(' • ')}`
      });
    }
  },
};
