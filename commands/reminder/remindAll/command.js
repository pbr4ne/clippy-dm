const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')
const ms = require('ms')
const chrono = require('chrono-node')
const { createReminder } = require('../core')

exports.data = new SlashCommandBuilder()
  .setName('remindall')
  .setDescription('Remind everyone in this channel')
  .addStringOption(o => o.setName('text').setDescription('What to remind everyone of').setRequired(true))
  .addStringOption(o => o.setName('when').setDescription('e.g., 10 minutes, 3pm, tomorrow at 1pm').setRequired(true))

exports.execute = async (interaction) => {
  if (!interaction.inGuild()) {
    return interaction.reply({ content: 'This command can only be used in a server channel.', ephemeral: true })
  }

  const when = interaction.options.getString('when', true)
  const text = interaction.options.getString('text', true)

  const isDuration = typeof ms(when) === 'number'
  if (!isDuration) {
    const results = chrono.parse(when, new Date(), { forwardDate: true })
    if (!results.length) {
      return interaction.reply({ content: 'I couldn\'t parse that time.', ephemeral: true })
    }
  }

  await createReminder({
    client: interaction.client,
    userId: interaction.user.id,
    channelId: interaction.channelId,
    when,
    text,
    isPrivate: false,
    targetUserId: null,
    mentionEveryone: true,
    zone: process.env.BOT_TZ || 'America/Vancouver',
    reply: (out) => interaction.reply({ content: out, ephemeral: false })
  })
}
