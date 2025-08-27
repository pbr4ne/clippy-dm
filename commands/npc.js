const {
  SlashCommandBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ComponentType
} = require('discord.js');

const path = require('path');
const { generateNpc } = require(path.join(process.cwd(), 'lib', 'npcGenerator.js'));
const { buildNpcEmbed } = require(path.join(process.cwd(), 'lib', 'npcEmbed.js'));
const { generateNpcImage } = require(path.join(process.cwd(), 'lib', 'imageService.js'));

module.exports = {
  data: new SlashCommandBuilder()
    .setName('npc')
    .setDescription('Generate a random NPC.'),
  async execute(interaction) {
    const npc = generateNpc();
    const embed = buildNpcEmbed(npc, interaction.user.username);

    const nonce = interaction.id;
    const genBtnId = `npc_gen_img_${nonce}`;

    const genRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(genBtnId)
        .setLabel('Generate Image')
        .setStyle(ButtonStyle.Primary)
    );

    const message = await interaction.reply({
      embeds: [embed],
      components: [genRow]
    });

    const filter = (i) => i.user.id === interaction.user.id && i.customId === genBtnId;
    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      filter,
      time: 5 * 60 * 1000
    });

    collector.on('collect', async (i) => {
      const disabledRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(genBtnId)
          .setLabel('Generating…')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(true)
      );
      await i.update({ components: [disabledRow] });

      const result = await generateNpcImage(npc);

      if (!result.ok) {
        const reenable = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(genBtnId)
            .setLabel('Generate Image')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(false)
        );

        if (result.reason === 'NO_KEY') {
          await i.followUp({ content: '⚠️ Image generation failed. Code: 100', ephemeral: true });
          return message.edit({ components: [reenable] });
        }

        await i.followUp({ content: '⚠️ Image generation failed. Code: 101', ephemeral: true });
        return message.edit({ components: [reenable] });
      }

      if (result.type === 'url') {
        embed.setImage(result.url);
        await message.edit({ embeds: [embed], components: [] });
      } else if (result.type === 'attachment') {
        embed.setImage('attachment://npc.png');
        await message.edit({ embeds: [embed], files: [result.file], components: [] });
      } else {
        await i.followUp({ content: '⚠️ Image generation failed. Code: 102', ephemeral: true });
        await message.edit({ components: [] });
      }
    });

    collector.on('end', async () => {
      try { await message.edit({ components: [] }); } catch (_) {}
    });
  }
};
