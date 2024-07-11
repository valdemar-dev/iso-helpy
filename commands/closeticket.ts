
import { Attachment, AttachmentBuilder, ChannelType, CommandInteraction, PermissionFlagsBits } from "discord.js";
import roles from "../utils/roles";
import makeEmbed from "../utils/makeEmbed";

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

    await interaction.channel.delete()

    return;
};

const command: Command = {
    requiredRoles: [
        roles.staff,
    ],

    data: {
        name: "close",
        description: "Close a ticket.",
        defaultMemberPermissions: [],
        options: [],
    },

    execute: execute,
};


export default command;
