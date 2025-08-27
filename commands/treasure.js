const { SlashCommandBuilder } = require('discord.js');
const path = require('node:path');
const { buildTreasureEmbed } = require(path.join(process.cwd(), 'lib', 'treasure', 'treasureEmbed.js'));

const treasureTypes = [
  { name: 'Coins', emoji: '🪙', min: 50, max: 500 },
  { name: 'Gems', emoji: '💎', min: 1, max: 5 },
  { name: 'Jewelry', emoji: '💍', min: 1, max: 3 },
  { name: 'Magic Items', emoji: '🪄', min: 0, max: 2 },
  { name: 'Crown Jewels', emoji: '👑', min: 0, max: 2 },
  { name: 'Relics', emoji: '📿', min: 0, max: 1 },
  { name: 'Artifacts', emoji: '🗿', min: 0, max: 1 }
];

function getRandomTreasure() {
  const count = Math.floor(Math.random() * 3) + 2;
  const shuffled = [...treasureTypes].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).map(t => {
    const amount = Math.floor(Math.random() * (t.max - t.min + 1)) + t.min;
    return { ...t, amount };
  });
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('treasure')
    .setDescription('Generate treasure.'),
  async execute(interaction) {
    const treasures = getRandomTreasure().filter(t => t.amount > 0);
    const embed = buildTreasureEmbed(treasures, interaction.user.username);
    await interaction.reply({ embeds: [embed] });
  }
};
