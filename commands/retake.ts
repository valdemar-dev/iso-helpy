
import { ApplicationCommandOptionType, ChannelType, CommandInteraction, EmbedField, GuildTextBasedChannel, GuildTextChannelType, makeError, Message, PermissionFlagsBits, User } from "discord.js";
import roles from "../utils/roles";
import makeEmbed from "../utils/makeEmbed";
import channels from "../utils/channels";

const execute = async (interaction: CommandInteraction) => {
    const reason = interaction.options.get("reason", true).value;

    const channel = interaction.channel as GuildTextBasedChannel;

    if (!channel) return;
    if (channel!.type !== ChannelType.GuildText) {
        await interaction.editReply("Must be used in a guild.");

        return;
    }

    const split = channel.name.split("-");

    const name = split[0];
    const userId = split[1];

    if (name !== "verification") {
        const fields = [
            {
                name: "Valid",
                value: "#verification-2350234890234",
            },
            {
                name: "Invalid",
                value: "#staff-cmd || #general",
            },
        ];

        const embed = makeEmbed("Not a verification channel.", "Command must be used in a verification ticket.", fields);

        await interaction.editReply({ embeds: [embed], })

        return;
    }

    pendingVerificationImages.sweep((k, v) => {v === channel.id});

    await interaction.editReply("Asking user to retake proof.");

    const user = await interaction.guild?.members.fetch(userId).catch();

    const badProofEmbedFields: Array<EmbedField> = [
        {
            name: "Your Ticket",
            value: `<#${channel.id}>`,
            inline: false,
        },
        {
            name: "How to Photo Verify",
            value: `<#${channels.verificationInstructions}>`,
            inline: false,
        },
    ];

    const badProofEmbed = makeEmbed(
        "Ticket Info", 
        "Information regarding your ticket.",
        badProofEmbedFields,
        user?.displayAvatarURL({ size: 128, })
    );

    const invalidContent = `## Invalid Proof
        \nYou've been asked to retake your Photo Verification proof, because the image or video you gave didn't meet the criteria.
        \nReason: \`${reason}\``; 

    await channel.send({ content: `<@${user?.id}>\n${invalidContent}`, });

    await user?.send({ 
        content: invalidContent, 
        embeds: [
            badProofEmbed
        ], 
    }).catch();

    await channel.permissionOverwrites.set([
        {
            id: roles.staff,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.UseApplicationCommands],
        },
        {
            id: userId,
            allow: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel, PermissionFlagsBits.AttachFiles,],
        },
        {
            id: interaction.guild!.roles.everyone,
            deny: [PermissionFlagsBits.ViewChannel],
        }
    ]);

    const filter = (message: Message) => message.attachments.size > 0;

    const collector = channel.createMessageCollector({ filter, time: 3_600_000, max: 1, });

    collector.on('collect', async (message) => {
        await message.reply({ 
            content:`<@&${roles.staff}>, the user has recaptured photo verification proof. Please make sure it is compliant with the guidelines, and proceed accordingly.`,
        });

        pendingVerificationImages.set(channel.id, message.attachments.first()!);
    });

    collector.on('end', async (collected) => {
        if (collected.size < 1) await channel.delete().catch(() => {
            return;
        });
    });

    return;
};

const command: Command = {
    requiredRoles: [
        roles.staff,
    ],

    data: {
        name: "retake",
        description: "Ask someone to retake their photo verification.",
        defaultMemberPermissions: [],
        options: [
            {
                name: "reason",
                description: "Why you are asking this person to retake proof.",
                type: ApplicationCommandOptionType.String,
                required: true,
                choices: [
                    {
                        name: "Does not clearly show face",
                        value: "The photo or video does not clearly show the users face."
                    },
                    {
                        name: "Using a filter",
                        value: "The user is using a filter in the photo or video.",
                    },
                    {
                        name: "Illegible Speech or Text",
                        value: "The speech or text of the user is illegible.",
                    },
                    {
                        name: "Incorrect or Missing Date",
                        value: "The user has not written the current date in (DD/MM/YYYY) on paper.",
                    },
                    {
                        name: "Does Not State Server Name",
                        value: "The user does not state the name of the server in speech or on paper.",
                    },
                    {
                        name: "Did Not State Username",
                        value: "The user does not state their unique Discord Username in speech or on paper.",
                    },
                    {
                        name: "Did Not Follow Any Instructions",
                        value: "Did Not Follow Any Instructions.",
                    },
                    {
                        name: "Bot Crash",
                        value: "The bot crashed, so you need to resend the same photo or video.",
                    },
                    {
                        name: "Other / NA",
                        value: "Other / NA",
                    },
                ]
            }
        ],
    },

    execute: execute,
};


export default command;
