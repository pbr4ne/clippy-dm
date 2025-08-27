const { EmbedBuilder } = require('discord.js');

function buildNpcEmbed(npc, requestedBy) {
  const fields = [
    { name: 'Name', value: npc.fullName, inline: true },
    { name: 'Gender', value: `${npc.genderEmoji} ${npc.gender}`, inline: true },
    { name: 'Age', value: String(npc.age), inline: true },
    { name: 'Eyes', value: npc.eyesText, inline: true },
    { name: 'Hair', value: npc.hairText, inline: true }
  ];

  if (npc.beard) {
    fields.push({ name: 'Beard', value: npc.beard, inline: true });
  }

  fields.push({ name: 'Trait', value: npc.trait, inline: true });

  return new EmbedBuilder()
    .setTitle('Generated NPC')
    .setColor(npc.color)
    .addFields(fields)
    .setFooter({ text: `Requested by ${requestedBy}` })
    .setTimestamp();
}

module.exports = { buildNpcEmbed };
