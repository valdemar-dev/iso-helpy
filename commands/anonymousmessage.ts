import { ApplicationCommandOptionType, CommandInteraction, PermissionFlagsBits } from "discord.js";
import roles from "../utils/roles";
import { Confessions, Users } from "../utils/dbObjects";
import makeEmbed from "../utils/makeEmbed";

const execute = async (interaction: CommandInteraction) => {
    await interaction.editReply("Sending confession..");
    const message = interaction.options.get("message", true).value as string;
    
    const userInDb = await Users.findOne({
        where: {
            id: interaction.user.id,
        },
    });

    if (!userInDb) {
        await interaction.followUp({
            content: 
            `Looks like this is the first time you're sending an anonymous message!
            \nNo one can see who you are, but you can still be banned bassed on the Message ID of your anonymous message!`,
            ephemeral: true,
        });

        await Users.create({
            id: interaction.user.id,
            verificationImage: "",
            isConfessionBanned: false,
        });
    } else if (userInDb && userInDb.dataValues.isConfessionBanned) {
        const embed = makeEmbed("Failed to send anonymous message.", "You naughty thing! You've been confession banned. You can no longer send confessions or anonymous messages.", []);
        
        await interaction.followUp({
            embeds: [embed],
            ephemeral: true,
        });

        return;
    }

    const embed = makeEmbed(
        "Anonymous Says", 
        `${message}`, 
        [],
        `https://cdn.discordapp.com/embed/avatars/${Math.floor(Math.random() * 6)}.png`,
        null,
        "Sent via: /anonymousmessage"
    );

    const sentMessage = await interaction.channel?.send({
        embeds: [embed],
    });

    if (!sentMessage) {
        return;
    }

    await Confessions.create({
        messageLink: sentMessage.url,
        authorId: interaction.user.id,
    });

    return;
};

const command: Command = {
    requiredRoles: [
    ],

    data: {
        name: "anonymousmessage",
        description: "Send a completely anonymous message into this chat.",
        defaultMemberPermissions: [
        ],
        options: [
            {
                name: "message",
                description: "The message you want to send.",
                type: ApplicationCommandOptionType.String,
                required: true,
            },
        ],
    },

    execute: execute,
};


export default command;
