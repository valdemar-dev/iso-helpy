import { AllowedMentionsTypes, ChannelType, Message, PermissionFlagsBits, userMention, } from "discord.js";
import channels from "../utils/channels";
import { Confessions, Users } from "../utils/dbObjects";
import makeEmbed from "../utils/makeEmbed";
import roles from "../utils/roles";

const execute = async (message: Message) => {
    if (!message.guild) return;

    if (message.channel.id !== channels.support) return;

    const defaultChannelPermissions = [
        {
            id: message.guild.roles.everyone,
            allow: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles], 
            deny: [PermissionFlagsBits.ViewChannel]
        },
        {
            id: roles.staff,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.UseApplicationCommands],
        },
        {
            id: message.author.id,
            allow: [PermissionFlagsBits.ViewChannel],
        },
    ];

    const channel = await message.guild.channels.create({
        name: `support-${message.author.id}`,
        type: ChannelType.GuildText,
        permissionOverwrites: defaultChannelPermissions,
    });

    const supportEmbed = makeEmbed(
        "Your Ticket is Here!",
        "Please describe your issue in detail, and provide any relevant images / videos",
        [],
        message.author.displayAvatarURL({ size: 128, })
    );

    await channel.send({
        content: userMention(message.author.id),
        embeds: [supportEmbed],
    })

    await message.reply(`**We can help you!**\nYour ticket has been created, and is available below!\n\nTicket: <#${channel.id}>`);

    return;
};

const messageListener: MessageListener = {
    data: {
        name: "confessions",
        description: "Listens to confessions.",
    },

    execute: execute,
};

export default messageListener;
