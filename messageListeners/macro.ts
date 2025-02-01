import { CommandInteraction, GuildTextBasedChannel, InteractionWebhook, Message, MessageType, PermissionFlagsBits } from "discord.js";

const execute = async (message: Message) => {
    if (!message.content.startsWith(".")) return;

    const macro = message.content.slice(1);

    let content = "";

    console.log(macro);

    switch (macro) {
        case "welc":
            content = "Welcome! If you're here for matchmaking, check out <#1169598941348773989>!";

            break;
        case "stupid":
            content = "i hate you, you are so fucking stupid, jesus christ learn to (insert thing i am angry at you for not being able to do)" 

            break;

        default: return;
    }

    if (message.type === MessageType.Reply) {
        const ref = await message.fetchReference();

        if (!ref) return;

        ref.reply({
            content: content,
        });

        ref.react("<:garreth_hearts:1273293859086008461>")
        ref.react("<:flower_pink:1328142883378696242>")
    } else {
        message.reply({
            content: content,
        });
    }
};

const messageListener: MessageListener = {
    data: {
        name: "macro",
        description: "Listens to macros.",
    },

    execute: execute,
};


export default messageListener;
