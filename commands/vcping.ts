import { ApplicationCommandOptionType, CommandInteraction, Guild, PermissionFlagsBits, roleMention, User, userMention } from "discord.js";
import roles from "../utils/roles";
import channels from "../utils/channels";
import makeEmbed from "../utils/makeEmbed";

const execute = async (interaction: CommandInteraction) => {
    const guild = interaction.guild as Guild;

    const vcLink = `https://discord.com/channels/${guild.id}/${channels.generalVoice}`
    
    const requester = interaction.options.get("requester", true).user as User;
    const topic = interaction.options.get("topic", true).value as string;

    const embed = makeEmbed(
        "Join the VC!",
        `Join ${vcLink} to call with ${userMention(requester.id)} and others!`,
        [
            {
                name: "Topic",
                value: topic,
            },
        ],
        requester.displayAvatarURL({ size: 128, }),
    );

    await interaction.channel?.send({
        content: `${roleMention(roles.voicePing)} -> ${vcLink}`,
        embeds: [embed],
    });

    return;
};

const command: Command = {
    requiredRoles: [
        roles.staff,
    ],

    data: {
        name: "vcping",
        description: "Ping the VC ping",
        defaultMemberPermissions: [
            PermissionFlagsBits.Administrator
        ],
        options: [
            {
                name: "requester",
                description: "Who is asking for VC ping",
                type: ApplicationCommandOptionType.User,
                required: true,
            },
            {
                name: "topic",
                description: "The topic or activity (if any)",
                type: ApplicationCommandOptionType.String,
                required: true,
            },
        ],
    },

    execute: execute,
};


export default command;
