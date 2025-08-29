const { SlashCommandBuilder } = require('discord.js')
const ms = require('ms')
const chrono = require('chrono-node')
const { createReminder } = require('./core')

exports.data = new SlashCommandBuilder()
	.setName('remind')
	.setDescription('Set a reminder')
	.addStringOption(o => o.setName('text').setDescription('What to remind you of').setRequired(true))
	.addStringOption(o => o.setName('when').setDescription('e.g., 10 minutes, 3pm, tomorrow at 1pm').setRequired(true))
	.addBooleanOption(o => o.setName('private').setDescription('Keep the reminder private'))

exports.execute = async (interaction) => {
	const when = interaction.options.getString('when', true)
	const text = interaction.options.getString('text', true)
	const isPrivate = interaction.options.getBoolean('private') ?? false

	const isDuration = typeof ms(when) === 'number'
	if (!isDuration) {
		const results = chrono.parse(when, new Date(), { forwardDate: true })
		if (!results.length) {
			return interaction.reply({ content: 'I couldn’t parse that time.', ephemeral: true })
		}
	}

	await createReminder({
		client: interaction.client,
		userId: interaction.user.id,
		channelId: interaction.channelId,
		when,
		text,
		isPrivate,
		zone: process.env.BOT_TZ || 'America/Vancouver',
		reply: (out) => interaction.reply({ content: out, ephemeral: isPrivate })
	})
}
