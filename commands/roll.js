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

const nbSpace = '\u00A0';
const rightPad = (text, width) => {
  const len = text.length;
  const pad = Math.max(0, width - len);
  return nbSpace.repeat(pad) + text;
};

const buildColumns = (lines, totalDice, dieSides, cols = 3, final = false) => {
  const columns = Math.max(1, Math.min(cols, 3));
  const rowsPerCol = Math.ceil(totalDice / columns);

  const maxWidth = dieSides.toString().length;

  const gridSize = rowsPerCol * columns;
  const fullGrid = Array.from({ length: gridSize }, (_, i) => {
    if (i < totalDice) {
      if (i < lines.length) {
        return rightPad(lines[i], maxWidth);
      }
      return final ? '' : rightPad('—', maxWidth);
    }
    return '';
  });

  const fields = [];
  for (let c = 0; c < columns; c++) {
    const start = c * rowsPerCol;
    const end = start + rowsPerCol;
    const chunk = fullGrid.slice(start, end);

    const safeLines = chunk.map(line => (line === '' ? nbSpace : line));
    const block = '```' + '\n' + safeLines.join('\n') + '\n' + '```';

    fields.push({
      name: '\u200B',
      value: block,
      inline: true
    });
  }

  return fields;
};

const buildRollingEmbed = ({ dieSides, count, parts, requestedBy }) => {
  const title = `${animatedDice} Rolling ${count}d${dieSides}`;
  const embed = new EmbedBuilder()
    .setTitle(title)
    .setColor(0xff830a)
    .setFooter({ text: `Requested by ${requestedBy}` })
    .setTimestamp();

  const fields = buildColumns(parts, count, dieSides, 3, false);
  embed.addFields(fields);

  return embed;
};

const buildFinalEmbed = ({ dieSides, count, parts, total, requestedBy }) => {
  const title = `Rolled ${count}d${dieSides}`;
  const embed = new EmbedBuilder()
    .setTitle(title)
    .setColor(0xff830a)
    .setFooter({ text: `Requested by ${requestedBy}` })
    .setTimestamp();

  const fields = buildColumns(parts, count, dieSides, 3, true);
  embed.addFields(fields);

  if (count > 1) {
    embed.addFields({
      name: 'Total',
      value: '```fix\n' + `   ${total}\n` + '```',
      inline: false
    });
    embed.setThumbnail(buildNumberThumbUrl(total));
  } else {
    const raw = parseInt(parts[0]?.replace(/[^\d]/g, ''), 10);
    if (!Number.isNaN(raw)) embed.setThumbnail(buildNumberThumbUrl(raw));
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

    const results = [];
    const parts = [];

    await interaction.reply({ embeds: [buildRollingEmbed({ dieSides, count, parts, requestedBy })] });
    const msg = await interaction.fetchReply();

    for (let i = 0; i < count; i++) {
      const roll = Math.floor(Math.random() * dieSides) + 1;
      results.push(roll);
      parts.push(formatRoll(dieSides, roll));

      await msg.edit({ embeds: [buildRollingEmbed({ dieSides, count, parts, requestedBy })] });

      if (i < count - 1) {
        await sleep(500);
      }
    }

    const total = results.reduce((a, b) => a + b, 0);
    const finalEmbed = buildFinalEmbed({ dieSides, count, parts, total, requestedBy });

    await msg.edit({ embeds: [finalEmbed] });
  },
};
