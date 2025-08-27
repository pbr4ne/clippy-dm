const { EmbedBuilder } = require('discord.js');

function emojiToUrl(emoji) {
  if (!emoji) return null;
  const codePoints = [...emoji].map(c => c.codePointAt(0).toString(16)).join('-');
  return `https://twemoji.maxcdn.com/v/latest/72x72/${codePoints}.png`;
}

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
