const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('roll')
		.setDescription('Rolls a D20!'),
	async execute(interaction) {
        const roll = Math.floor(Math.random() * 20) + 1;
        await interaction.reply(`You rolled a ${roll}!`);
	},
};
