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
    const target = interaction.options.get("target", true)?.member as GuildMember;
    const duration = interaction.options.get("duration", true);
    const reason = interaction.options.get("reason", true);
    const extraInfo = interaction.options.get("extrainfo");

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
        {
            name: "Reason",
            value: `${reason.value} ${extraInfo?.value ?? ""}`,
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
            },
            {
                type: ApplicationCommandOptionType.String,
                description: "Reason for the mute",
                name: "reason",
                required: true,
                choices: [
                    {
                        name: "Breaking Rules",
                        value: "Breaking Server Rules",
                    },
                    {
                        name: "Suspicious Account",
                        value: "Account Deemed Suspicious",
                    },
                    {
                        name: "Schizo Maxxing",
                        value: "Engaging with schizophrenic hallucinations.",
                    }, 
                    {
                        name: "Rage Baiting",
                        value: "Performing rage baiting.",
                    },
                    {
                        name: "Other (specify)",
                        value: "Other -",
                    }, 
                ],
            },
            {
                type: ApplicationCommandOptionType.String,
                description: "Extra info (required for reason, other)",
                name: "extrainfo",
                required: false,
            },
        ],
    },

    execute: execute,
};


export default command
