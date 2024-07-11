import { ApplicationCommandOptionType, CommandInteraction, GuildMember, PermissionFlagsBits } from "discord.js";
import roles from "../utils/roles";
import makeEmbed from "../utils/makeEmbed";

const choices = [
    { name: "1 Minute", value: "60" },
    { name: "10 Minutes", value: "600" },
    { name: "30 Minutes", value: "1200" },
    { name: "1 Hour", value: "3600" },
    { name: "8 Hours", value: "28800" },
    { name: "1 Day", value: "86400" },
    { name: "5 Days", value: "432000" },
    { name: "1 Week", value: "604800" },
    { name: "1 Month", value: "2419200" },
];

const execute = async (interaction: CommandInteraction) => {
    const target = interaction.options.get("target")?.member as GuildMember;
    const duration = interaction.options.get("duration");

    if (!target || !duration) {
        const embed = makeEmbed("Failed to mute.", "No target or duration provided.", []);

        interaction.editReply({
            embeds: [embed],
        });

        return;
    }

    if (!interaction.channel) {
        interaction.editReply("Can only be used in a channel.");

        return;
    }

    await (target as GuildMember).timeout(parseInt(`${duration.value}`) * 1000);

    const fields = [
        {
            name: "Duration",
            value: `${choices.find(c => c.value === duration.value)?.name}`,
        },
    ];

    const embed = makeEmbed(`Target Muted`, `<@!${target.user.id}> was muted.`, fields)

    await interaction.editReply("Target muted.");

    await interaction.channel.send({
        embeds: [embed],
    })

    return;
};

const command: Command = {
    requiredRoles: [
        roles.staff,
    ],

    data: {
        name: "mute",
        description: "Mute someone.",
        defaultMemberPermissions: [
            PermissionFlagsBits.Administrator
        ],
        options: [
            {
                type: ApplicationCommandOptionType.String,
                description: "How long to mute the person for.",
                required: true,
                name: "duration",
                choices: choices,
            },
            {
                type: ApplicationCommandOptionType.Mentionable,
                description: "Person to mute",
                required: true,
                name: "target",
            }
        ],
    },

    execute: execute,
};


export default command
