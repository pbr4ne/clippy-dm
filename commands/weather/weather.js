const path = require('path');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { loadWeatherList } = require(path.join(process.cwd(), 'lib', 'weatherConfig.js'));

const windDirections = ['⬆️', '↗️', '➡️', '↘️', '⬇️', '↙️', '⬅️', '↖️'];

const pickRandom = arr => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('weather')
		.setDescription('Generate weather.'),
	async execute(interaction) {
		try {
			const conditions = loadWeatherList();
			const condition = pickRandom(conditions);
			const temp = randInt(-25, 38);
			const windSpeed = randInt(0, 35);
			const windDir = pickRandom(windDirections);
			const humidity = randInt(40, 95);

			const embed = new EmbedBuilder()
				.setTitle('Generated Weather')
				.setColor('#9b59b6')
				.addFields(
					{ name: 'Condition', value: `${condition.emoji} ${condition.name}`, inline: false },
					{ name: 'Temperature', value: `${temp}°C`, inline: false },
					{ name: 'Wind', value: `${windSpeed} km/h ${windDir}`, inline: false },
					{ name: 'Humidity', value: `${humidity}%`, inline: false }
				);

			await interaction.reply({ embeds: [embed] });
		} catch (err) {
			const embed = new EmbedBuilder()
				.setTitle('Generated Weather')
				.setColor('#9b59b6')
				.setDescription('⚠️ Weather generation failed.');

			await interaction.reply({ embeds: [embed] });
		}
	},
};
