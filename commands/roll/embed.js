const { EmbedBuilder } = require('discord.js');
const path = require('path');
const config = require(path.join(process.cwd(), 'config.json'));

const animatedDice = config.emojis.animatedDice;
const numberThumbBaseUrl = config.images?.numberThumbBaseUrl;

const NBSP = '\u00A0';

const buildNumberThumbUrl = (n) => {
  if (numberThumbBaseUrl) return `${numberThumbBaseUrl}/${n}.png`;
  const txt = encodeURIComponent(String(n));
  return `https://dummyimage.com/256x256/222/ffffff.png&text=${txt}`;
};

const rightAlign = (display, numericStr, width) => {
  const pad = Math.max(0, width - numericStr.length);
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
      const ph = rightAlign('—', '—', maxWidth);
      return '  ' + ph;
    }
    const v = rolls[i];
    const d = displays[i];
    const n = String(v);
    const isCrit = dieSides === 20 && v === 20;
    const isFail = dieSides === 20 && v === 1;
    const prefix = isCrit ? '+ ' : isFail ? '- ' : '  ';
    return prefix + rightAlign(d, n, maxWidth);
  });

  const fields = [];
  for (let c = 0; c < columns; c++) {
    const start = c * rowsPerCol;
    const end = start + rowsPerCol;
    const chunk = fullGrid.slice(start, end).map(line => (line === '' ? NBSP : line));
    const block = '```diff\n' + chunk.join('\n') + '\n```';
    fields.push({ name: '\u200B', value: block, inline: true });
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
    embed.addFields({ name: 'Total', value: '```fix\n' + `${total}\n` + '```', inline: false });
    embed.setThumbnail(buildNumberThumbUrl(total));
  } else {
    const raw = rolls[0];
    if (typeof raw === 'number') embed.setThumbnail(buildNumberThumbUrl(raw));
  }
  return embed;
};

module.exports = { buildRollingEmbed, buildFinalEmbed };
