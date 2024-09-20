import { ApplicationCommandOptionType, CommandInteraction, PermissionFlagsBits } from "discord.js";
import roles from "../utils/roles";
import makeEmbed from "../utils/makeEmbed";

const execute = async (interaction: CommandInteraction) => {
    const doEphemeralReply = interaction.options.get("quiet", true).value;
    
    await interaction.editReply("Activating Precision Rifle..");

    const snipe = snipeChannels.get(interaction!.channel!.id) 

    if (!snipe) {
        await interaction.editReply("The bullet missed its target. (no snipe found)");

        return;
    }

    const snipeEmbed = makeEmbed(
        "Sniped!",
        `<@!${snipe.author?.id}>'s deleted message was sniped!`,
        [
            {
                name: "Originally Sent At",
                value: `${snipe.createdAt.toLocaleTimeString()}`
            },
            {
                name: "Thread (if any)",
                value: `<#${snipe.thread?.id}>`
            },
        ],
        snipe.author?.displayAvatarURL({ size: 128, }),
    );

    const attachments = snipe.attachments;

    const mappedAttachments = attachments.map((attachment) => attachment);

    await interaction.followUp({
        content: snipe.cleanContent ?? undefined,
        embeds: [snipeEmbed],
        files: [...mappedAttachments],
        ephemeral: doEphemeralReply as boolean,
    });



    return;
};

const command: Command = {
    requiredRoles: [
        roles.staff,
    ],

    data: {
        name: "snipe",
        description: "Get the latest deleted message in a channel.",
        defaultMemberPermissions: [
        ],
        options: [
            {
                name: "quiet",
                description: "Whether or not to share the result with others.",
                type: ApplicationCommandOptionType.Boolean,
                required: true,
            }
        ],
    },

    execute: execute,
};


export default command;
