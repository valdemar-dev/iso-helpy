import { Collection, REST, Routes } from 'discord.js';
import config from "dotenv";
import fs from "node:fs";
import path from "node:path";
import guilds from './guilds';

config.config();

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN ?? "");

try {
    console.log('Started refreshing application (/) commands.');

    rest.put(
        Routes.applicationCommands(process.env.BOT_DISCORD_ID ?? ""), 
        { body: [] }
    ).then(() => {
        console.log(`Tried to clear commands. Environment: ${process.env.ENVIRONMENT}`);
    });
} catch (error) {
    console.error(error);
}
    rest.put(
        Routes.applicationCommands(process.env.BOT_DISCORD_ID ?? ""), 
        { body: [], }
    )
