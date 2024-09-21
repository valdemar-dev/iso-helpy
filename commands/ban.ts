import { ApplicationCommandOptionType, CommandInteraction, GuildMember, GuildMemberRoleManager, PermissionFlagsBits, User } from "discord.js";
import roles from "../utils/roles";
import makeEmbed from "../utils/makeEmbed";

const execute = async (interaction: CommandInteraction) => {
    await interaction.editReply("Attempting to ban target..");

    const target = interaction.options.get("target", true).member as GuildMember;
    const reason = interaction.options.get("reason", true).value as string;
    const isAppealable = interaction.options.get("appealable", true).value as boolean;

    const userRoles = interaction.member!.roles as GuildMemberRoleManager;
    const targetRoles = target.roles;

    if (!target.bannable || (userRoles.highest < targetRoles.highest)) {
        await interaction.followUp({ 
            content: "Either you, or I, do not have the sufficient permissions to ban this person.", 
            ephemeral: true,
        }); 


        return;
    }

    try {
        const informEmbed = makeEmbed(
            "You have been banned from Isolationism.",
            isAppealable ? "You can appeal this ban here:\nhttps://forms.gle/dRmAsH1Kv6B91NdC9" : "Your ban is not appealable",
            [ { name: "Reason", value: reason,}],
            target.displayAvatarURL({ size: 128, }),
        );

        await target.send({
            embeds: [informEmbed],
        }).catch(() => { return; });


        await target.ban({
           reason: reason,
        });
    } catch(error) {
        const errorEmbed = makeEmbed(
            "Failed to ban target.",
            `${error}`,
            [],
            target.displayAvatarURL({ size: 128, }),
        );

        await interaction.followUp({
            embeds: [errorEmbed],
            ephemeral: true,
        });

        return;
    }

    const successEmbedFields = [
        {
            name: "Reason",
            value: reason
        },

        {
            name: "Is this ban appealable?",
            value: `${isAppealable}`,
        },
    ];

    const successEmbed = makeEmbed(
        `The ban hammer has fallen!`,
        `${target.user.username} was banned.`,
        successEmbedFields,
        target.displayAvatarURL({ size: 128, }),
        "https://media1.tenor.com/m/LR_Ok6iBkU0AAAAC/subscribe-to-my-onlyfans.gif"
    );

    await interaction.followUp({
        embeds: [successEmbed],
    });

    return;
};

const command: Command = {
    requiredRoles: [
        roles.staff,
    ],

    data: {
        name: "ban",
        description: "Ban someone from the server.",
        defaultMemberPermissions: [
            PermissionFlagsBits.BanMembers,
        ],
        options: [
            {
                name: "target",
                description: "Who to ban",
                type: ApplicationCommandOptionType.User,
                required: true,
            },
            {
                name: "reason",
                description: "Why they are being banned",
                type: ApplicationCommandOptionType.String,
                required: true,
                choices: [
                    {
                        name: "Breaking Server Rules",
                        value: "Breaking the Server Rules",
                    },
                    {
                        name: "Sussy or Catfish",
                        value: "Suspicious Account / Suspected Catfish",
                    },
                    {
                        name: "Other",
                        value: "Reason not given / Other reason"
                    },
                ]
            },
            {
                name: "appealable",
                description: "Is this ban appealable",
                type: ApplicationCommandOptionType.Boolean,
                required: true,
            },
        ],
    },

    execute: execute,
};


export default command;
