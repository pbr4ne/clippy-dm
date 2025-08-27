const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(process.cwd(), 'data', 'weather', 'weather.txt');

function parseLines(txt) {
	return txt
		.split(/\r?\n/)
		.map(l => l.trim())
		.filter(Boolean)
		.map(line => {
			const parts = line.split(/\s+/);
			const emoji = parts.shift();
			const name = parts.join(' ');
			return { emoji, name };
		})
		.filter(x => x.emoji && x.name);
}

function loadWeatherList() {
	const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
	const parsed = parseLines(raw);

	if (!parsed.length) {
		throw new Error('Weather config is empty');
	}

	return parsed;
}

module.exports = { loadWeatherList };
