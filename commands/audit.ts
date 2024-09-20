import { ApplicationCommandOptionType, channelMention, ChannelType, CommandInteraction, PermissionFlagsBits, User, userMention } from "discord.js";
import roles from "../utils/roles";
import makeEmbed from "../utils/makeEmbed";

const execute = async (interaction: CommandInteraction) => {
    const target = interaction.options.get("target", true)?.user as User;
    const auditReason = interaction.options.get("reason", true).value as string;

    const defaultChannelPermissions = [
        {
            id: interaction.guild!.roles.everyone,
            allow: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles], 
            deny: [PermissionFlagsBits.ViewChannel]
        },
        {
            id: target!.id,
            allow: [PermissionFlagsBits.ViewChannel],
        },
        {
            id: roles.staff,
            allow: [PermissionFlagsBits.ViewChannel],
        },
    ];

    const channel = await interaction.guild!.channels.create({
        name: `audit-${interaction.user.id}`,
        type: ChannelType.GuildText,
        permissionOverwrites: defaultChannelPermissions,
    });

    const auditEmbedFields = [
        {
            name: "Reason for Audit",
            value: `${auditReason}`,
        }
    ];

    const auditEmbed = makeEmbed(
        `Audit`,
        `This audit is regarding ${userMention(target.id)}.`,
        auditEmbedFields
    );

    const instructionsEmbed = makeEmbed(
        "You are being Audited in https://discord.gg/isolationism",
        `Please follow any instructions given to you by Staff.\nHere is the link to your ticket: ${channelMention(channel.id)}\n\n**Note:** failure to attend to your ticket in a timely manner will most likely result in your banning.`,
        auditEmbedFields,
        target?.displayAvatarURL({ size: 128, }),
    );

    await channel.send({
        content: "Audit created.",
        embeds: [auditEmbed],
    });

    await target?.send({
        embeds: [instructionsEmbed],
    });

    await interaction.editReply(`Audit channel: <#${channel.id}>`);

    return;
};

const command: Command = {
    requiredRoles: [
        roles.staff,
    ],

    data: {
        name: "audit",
        description: "Audit a suspicious users DMs",
        defaultMemberPermissions: [],
        options: [
            {
                name: "target",
                description: "The person to audit.",
                type: ApplicationCommandOptionType.User,
                required: true,
            },
            {
                name: "reason",
                description: "Why you are auditting this person.",
                type: ApplicationCommandOptionType.String,
                required: true,
                choices: [
                    {
                        name: "DM Activity",
                        value: "Suspicious DM Activity",
                    },
                    {
                        name: "Other N/A",
                        value: "Other N/A",
                    },
                ]
            }
        ],
    },

    execute: execute,
};


export default command;
