const { EmbedBuilder } = require('discord.js');

const path = require('path');
const { emojiToUrl } = require(path.join(process.cwd(), 'commands', 'util', 'emojiService.js'));

function buildEmotionEmbed({ label, emoji, rarity }, requestedBy) {
  const emojiUrl = emojiToUrl(emoji);
  return new EmbedBuilder()
    .setTitle('Generated Emotion')
    .setDescription(label)
    .setThumbnail(emojiUrl || null)
    .setColor('#FF2D2D')
    .setFooter({ text: `Requested by ${requestedBy}` })
    .setTimestamp();
}

module.exports = { buildEmotionEmbed };
