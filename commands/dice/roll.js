const { SlashCommandBuilder } = require('discord.js');

const numberEmojis = {
	'0': '0️⃣',
	'1': '1️⃣',
	'2': '2️⃣',
	'3': '3️⃣',
	'4': '4️⃣',
	'5': '5️⃣',
	'6': '6️⃣',
	'7': '7️⃣',
	'8': '8️⃣',
	'9': '9️⃣'
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('roll')
		.setDescription('Rolls a die!')
		.addStringOption(option =>
			option.setName('dice')
			.setDescription('Dice to roll')
			.setRequired(true)
			.addChoices(
				{ name: 'D2', value: '2' },
				{ name: 'D4', value: '4' },
				{ name: 'D6', value: '6' },
				{ name: 'D8', value: '8' },
				{ name: 'D10', value: '10' },
				{ name: 'D12', value: '12' },
				{ name: 'D20', value: '20' }
			)),
	async execute(interaction) {
    const dieToRoll = interaction.options.getString('dice');
		const roll = Math.floor(Math.random() * dieToRoll) + 1;

		const rollEmoji = roll
			.toString()
			.split('')
			.map(digit => numberEmojis[digit])
			.join('');

    await interaction.reply(rollEmoji);
	},
};
