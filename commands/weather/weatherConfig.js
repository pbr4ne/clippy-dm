const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(process.cwd(), 'commands', 'weather', 'data', 'weather.json');

function loadWeatherList() {
	try {
		const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
		const parsed = JSON.parse(raw);

		if (
			!parsed ||
			!Array.isArray(parsed.common) ||
			!Array.isArray(parsed.uncommon)
		) {
			throw new Error('Invalid weather config format');
		}

		return parsed;
	} catch (err) {
		console.error('Failed to load weather config:', err);
		throw err;
	}
}

module.exports = { loadWeatherList };
