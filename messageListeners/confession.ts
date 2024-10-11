
import { ChannelType, Message, } from "discord.js";
import channels from "../utils/channels";
import { Confessions, Users } from "../utils/dbObjects";
import makeEmbed from "../utils/makeEmbed";

const execute = async (message: Message) => {
    if (message.guild) return;

    if (message.content.startsWith("confess: ")) {
        message.reply("You no longer need to type confess: at the start of your message to confess. Just type any messsage, and it'll be turned into a confession.");

        return;
    }

    const cleanContent = message.cleanContent;

    const confessionChannel = await message.client.channels.fetch(channels.confessions);

    if (!confessionChannel) {
        await message.reply({
            content: "Confession channel not found.",             
        });

        return;
    }

    if (confessionChannel.type !== ChannelType.GuildText) {
        await message.reply({
            content: "Confession channel is not a text channel.",
        });

        return;
    }

    const userInDb = await Users.findOne({
        where: {
            id: message.author.id,
        },
    });

    if (!userInDb) {
        await Users.create({
            id: message.author.id,
            verificationImage: "",
            isConfessionBanned: false,
        });
    } else if (userInDb && (userInDb as any).isConfessionBanned) {
        const embed = makeEmbed("Failed to confess.", "You naughty thing! You've been confession banned. You can no longer send confessions.", []);
        
        await message.reply({
            embeds: [embed],
        });

        return;
    }

    const embed = makeEmbed("Confession", `${cleanContent}`, []);

    const sentMessage = await confessionChannel.send({
        embeds: [embed],
    });

    await Confessions.create({
        messageLink: sentMessage.url,
        authorId: message.author.id,
    });

    await message.reply({
        content: "Confession sent.",             
    });

    return;
};

const messageListener: MessageListener = {
    data: {
        name: "confessions",
        description: "Listens to confessions.",
    },

    execute: execute,
};

export default messageListener;
