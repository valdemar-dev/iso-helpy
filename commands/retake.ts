
import { ChannelType, CommandInteraction, EmbedField, GuildTextBasedChannel, GuildTextChannelType, makeError, Message, PermissionFlagsBits, User } from "discord.js";
import roles from "../utils/roles";
import makeEmbed from "../utils/makeEmbed";
import channels from "../utils/channels";

const execute = async (interaction: CommandInteraction) => {
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

    const badProofEmbed = makeEmbed("Invalid Proof!", `The Photo Verification proof you gave is not sufficient.`, badProofEmbedFields);

    await channel.send({ embeds: [badProofEmbed], });
    await user?.send({ 
        content: 
            "## Hey, something urgent needs your attention!\nYour Photo Verification ticket is pending, because the proof you gave was not sufficient.", 
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
        options: [],
    },

    execute: execute,
};


export default command;
