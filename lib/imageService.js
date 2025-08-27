const OpenAI = require('openai');
const { AttachmentBuilder } = require('discord.js');
const path = require('path');
const { buildNpcImagePrompt } = require(path.join(process.cwd(), 'lib', 'npcImagePrompt.js'));

const IMAGE_MODEL = 'gpt-image-1';

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

async function generateNpcImage(npc) {
  const client = getClient();
  if (!client) {
    return { ok: false, reason: 'NO_KEY' };
  }

  const prompt = buildNpcImagePrompt({
    gender: npc.gender,
    age: npc.age,
    hairText: npc.hairText,
    beard: npc.beard,
    eyesText: npc.eyesText,
    trait: npc.trait
  });

  console.log(prompt);

  try {
    const resp = await client.images.generate({
      model: IMAGE_MODEL,
      prompt,
      quality: 'low',
      size: '1024x1024',
      n: 1
    });

    console.log(resp.usage);

    const first = resp?.data?.[0];
    if (first?.url) {
      return { ok: true, type: 'url', url: first.url, prompt, usage: resp.usage };
    }
    if (first?.b64_json) {
      const buf = Buffer.from(first.b64_json, 'base64');
      const file = new AttachmentBuilder(buf, { name: 'npc.png' });
      return { ok: true, type: 'attachment', file, prompt, usage: resp.usage };
    }
    return { ok: false, reason: 'NO_DATA', prompt };
  } catch (err) {
    console.error('OpenAI image error:', err);
    return { ok: false, reason: 'ERROR', error: err };
  }
}

module.exports = {
  generateNpcImage
};
