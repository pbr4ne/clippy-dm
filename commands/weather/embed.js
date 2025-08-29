const { EmbedBuilder } = require('discord.js');

function buildWeatherEmbed(weather, requestedBy) {
	const fields = [
		{ name: 'Condition', value: `${weather.condition.emoji} ${weather.condition.name}`, inline: false },
		{ name: 'Temperature', value: `${weather.temp}°C`, inline: false },
		{ name: 'Wind', value: `${weather.windSpeed} km/h ${weather.windDir}`, inline: false },
		{ name: 'Humidity', value: `${weather.humidity}%`, inline: false }
	];

	return new EmbedBuilder()
		.setTitle('Generated Weather')
		.setColor('#9b59b6')
		.addFields(fields)
		.setFooter({ text: `Requested by ${requestedBy}` })
		.setTimestamp();
}

module.exports = { buildWeatherEmbed };
