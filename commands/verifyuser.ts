import { Attachment, AttachmentBuilder, ChannelType, CommandInteraction, makeError, PermissionFlagsBits, User } from "discord.js";
import roles from "../utils/roles";
import makeEmbed from "../utils/makeEmbed";
import channels from "../utils/channels";
import { Users } from "../utils/dbObjects";

const execute = async (interaction: CommandInteraction) => {
    if (interaction.channel?.type !== ChannelType.GuildText) {
        await interaction.editReply("Must be used in a guild.");

        return;
    }

    const split = interaction.channel!.name.split("-");

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

    try {
        const user = await interaction.guild!.members.fetch(userId);

        await user.roles.add(roles.verified);

        const verifiedImagesChannel = await interaction.guild!.channels.fetch(channels.verifiedImages);

        if (!verifiedImagesChannel) throw new Error("Verified images channel doesn't exist.")
        if (verifiedImagesChannel.type !== ChannelType.GuildText) throw new Error("Verified images channel isn't a text channel.");

        const pending = pendingVerificationImages.get(interaction.channel.id);

        if (!pending) throw new Error("User has not sent photo verification."); 

        const message = await verifiedImagesChannel.send({
            content: `<@!${userId}> | ${userId}`,
            files: [`${pending?.url}`],  
        });

        await interaction.editReply(`Photo verified ${userId}. They will automatically be contacted.`)

        const approvalEmbed = makeEmbed(
            "You've been photo verified!", 
            `Your Photo verification for https://discord.gg/isolationism has been accepted.\n 
            You can now post messages in the <#${channels.verifiedSelfies}> channel!\n 
            Please do not send selfies in the <#${channels.unverifiedSelfies}> channel anymore.`, 
            []
        );

        await user.send({ embeds: [approvalEmbed], }).catch();
        await interaction.channel.send({ embeds: [approvalEmbed], }).catch();

        const userInDb = await Users.findOne({
            where: {
                id: userId,
            },
        });

        if (userInDb) {
            await Users.update({
                verificationImage: `${message.url}`,
                isConfessionBanned: false,
            }, {
                where: {
                    id: userId,
                }
            });

            return
        }

        await Users.create({
            id: userId,
            verificationImage: `${message.url}`,
            isConfessionBanned: false,
        });

        setTimeout(async () => {
            await interaction.channel?.delete().catch();
        }, 10000);
    } catch (e: any) {
        const embed = makeEmbed("Failed to give role.", `${e.message}`, []);

        await interaction.editReply({ embeds: [embed], });
    }
};

const command: Command = {
    requiredRoles: [
        roles.staff,
    ],

    data: {
        name: "verifyuser",
        description: "Photo verify a user!",
        defaultMemberPermissions: [],
        options: [],
    },

    execute: execute,
};


export default command;
