import { ApplicationCommandOptionType, CommandInteraction, GuildMember, GuildMemberRoleManager, PermissionFlagsBits, User } from "discord.js";

import roles from "../utils/roles";
import makeEmbed from "../utils/makeEmbed";

const execute = async (interaction: CommandInteraction) => {
    await interaction.editReply("Attempting to ban target..");

    const target = interaction.options.get("target", true).member as GuildMember;
    const reason = interaction.options.get("reason", true).value as string;

    const userRoles = interaction.member!.roles as GuildMemberRoleManager;
    const targetRoles = target.roles;

    if (!target.bannable || (userRoles.highest.position < targetRoles.highest.position)) {
        await interaction.followUp({ 
            content: "Either you, or I, do not have the sufficient permissions to shadow realm this person.", 
            ephemeral: true,
        }); 

        return;
    }

    try {
        const informEmbed = makeEmbed(
            "You've been sent to the shadow realm!",
            "Shadow realm bans are appealable.",
            [ { name: "Reason", value: reason,}],
            target.displayAvatarURL({ size: 128, }),
        );

        await target.send({
            embeds: [informEmbed],
        }).catch(() => { return; });

        await target.roles.set([
            roles.shadowBan,
        ]);
    } catch(error) {
        const errorEmbed = makeEmbed(
            "Failed to shadow realm target.",
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
    ];

    const successEmbed = makeEmbed(
        `The Jury finds the defendant GUILTY.`,
        `${target.user.username} was sent into the shadow realm.`,
        successEmbedFields,
        target.displayAvatarURL({ size: 128, }),
        "https://media1.tenor.com/m/QLo29HXhR5cAAAAd/shadow-realm-yu-gi-oh.gif"
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
        name: "shadowrealm",
        description: "Send someone to the shadow realm.",
        defaultMemberPermissions: [
            PermissionFlagsBits.BanMembers,
        ],
        options: [
            {
                name: "target",
                description: "Who to send into the shadow realm",
                type: ApplicationCommandOptionType.User,
                required: true,
            },
            {
                name: "reason",
                description: "Why they are being shadow realmed",
                type: ApplicationCommandOptionType.String,
                required: true,
                choices: [
                    {
                        name: "Age",
                        value: "Too young for Isolationism",
                    },
                    {
                        name: "Sussy or Catfish",
                        value: "Suspicious Account / Suspected Catfish",
                    },
                ]
            },
        ],
    },

    execute: execute,
};


export default command;
