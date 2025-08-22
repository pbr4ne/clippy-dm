const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType
} = require('discord.js');

const RACES = ['Human', 'Elf', 'Dwarf', 'Halfling', 'Orc', 'Tiefling'];
const GENDERS = ['Female', 'Male', 'Nonbinary'];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
function generateName(race, gender) {
  const firsts = ['Rowan', 'Eliza', 'Gideon', 'Sage', 'Avery', 'Mira', 'Theo', 'Nyx'];
  const lasts = ['Blackwell', 'Thorne', 'Harrow', 'Fairwind', 'Locke', 'Moors', 'Ashvale'];
  return `${pick(firsts)} ${pick(lasts)}`;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('npc')
    .setDescription('Generate an NPC name'),
  async execute(interaction) {
    const nonce = interaction.id;
    const ids = {
      race: `npc_race_${nonce}`,
      gender: `npc_gender_${nonce}`,
      gen: `npc_gen_${nonce}`,
      doneOrCancel: `npc_done_cancel_${nonce}`
    };

    const state = { race: null, gender: null, name: null };

    const content = () => [
      '**Create NPC**',
      `• Race: ${state.race ?? '*—*'}`,
      `• Gender: ${state.gender ?? '*—*'}`,
      `• Name: ${state.name ? `**${state.name}**` : '*—*'}`
    ].join('\n');

    const finalizeText = () =>
      `✅ **NPC Created**\n• Race: ${state.race}\n• Gender: ${state.gender}\n• Name: **${state.name}**`;

    const buildRows = () => {
      const raceMenu = new StringSelectMenuBuilder()
        .setCustomId(ids.race)
        .setPlaceholder('Choose race')
        .addOptions(RACES.map(r => ({
          label: r,
          value: r,
          default: state.race === r
        })));

      const genderMenu = new StringSelectMenuBuilder()
        .setCustomId(ids.gender)
        .setPlaceholder('Choose gender')
        .addOptions(GENDERS.map(g => ({
          label: g,
          value: g,
          default: state.gender === g
        })));

      const canGenerate = Boolean(state.race && state.gender);

      const actions = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(ids.gen)
          .setLabel('Generate Name')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(!canGenerate),
        new ButtonBuilder()
          .setCustomId(ids.doneOrCancel)
          .setLabel(state.name ? 'Done' : 'Cancel')
          .setStyle(state.name ? ButtonStyle.Success : ButtonStyle.Danger)
      );

      return [
        new ActionRowBuilder().addComponents(raceMenu),
        new ActionRowBuilder().addComponents(genderMenu),
        actions
      ];
    };

    const msg = await interaction.reply({
      content: content(),
      components: buildRows()
    });

    const filter = (i) =>
      i.user.id === interaction.user.id &&
      [ids.race, ids.gender, ids.gen, ids.doneOrCancel].includes(i.customId);

    const collector = msg.createMessageComponentCollector({
      componentType: ComponentType.MessageComponent,
      filter,
      time: 120_000
    });

    collector.on('collect', async (i) => {
      if (i.customId === ids.race) {
        state.race = i.values[0];
        state.name = null;
        return i.update({ content: content(), components: buildRows() });
      }

      if (i.customId === ids.gender) {
        state.gender = i.values[0];
        state.name = null;
        return i.update({ content: content(), components: buildRows() });
      }

      if (i.customId === ids.gen) {
        state.name = generateName(state.race, state.gender);
        return i.update({ content: content(), components: buildRows() });
      }

      if (i.customId === ids.doneOrCancel) {
        if (state.name) {
          await i.update({
            content: finalizeText(),
            components: []
          });
          return collector.stop('done');
        } else {
          await i.update({
            content: '❌ NPC creation canceled.',
            components: []
          });
          return collector.stop('cancelled');
        }
      }
    });

    collector.on('end', async (_c, reason) => {
      if (reason === 'time') {
        try {
          if (state.name && state.race && state.gender) {
            await msg.edit({
              content: finalizeText(),
              components: []
            });
          } else {
            await msg.edit({
              content: '⌛ Timed out. Start `/npc` again.',
              components: []
            });
          }
        } catch (_) {}
      }
    });
  }
};
