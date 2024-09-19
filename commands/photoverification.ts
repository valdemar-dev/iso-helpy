import { ChannelType, CommandInteraction, Message, PermissionFlagsBits } from "discord.js";
import roles from "../utils/roles";
import makeEmbed from "../utils/makeEmbed";

const execute = async (interaction: CommandInteraction) => {
    await interaction.editReply(`Creating ticket.. Please wait!`);

    const defaultChannelPermissions = [
        {
            id: interaction.guild!.roles.everyone,
            allow: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles], 
            deny: [PermissionFlagsBits.ViewChannel]
        },
        {
            id: interaction.user.id,
            allow: [PermissionFlagsBits.ViewChannel],
        },
    ];

    const channel = await interaction.guild!.channels.create({
        name: `verification-${interaction.user.id}`,
        type: ChannelType.GuildText,
        permissionOverwrites: defaultChannelPermissions,
    });

    await interaction.followUp(`**Your ticket has been created!**\nPlease send your photo verification proof ASAP!\n\nTicket: <#${channel.id}>`);

    const introEmbed = makeEmbed(`Photo Verification`, "Reply to this message with your photo verification proof. Make sure it's following the instructions!", []);

    await channel.send({
        content: `<@!${interaction.user.id}> your ticket has been created!`,
        embeds: [introEmbed],
    });

    const filter = (message: Message) => message.attachments.size > 0;

    const collector = channel.createMessageCollector({ filter, time: 3_600_000, max: 1, });

    collector.on('collect', async (message) => {
        const fields = [
            {
                name: "Valid Proof",
                value: "`/verifyuser`",
            },
            {
                name: "Invalid Proof",
                value: "`/retake`",
            },
        ];

        const embed = makeEmbed("How to Verify", "Please ensure that the provided material is complacent with outlined photo verification guidelines.", fields);

        await channel.permissionOverwrites.set([
            ...defaultChannelPermissions,
            {
                id: roles.staff,
                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.UseApplicationCommands],
            },
            {
                id: interaction.user.id,
                deny: [PermissionFlagsBits.SendMessages],
                allow: [PermissionFlagsBits.ViewChannel],
            }
        ]);

        await message.reply({ 
            content:`<@&${roles.staff}>, please verify the validity of the provided material and proceed accordingly.`,
            embeds: [embed],
        });

        pendingVerificationImages.set(channel.id, message.attachments.first()!);
    });

    collector.on('end', async (collected) => {
        if (collected.size < 1) await channel.delete().catch();
    });

    return;
};

const command: Command = {
    requiredRoles: [],

    data: {
        name: "photoverification",
        description: "Make sure you have your photos ready!",
        defaultMemberPermissions: [],
        options: [],
    },


    execute: execute,
};


export default command;

