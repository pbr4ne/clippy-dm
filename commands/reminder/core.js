const ms = require('ms')
const chrono = require('chrono-node')
const { DateTime, IANAZone } = require('luxon')
const Reminder = require('./reminderModel')
const { scheduleReminder } = require('./scheduler')

const DEFAULT_HOUR = parseInt(process.env.REMINDER_DEFAULT_HOUR ?? '9', 10)
const DEFAULT_MINUTE = parseInt(process.env.REMINDER_DEFAULT_MINUTE ?? '0', 10)

exports.createReminder = async ({ client, userId, channelId, when, text, isPrivate, zone, reply }) => {
	const parsed = parseWhen(when, zone)
	if (!parsed) return reply('I couldn\'t parse the time.')

	if (parsed.mode === 'duration') {
		const remindAt = DateTime.utc().plus({ milliseconds: parsed.delay }).toJSDate()
		await reply(`Okay <@${userId}>. I'll remind you "${text}" in ${ms(parsed.delay, { long: true })}.`)
		const r = await Reminder.create({ userId, channelId, text, isPrivate, remindAt, completed: false, canceled: false, createdAt: new Date() })
		scheduleReminder(r.id, client)
		return
	}

	const display = formatLocal(parsed.target)
	await reply(`Okay <@${userId}>. I'll remind you "${text}" at ${display}.`)
	const remindAt = parsed.target.setZone('utc').toJSDate()
	const r = await Reminder.create({ userId, channelId, text, isPrivate, remindAt, completed: false, canceled: false, createdAt: new Date() })
	scheduleReminder(r.id, client)
}

function parseWhen(input, preferredZone) {
	if (!input) return null

	const dur = ms(input)
	if (typeof dur === 'number') return { mode: 'duration', delay: dur }

	const zone = IANAZone.isValidZone(preferredZone) ? preferredZone : (process.env.BOT_TZ || 'America/Vancouver')
	const now = DateTime.now().setZone(zone)
	const results = chrono.parse(input, now.toJSDate(), { forwardDate: true })
	if (!results.length) return null

	const r = results[0]
	const c = r.start

	if (c.isCertain('timezoneOffset')) {
		const targetUtc = DateTime.fromJSDate(r.start.date(), { zone: 'utc' })
		const local = targetUtc.setZone(zone)
		return { mode: 'absolute', target: local }
	}

	let dt = DateTime.fromObject({
		year: c.get('year') ?? now.year,
		month: c.get('month') ?? now.month,
		day: c.get('day') ?? now.day,
		hour: c.isCertain('hour') ? c.get('hour') : DEFAULT_HOUR,
		minute: c.isCertain('minute') ? c.get('minute') : DEFAULT_MINUTE,
		second: 0,
		millisecond: 0
	}, { zone })

	if (dt <= now && !c.isCertain('day')) dt = dt.plus({ days: 1 })

	return { mode: 'absolute', target: dt }
}

function formatLocal(dt) {
	return dt.toFormat('EEE, LLL d yyyy h:mm a')
}
