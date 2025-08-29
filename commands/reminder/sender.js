function asClient(x) { return x?.client ?? x }

exports.sendReminder = async (reminder, clientLike) => {
  const client = asClient(clientLike);
  if (!client) { 
    console.error('no client passed to sendReminder'); 
    return;
  }

  const content = buildContent(reminder);
  try {
    if (reminder.isPrivate) {
      const dmUserId = reminder.targetUserId || reminder.userId;
      try {
        const user = await client.users.fetch(dmUserId);
        await user.send(content.withoutMentions);
      } catch {
        if (reminder.channelId) {
          const ch = await client.channels.fetch(reminder.channelId);
          await ch.send({ content: content.public, allowedMentions: content.allowedMentions });
        }
      }
    } else if (reminder.channelId) {
      const ch = await client.channels.fetch(reminder.channelId);
      await ch.send({ content: content.public, allowedMentions: content.allowedMentions });
    }
    reminder.completed = true;
    await reminder.save();
    console.info(`sent reminder ${reminder.id}`);
  } catch (e) {
    console.error(`failed reminder ${reminder.id}`, e);
  }
}

function buildContent(r) {
  const base = `⏰ ${r.text}`;
  const mention =
    r.mentionEveryone ? '@everyone ' :
    r.targetUserId ? `<@${r.targetUserId}> ` :
    `<@${r.userId}> `;
  const public = `${mention}${base}`;
  const allowedMentions = {};
  if (r.mentionEveryone) {
    allowedMentions.parse = ['everyone'];
  }
  if (r.targetUserId && !r.mentionEveryone) {
    allowedMentions.users = [r.targetUserId];
  }
  if (!r.mentionEveryone && !r.targetUserId) {
    allowedMentions.users = [r.userId];
  }
  return { public, allowedMentions, withoutMentions: base };
}
