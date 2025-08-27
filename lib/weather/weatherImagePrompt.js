

function buildWeatherImagePrompt({ condition, temp, windSpeed, windDir, humidity }) {
	const wind = windSpeed > 30 ? 'windy' : '';
	return [
		`High quality landscape scene depicting: ${wind} ${condition.name}.`,
		`Single wide shot of sky and horizon, natural lighting, detailed clouds and atmosphere. Looks like it's in Barovia.`,
    `Medium: ink and watercolour.`
	].join(' ');
}

module.exports = { buildWeatherImagePrompt };
