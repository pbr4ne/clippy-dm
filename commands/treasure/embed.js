const { EmbedBuilder } = require('discord.js');

function buildTreasureEmbed(treasures, requestedBy) {
  const emojis = treasures.length ? treasures.map(t => t.emoji).join(' ') : '❌';
  const details = treasures.length ? treasures.map(t => `${t.name}: ${t.amount}`).join('\n') : 'No treasure found';
  return new EmbedBuilder()
    .setTitle('Generated Treasure')
    .setDescription(emojis)
    .addFields({ name: 'Details', value: details })
    .setColor('#FFD700')
    .setFooter({ text: `Requested by ${requestedBy}` })
    .setTimestamp();
}

module.exports = { buildTreasureEmbed };
