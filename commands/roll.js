const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const path = require('path');
const config = require(path.join(process.cwd(), 'config.json'));

const animatedDice = config.emojis.animatedDice;
const numberThumbBaseUrl = config.images?.numberThumbBaseUrl;

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

const formatRoll = (dieSides, value) => {
  if (dieSides === 20 && value === 20) return `${value}✨`;
  if (dieSides === 20 && value === 1) return `${value}💀`;
  return value.toString();
};

const buildNumberThumbUrl = (n) => {
  if (numberThumbBaseUrl) {
    return `${numberThumbBaseUrl}/${n}.png`;
  }
  const txt = encodeURIComponent(String(n));
  return `https://dummyimage.com/256x256/222/ffffff.png&text=${txt}`;
};

const NBSP = '\u00A0';

const rightAlignDisplay = (display, numericStr, maxWidth) => {
  const pad = Math.max(0, maxWidth - numericStr.length);
  return NBSP.repeat(pad) + display;
};

const buildColumns = ({ displays, rolls, totalDice, dieSides, cols = 3, final = false }) => {
  const columns = Math.max(1, Math.min(cols, 3));
  const rowsPerCol = Math.ceil(totalDice / columns);
  const maxWidth = dieSides.toString().length;

  const gridSize = rowsPerCol * columns;
  const fullGrid = Array.from({ length: gridSize }, (_, i) => {
    if (i >= totalDice) return '';
    if (i >= displays.length) {
      const placeholder = rightAlignDisplay('—', '—', maxWidth);
      return '  ' + placeholder;
    }

    const val = rolls[i];
    const display = displays[i];
    const numericStr = String(val);

    const isCrit = dieSides === 20 && val === 20;
    const isFail = dieSides === 20 && val === 1;

    const prefix = isCrit ? '+ ' : isFail ? '- ' : '  ';
    const aligned = rightAlignDisplay(display, numericStr, maxWidth);
    return prefix + aligned;
  });

  const fields = [];
  for (let c = 0; c < columns; c++) {
    const start = c * rowsPerCol;
    const end = start + rowsPerCol;
    const chunk = fullGrid.slice(start, end);

    const safeLines = chunk.map(line => (line === '' ? NBSP : line));
    const block = '```diff\n' + safeLines.join('\n') + '\n```';

    fields.push({
      name: '\u200B',
      value: block,
      inline: true
    });
  }
  return fields;
};

const buildRollingEmbed = ({ dieSides, count, displays, rolls, requestedBy }) => {
  const title = `${animatedDice} Rolling ${count}d${dieSides}`;
  const embed = new EmbedBuilder()
    .setTitle(title)
    .setColor(0xff830a)
    .setFooter({ text: `Requested by ${requestedBy}` })
    .setTimestamp();

  const fields = buildColumns({ displays, rolls, totalDice: count, dieSides, cols: 3, final: false });
  embed.addFields(fields);

  return embed;
};

const buildFinalEmbed = ({ dieSides, count, displays, rolls, total, requestedBy }) => {
  const title = `Rolled ${count}d${dieSides}`;
  const embed = new EmbedBuilder()
    .setTitle(title)
    .setColor(0xff830a)
    .setFooter({ text: `Requested by ${requestedBy}` })
    .setTimestamp();

  const fields = buildColumns({ displays, rolls, totalDice: count, dieSides, cols: 3, final: true });
  embed.addFields(fields);

  if (count > 1) {
    embed.addFields({
      name: 'Total',
      value: '```fix\n' + `${total}\n` + '```',
      inline: false
    });
    embed.setThumbnail(buildNumberThumbUrl(total));
  } else {
    const raw = rolls[0];
    if (typeof raw === 'number') embed.setThumbnail(buildNumberThumbUrl(raw));
  }

  return embed;
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

      if (i < count - 1) {
        await sleep(500);
      }
    }

    const total = rolls.reduce((a, b) => a + b, 0);
    const finalEmbed = buildFinalEmbed({ dieSides, count, displays, rolls, total, requestedBy });

    await msg.edit({ embeds: [finalEmbed] });
  },
};
