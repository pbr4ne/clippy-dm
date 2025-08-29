const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
require('dotenv').config();
const { loadCommandsFrom } = require('./commands/util/commandLoader');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const commandsDir = path.join(__dirname, 'commands');
const loaded = loadCommandsFrom(commandsDir);
client.commands = new Collection();
for (const [name, cmd] of loaded) client.commands.set(name, cmd);

client.once(Events.ClientReady, readyClient => {
  console.log(`${readyClient.user.tag} started`);
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const command = interaction.client.commands.get(interaction.commandName);
  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }
  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
    } else {
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  }
});

client.login(token);