import { CommandInteraction, GuildTextBasedChannel, InteractionWebhook, Message, MessageType, PermissionFlagsBits } from "discord.js";

const execute = async (message: Message) => {
    if (message.channel.id !== "1337448601248337981") return;

    if (message.content !== "https://tenor.com/view/boy-when-angry-angry-china-funny-china-china-gif-23479584") message.delete();
};

const messageListener: MessageListener = {
    data: {
        name: "watermelon",
        description: "Listens to watermelon",
    },

    execute: execute,
};


export default messageListener;
