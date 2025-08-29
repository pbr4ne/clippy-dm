const { SlashCommandBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const { buildEmotionEmbed } = require(path.join(process.cwd(), 'commands', 'emotion', 'embed.js'));

const files = {
  common: path.join(process.cwd(), 'commands', 'emotion', 'data', 'emotions_common.json'),
  uncommon: path.join(process.cwd(), 'commands', 'emotion', 'data', 'emotions_uncommon.json'),
  rare: path.join(process.cwd(), 'commands', 'emotion', 'data', 'emotions_rare.json')
};

function loadJsonList(filePath) {
  if (!fs.existsSync(filePath)) return [];
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter(e => e && e.label);
    return [];
  } catch {
    return [];
  }
}

function pickWeighted() {
  const roll = Math.random();
  if (roll < 0.7) return 'common';
  if (roll < 0.99) return 'uncommon';
  return 'rare';
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('emotion')
    .setDescription('Generate a random emotion.')
    .addStringOption(o =>
      o.setName('rarity')
        .setDescription('Pick a rarity or leave blank for random')
        .addChoices(
          { name: 'common', value: 'common' },
          { name: 'uncommon', value: 'uncommon' },
          { name: 'rare', value: 'rare' }
        )
    ),
  async execute(interaction) {
    const rarityOpt = interaction.options.getString('rarity');
    const rarity = rarityOpt || pickWeighted();
    const list = loadJsonList(files[rarity]);
    if (!list.length) {
      await interaction.reply({ content: 'No emotions available for the selected rarity.', ephemeral: true });
      return;
    }
    const item = pickRandom(list);
    const embed = buildEmotionEmbed({ label: item.label, emoji: item.emoji, rarity }, interaction.user.username);
    await interaction.reply({ embeds: [embed] });
  }
};
