const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  AttachmentBuilder,
  ComponentType
} = require('discord.js');

const path = require('path');
const OpenAI = require('openai');

const config = require(path.join(process.cwd(), 'config.json'));

const {
  pickFirstName,
  pickSurname,
  pickWeightedGender
} = require(path.join(process.cwd(), 'lib', 'nameUtil.js'));

const { generateHair, formatHair } = require(path.join(process.cwd(), 'lib', 'hairUtil.js'));
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
    .setDescription('Generate a random NPC.'),
  async execute(interaction) {
    const gender = pickWeightedGender();
    const first = pickFirstName(gender);
    const last = pickSurname();
    const age = pickWeightedAge();

    const hair = generateHair(age);
    const hairText = formatHair(hair);

    const eyes = generateEyes();
    const trait = pickTrait();
    const beard = gender === 'man' ? pickBeardTrait() : null;

    const genderEmoji =
      gender === 'man' ? '♂️' :
      gender === 'woman' ? '♀️' :
      (config.emojis?.nonbinary_sign || '⚧️');

    const color =
      gender === 'man' ? 0x226699 :
      gender === 'woman' ? 0xea596e :
      0xf4900c;

    const embed = new EmbedBuilder()
      .setTitle('Generated NPC')
      .setColor(color)
      .addFields(
        { name: 'Name', value: `${first} ${last}`, inline: true },
        { name: 'Gender', value: `${genderEmoji} ${gender}`, inline: true },
        { name: 'Age', value: `${age}`, inline: true },
        { name: 'Eyes', value: eyes.text, inline: true },
        { name: 'Hair', value: hairText, inline: true },
        ...(beard ? [{ name: 'Beard', value: beard, inline: true }] : []),
        { name: 'Trait', value: trait, inline: true }
      )
      .setFooter({ text: `Requested by ${interaction.user.username}` })
      .setTimestamp();

    const nonce = interaction.id;
    const genBtnId = `npc_gen_img_${nonce}`;

    const genRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(genBtnId)
        .setLabel('Generate Image')
        .setStyle(ButtonStyle.Primary)
    );

    const message = await interaction.reply({
      embeds: [embed],
      components: [genRow]
    });

    const filter = (i) => i.user.id === interaction.user.id && i.customId === genBtnId;

    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      filter,
      time: 5 * 60 * 1000
    });

    collector.on('collect', async (i) => {
      const disabledRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(genBtnId)
          .setLabel('Generating…')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(true)
      );
      await i.update({ components: [disabledRow] });

      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        const reenableGen = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(genBtnId)
            .setLabel('Generate Image')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(false)
        );
        await i.followUp({ content: '⚠️ Image generation failed.' });
        return message.edit({ components: [reenableGen] });
      }

      const openai = new OpenAI({ apiKey });
      const IMAGE_MODEL = 'gpt-image-1';

      try {
        const prompt = buildNpcImagePrompt({
          gender,
          age,
          hairText,
          beard,
          eyesText: eyes.text,
          trait
        });

        console.log(prompt);

        const resp = await openai.images.generate({
          model: IMAGE_MODEL,
          prompt,
          quality: 'low',
          size: '1024x1024',
          n: 1
        });

        console.log(resp.usage);

        const firstImg = resp?.data?.[0];
        const imageUrl = firstImg?.url;
        const b64 = firstImg?.b64_json;

        if (imageUrl) {
          embed.setImage(imageUrl);
          await message.edit({ embeds: [embed], components: [] });
        } else if (b64) {
          const png = Buffer.from(b64, 'base64');
          const file = new AttachmentBuilder(png, { name: 'npc.png' });
          embed.setImage('attachment://npc.png');
          await message.edit({ embeds: [embed], files: [file], components: [] });
        } else {
          console.error('OpenAI image: unexpected response shape:', JSON.stringify(resp, null, 2));
          await i.followUp({ content: '⚠️ Image generation failed.' });
          await message.edit({ components: [genRow] });
        }
      } catch (err) {
        console.error('OpenAI image error:', err);
        await i.followUp({ content: '⚠️ Image generation failed.' });
        await message.edit({ components: [genRow] });
      }
    });

    collector.on('end', async () => {
      try {
        await message.edit({ components: [] });
      } catch (_) {}
    });
  }
};
