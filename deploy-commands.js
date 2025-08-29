const { REST, Routes } = require('discord.js');
const { clientId, token } = require('./config.json');
const path = require('node:path');
const { loadCommandsFrom, slashCommandJSON } = require('./commands/util/commandLoader');

const commandsDir = path.join(__dirname, 'commands');
const commandsMap = loadCommandsFrom(commandsDir);
const body = slashCommandJSON(commandsMap);

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log(`Started refreshing ${body.length} application (/) commands.`);
    const data = await rest.put(Routes.applicationCommands(clientId), { body });
    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
})();
