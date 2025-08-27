const path = require('path');
const {
	SlashCommandBuilder,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
	ComponentType
} = require('discord.js');

const { loadWeatherList } = require(path.join(process.cwd(), 'lib', 'weatherConfig.js'));
const { generateWeatherImage } = require(path.join(process.cwd(), 'lib', 'imageService.js'));
const { buildWeatherEmbed } = require(path.join(process.cwd(), 'lib', 'weatherEmbed.js'));

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

			const weather = { condition, temp, windSpeed, windDir, humidity };
			const embed = buildWeatherEmbed(weather, interaction.user.username);

			const nonce = interaction.id;
			const genBtnId = `weather_gen_img_${nonce}`;
			const row = new ActionRowBuilder().addComponents(
				new ButtonBuilder()
					.setCustomId(genBtnId)
					.setLabel('Generate Image')
					.setStyle(ButtonStyle.Primary)
			);

			const message = await interaction.reply({ embeds: [embed], components: [row] });

			const filter = i => i.user.id === interaction.user.id && i.customId === genBtnId;
			const collector = message.createMessageComponentCollector({
				componentType: ComponentType.Button,
				filter,
				time: 5 * 60 * 1000
			});

			collector.on('collect', async i => {
				const disabled = new ActionRowBuilder().addComponents(
					new ButtonBuilder()
						.setCustomId(genBtnId)
						.setLabel('Generating…')
						.setStyle(ButtonStyle.Primary)
						.setDisabled(true)
				);
				await i.update({ components: [disabled] });

				const result = await generateWeatherImage(weather);

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
					embed.setImage('attachment://weather.png');
					await message.edit({ embeds: [embed], files: [result.file], components: [] });
				} else {
					await i.followUp({ content: '⚠️ Image generation failed. Code: 102', ephemeral: true });
					await message.edit({ components: [] });
				}
			});

			collector.on('end', async () => {
				try { await message.edit({ components: [] }); } catch (_) {}
			});
		} catch (_) {
			const { EmbedBuilder } = require('discord.js');
			const embed = new EmbedBuilder()
				.setTitle('Generated Weather')
				.setColor('#9b59b6')
				.setDescription('⚠️ Weather generation failed.');
			await interaction.reply({ embeds: [embed] });
		}
	},
};
