const { Op } = require('sequelize')
const { sendReminder } = require('./sender')
const Reminder = require('./reminderModel')

const MAX_TIMEOUT = 2 ** 31 - 1;

exports.loadAndScheduleReminders = async (client) => {
	const now = new Date();
	const pending = await Reminder.findAll({ where: { remindAt: { [Op.gt]: now }, completed: false, canceled: false } });
	pending.forEach(r => scheduleReminder(r.id, client));

	const missed = await Reminder.findAll({ where: { remindAt: { [Op.lte]: now }, completed: false, canceled: false } });
	for (const r of missed) await sendIfNotDone(r.id, client);

	console.log(`scheduled ${pending.length} pending`);
	console.log(`processed ${missed.length} missed`);
}

function scheduleReminder(id, client) {
	const tick = async () => {
		const r = await Reminder.findByPk(id);
		if (!r || r.completed || r.canceled) {
			return;
		}
		const delay = r.remindAt.getTime() - Date.now();
		if (delay <= 0) {
			return sendReminder(r, client);
		}
		if (delay > MAX_TIMEOUT) {
			setTimeout(tick, MAX_TIMEOUT);
		}
		else {
			setTimeout(async () => { await sendIfNotDone(id, client) }, delay);
		}
	}
	tick();
}

async function sendIfNotDone(id, client) {
	const r = await Reminder.findByPk(id);
	if (!r || r.completed || r.canceled) {
		return;
	}
	await sendReminder(r, client);
}

exports.scheduleReminder = scheduleReminder;
