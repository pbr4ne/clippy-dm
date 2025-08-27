const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const path = require('path');
const OpenAI = require('openai');
const config = require(path.join(process.cwd(), 'config.json'));

const {
  pickFirstName,
  pickSurname,
  pickWeightedGender
} = require(path.join(process.cwd(), 'lib', 'nameUtil.js'));

const {
  generateHair,
  formatHair
} = require(path.join(process.cwd(), 'lib', 'hairUtil.js'));

const { generateEyes } = require(path.join(process.cwd(), 'lib', 'eyeUtil.js'));
const { pickTrait, pickBeardTrait } = require(path.join(process.cwd(), 'lib', 'traitUtil.js'));
const { buildNpcImagePrompt } = require(path.join(process.cwd(), 'lib', 'npcImagePrompt.js'));

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickWeightedAge() {
  const bands = [
    { min: 20, max: 24, weight: 6 },
    { min: 25, max: 34, weight: 32 },
    { min: 35, max: 44, weight: 27 },
    { min: 45, max: 54, weight: 18 },
    { min: 55, max: 64, weight: 11 },
    { min: 65, max: 80, weight: 6 }
  ];
  const total = bands.reduce((s, b) => s + b.weight, 0);
  let r = Math.random() * total;
  for (const b of bands) {
    if ((r -= b.weight) <= 0) return randInt(b.min, b.max);
  }
  return randInt(25, 40);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('npc')
    .setDescription('Generate a random NPC.')
    .addBooleanOption(o =>
      o.setName('image')
        .setDescription('Generate an image for NPC.')
        .setRequired(true)
    ),
  async execute(interaction) {
    const wantImage = interaction.options.getBoolean('image') === true;

    const gender = pickWeightedGender();
    const first = pickFirstName(gender);
    const last = pickSurname();
    const age = pickWeightedAge();

    const hair = generateHair(age);
    const hairText = formatHair(hair);

    const eyes = generateEyes();
    const trait = pickTrait();
    const beard = gender === 'man' ? pickBeardTrait() : null;

    const hairFieldValue = gender === 'man'
      ? (beard ? `• ${hairText}\n• ${beard}` : `• ${hairText}`)
      : (beard ? `${hairText}\n${beard}` : hairText);

    const genderEmoji =
      gender === 'man' ? '♂️' :
      gender === 'woman' ? '♀️' :
      (config.emojis?.nonbinary_sign || '⚧️');

    const color =
      gender === 'man' ? 0x226699 :
      gender === 'woman' ? 0xea596e :
      0xf4900c;

    const embed = new EmbedBuilder()
      .setTitle('NPC Generated')
      .setColor(color)
      .addFields(
        { name: 'Name', value: `${first} ${last}`, inline: true },
        { name: 'Gender', value: `${genderEmoji} ${gender}`, inline: true },
        { name: 'Age', value: `${age}`, inline: true },
        { name: 'Eyes', value: eyes.text, inline: true },
        { name: 'Hair', value: hairFieldValue, inline: true },
        { name: 'Trait', value: trait, inline: true }
      )
      .setFooter({ text: `Requested by ${interaction.user.username}` })
      .setTimestamp();

    if (!wantImage) {
      await interaction.reply({ embeds: [embed] });
      return;
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      await interaction.reply({
        content: '⚠️ Image generation failed.',
        embeds: [embed]
      });
      return;
    }

    const openai = new OpenAI({ apiKey });

    const IMAGE_MODEL = 'gpt-image-1';

    try {
      await interaction.deferReply();

      const prompt = buildNpcImagePrompt({
        gender,
        age,
        hairText,
        beard,
        eyesText: eyes.text,
        trait
      });

      const resp = await openai.images.generate({
        model: IMAGE_MODEL,
        prompt,
        quality: 'low',
        size: '1024x1024',
        n: 1
      });

      const first = resp?.data?.[0];
      const imageUrl = first?.url;
      const b64 = first?.b64_json;

      if (imageUrl) {
        embed.setImage(imageUrl);
        await interaction.editReply({ embeds: [embed] });
      } else if (b64) {
        const { AttachmentBuilder } = require('discord.js');
        const png = Buffer.from(b64, 'base64');
        const file = new AttachmentBuilder(png, { name: 'npc.png' });
        embed.setImage('attachment://npc.png');
        await interaction.editReply({ embeds: [embed], files: [file] });
      } else {
        console.error('OpenAI image: unexpected response shape:', JSON.stringify(resp, null, 2));
        throw new Error('No image data returned from Images API');
      }
    } catch (err) {
      console.error('OpenAI image error:', err);
      const reply = interaction.deferred ? interaction.editReply.bind(interaction) : interaction.reply.bind(interaction);
      await reply({
        content: '⚠️ Image generation failed.',
        embeds: [embed]
      });
    }
  },
};
