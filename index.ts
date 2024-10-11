import { Attachment, Client, Collection, GuildMemberRoleManager, IntentsBitField, Message, PartialMessage, Partials, PermissionsBitField } from "discord.js";
import fs from "node:fs";
import makeEmbed from "./utils/makeEmbed";
import { Sequelize } from "sequelize";

import config from "dotenv";
config.config();

const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});

const client = new Client({
    intents: [
        IntentsBitField.Flags.DirectMessages,
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildMessages,
    ],
    partials: [
        Partials.Channel,
        Partials.Message
    ]
});

const commandList = new Collection<string, Command>();
const messageListenerList = new Collection<string, MessageListener>();
const pendingVerificationImages = new Collection<string, Attachment>();
const snipeChannels = new Collection<string, Message<boolean> | PartialMessage>();

const commands = fs.readdirSync("./commands");

for (let i = 0; i < commands.length; ++i) {
    const c = commands[i];

    const file = require(`./commands/${c}`);
    const command: Command = file.default;

    commandList.set(command.data.name, command);
}

const messageListeners = fs.readdirSync("./messageListeners");

for (let i = 0; i < messageListeners.length; ++i) {
    const l = messageListeners[i];

    const file = require(`./messageListeners/${l}`);
    const messageListener: MessageListener = file.default;

    messageListenerList.set(messageListener.data.name, messageListener);
}

client.once("ready", async (client) => {
    console.log(`${client.user.username} logged in.`);
    console.log(`${commandList.size} commands available.`);
    console.log(`${messageListenerList.size} message listeners waiting.`);
    console.log(`Environment: ${process.env.ENVIRONMENT}`);
});

client.on("interactionCreate", async (interaction) => {
    try {
        if (interaction.isChatInputCommand()) {
            await interaction.deferReply({
                ephemeral: true,
            });

            const command = commandList.get(interaction.commandName);

            if (!command) return interaction.editReply("Command not found.");

            const member = interaction.member;

            if (!member) return interaction.editReply("No member in interaction.");

            for (let i = 0; i < command.requiredRoles.length; ++i) {
                const roles = member.roles as GuildMemberRoleManager;
                const requiredRoleId = command.requiredRoles[i];

                const role = roles.cache.get(requiredRoleId)

                if (!role) {
                    const embed = makeEmbed("Missing roles.", `This command requires you to have the role <@&${requiredRoleId}> role, but you are missing it.`, []);

                    return interaction.editReply({ embeds: [embed]}, );
                }
            }

            await command.execute(interaction);
        }
    } catch(e) {
        console.log(e);

        if (interaction.isRepliable()) {
            const embed = makeEmbed("Something went wrong.", `${e}`, []);

            interaction.reply({
                embeds: [embed],
            }).catch((e) => {
                interaction.editReply({
                    embeds: [embed],
                }).catch();
            })
        }
    }
});

client.on("messageCreate", async (message) => {
    if (message!.author!.id === message.client.user.id) return;

    try {
        messageListenerList.forEach(listener => {
            listener.execute(message);
        })
    } catch {
        message.channel.send("Something went wrong.");
    }
});

client.on("messageDelete", async (message) => {
    if (message?.author?.bot) return;

    snipeChannels.set(message.channel.id, message);
});

client.login(process.env.BOT_TOKEN ?? "");

globalThis.client = client;
globalThis.pendingVerificationImages  = pendingVerificationImages;
globalThis.snipeChannels = snipeChannels;
