import { Application, ApplicationCommandOptionType, ChannelType, CommandInteraction, PermissionFlagsBits } from "discord.js";
import roles from "../utils/roles";
import channels from "../utils/channels";
import makeEmbed from "../utils/makeEmbed";

const execute = async (interaction: CommandInteraction) => {
    await interaction.editReply("Sending announcement.");

    const announcementChannel = await interaction.guild!.channels.fetch(channels.announcements);

    if (!announcementChannel || announcementChannel.type !== ChannelType.GuildText) {
        const failEmbed = makeEmbed(
            "Could not send Announcement",
            `${JSON.stringify(announcementChannel)}`,
            [],
        );

        await interaction.editReply({
            content: "The announcement channel was not found.",
            embeds: [failEmbed],
        });

        return;
    }

    const title = interaction.options.get("title", true);
    const message = interaction.options.get("message", true);
    const doPingEveryone = interaction.options.get("pingeveryone", true); 
    const image = interaction.options.get("image", false)?.attachment;

    const embed = makeEmbed(
        title.value as string,
        message.value as string,
        [],
    )

    const announcement = await announcementChannel.send({
        content: doPingEveryone.value as boolean === true ? `|| <@&${roles.common}> ||` : undefined,
        embeds: [embed],
    }).catch(() => {
        interaction.followUp("Failed to send announcement.");
    });

    if (!announcement) return;

    if (image) {
        await announcement.reply({
            files: image && [image],
        });
    }

    await announcement.react("👍").catch(() => {
        interaction.followUp("Failed to react with thumbsup emoji to announcement.")
    });

    return;
};

const command: Command = {
    requiredRoles: [
        roles.staff,
    ],

    data: {
        name: "announce",
        description: "Send an announcement.",
        defaultMemberPermissions: [
            PermissionFlagsBits.Administrator
        ],
        options: [
            {
                name: "title",
                description: "The title of your announcement.",
                type: ApplicationCommandOptionType.String,
                required: true,
            },
            {
                name: "message",
                description: "The message you'd like to announce.",
                type: ApplicationCommandOptionType.String,
                required: true,
            },
            {
                name: "pingeveryone",
                description: "Ping @everyone or the common role?",
                type: ApplicationCommandOptionType.Boolean,
                required: true,
            },
            {
                name: "image",
                description: "An image to attach",
                type: ApplicationCommandOptionType.String,
                required: false,
            },
        ],
    },

    execute: execute,
};


export default command;
