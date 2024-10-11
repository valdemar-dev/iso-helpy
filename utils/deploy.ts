import { Collection, REST, Routes } from 'discord.js';
import config from "dotenv";
import fs from "node:fs";
import path from "node:path";
import guilds from './guilds';

config.config();

BigInt.prototype.toJSON = function() { return this.toString() }

const commandList = [];

const commands = fs.readdirSync(path.join(process.cwd(), `/commands`));

for (let i = 0; i < commands.length; ++i) {
    const c = commands[i];

    const file = require(path.join(process.cwd(), `/commands/${c}`));
    const command: Command = file.default;

    commandList.push({
        ...command.data,
        dmPermission: false,
    });
}

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN ?? "");

const guildId = process.env.ENVIRONMENT === "development" ? guilds.development : guilds.production;

try {
    console.log('Started refreshing application (/) commands.');

    rest.put(
        Routes.applicationGuildCommands(process.env.BOT_DISCORD_ID ?? "", guildId), 
        { body: commandList }
    ).then(() => {
        console.log(`Tried to refresh ${commandList.length} commands. Environment: ${process.env.ENVIRONMENT}`);
    });
} catch (error) {
    console.error(error);
}
