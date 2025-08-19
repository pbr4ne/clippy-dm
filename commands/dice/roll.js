const { SlashCommandBuilder } = require('discord.js');

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
        await interaction.reply(`You rolled a ${roll}!`);
	},
};
