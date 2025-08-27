const { SlashCommandBuilder } = require('discord.js');

const seasons = {
  winter: {
    tempRange: { min: -25, max: 10 },
    conditions: [
      { name: 'Clear', emoji: '☀️' },
      { name: 'Cloudy', emoji: '☁️' },
      { name: 'Light Snow', emoji: '🌨️' },
      { name: 'Snow', emoji: '❄️' },
      { name: 'Sleet', emoji: '🌧️' },
      { name: 'Rain', emoji: '🌧️' },
      { name: 'Fog', emoji: '🌫️' },
    ]
  },
  spring: {
    tempRange: { min: 2, max: 23 },
    conditions: [
      { name: 'Partly Cloudy', emoji: '⛅' },
      { name: 'Showers', emoji: '🌦️' },
      { name: 'Rain', emoji: '🌧️' },
      { name: 'Clear', emoji: '☀️' },
      { name: 'Fog', emoji: '🌫️' },
    ]
  },
  summer: {
    tempRange: { min: 18, max: 38 },
    conditions: [
      { name: 'Clear', emoji: '☀️' },
      { name: 'Partly Cloudy', emoji: '⛅' },
      { name: 'Showers', emoji: '🌦️' },
      { name: 'Thunderstorm', emoji: '⛈️' },
      { name: 'Heatwave', emoji: '🔥' },
    ]
  },
  autumn: {
    tempRange: { min: 3, max: 23 },
    conditions: [
      { name: 'Partly Cloudy', emoji: '⛅' },
      { name: 'Windy', emoji: '🌬️' },
      { name: 'Rain', emoji: '🌧️' },
      { name: 'Clear', emoji: '☀️' },
      { name: 'Fog', emoji: '🌫️' },
    ]
  }
};

const windDirections = ['⬆️', '↗️', '➡️', '↘️', '⬇️', '↙️', '⬅️', '↖️'];

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('weather')
    .setDescription('Generate weather.')
    .addStringOption(o =>
      o.setName('season')
        .setDescription('Season')
        .setRequired(true)
        .addChoices(
          { name: 'winter', value: 'winter' },
          { name: 'spring', value: 'spring' },
          { name: 'summer', value: 'summer' },
          { name: 'autumn', value: 'autumn' }
        )
    ),
  async execute(interaction) {
    const seasonKey = interaction.options.getString('season');
    const spec = seasons[seasonKey];

    const temp = randInt(spec.tempRange.min, spec.tempRange.max);
    const condition = pickRandom(spec.conditions);

    const windSpeed = randInt(0, 35);
    const windDir = pickRandom(windDirections);
    const humidity = randInt(40, 95);

    const reply = `${condition.emoji} **${condition.name}**\n`
      + `**Temp:** ${temp}°C\n`
      + `**Wind:** ${windSpeed} km/h ${windDir}\n`
      + `**Humidity:** ${humidity}%`;

    await interaction.reply(reply);
  },
};
