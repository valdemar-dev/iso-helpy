import { ApplicationCommandOptionType, ApplicationCommandType, CommandInteraction, GuildTextBasedChannel, GuildTextChannelType, PermissionFlagsBits } from "discord.js";
import roles from "../utils/roles";
import makeEmbed from "../utils/makeEmbed";

const execute = async (interaction: CommandInteraction) => {
    await interaction.editReply("Nuke sent.");

    const amount = interaction.options.get("amount", true);
    const channel = interaction.options.get("channel", true).channel as GuildTextBasedChannel;

    const preparingNukeEmbed = makeEmbed(
        "Preparing Nuke..",
        `The nuke has been dropped on this channel!
        ${amount.value} of messages will be nuked in 3...`,
        []
    );

    await channel?.send({ embeds: [preparingNukeEmbed], })

    setTimeout(async () => {
        await channel?.send("2...");
    }, 1000);

    setTimeout(async () => {
        await channel?.send("1...");
    }, 2000);

    setTimeout(async () => {
        await channel?.send("Dropping Little Boy.")
    }, 3000)

    setTimeout(async () => {
        await channel.bulkDelete(Math.max((amount.value as number + 4), 100)).catch(() => {
            interaction.followUp("The nuke malfunctioned! (failed to delete messages, likely due to age.)")
        });
    }, 5000)

    return;
};

const command: Command = {
    requiredRoles: [
        roles.staff,
    ],

    data: {
        name: "nuke",
        description: "Nukes a channel",
        defaultMemberPermissions: [
            PermissionFlagsBits.Administrator
        ],
        options: [
            {
                name: "amount",
                description: "How many message to nuke.",
                type: ApplicationCommandOptionType.Number, 
                min_length: 1,
                max_length: 100,
                required: true,
            },
            {
                name: "channel",
                description: "Which channel to nuke.",
                type: ApplicationCommandOptionType.Channel,
                required: true,
            }
        ],
    },

    execute: execute,
};


export default command;
