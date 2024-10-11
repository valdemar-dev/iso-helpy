import { CommandInteraction, GuildTextBasedChannel, InteractionWebhook, Message, PermissionFlagsBits } from "discord.js";
import roles from "../utils/roles";
import channels from "../utils/channels";
import { Users } from "../utils/dbObjects";
import makeEmbed from "../utils/makeEmbed";

const execute = async (message: Message) => {
    const channel = message.channel.id;

    const attachmentSize = message.attachments.size;
    
    if (
        channel !== channels.verifiedSelfies &&
        channel !== channels.unverifiedSelfies
    ) return;

    if (attachmentSize < 1) {
        message.delete();

        return;
    }

    const actions = [
        {
            keyword: "rate me",
            emojis: [
                "1️⃣", 
                "2️⃣",
                "3️⃣",
                "4️⃣", 
                "5️⃣", 
                "6️⃣", 
                "7️⃣", 
                "8️⃣", 
                "9️⃣", 
                "🔥", 
            ],
        },
        {
            keyword: "smash or pass",
            emojis: ["✅", "❌",]
        },
    ];

    let hasActionCommensed = false;

    for (let i = 0; i < actions.length; ++i) {
        const action = actions[i];

        if (message.content.includes(action.keyword)) {
            hasActionCommensed = true;

            action.emojis.forEach(async (e) => {
                await message.react(e); })
        }
    }

    if (hasActionCommensed === false) {
        const randomEmojis = [
            "😊", "😍", "😎", "😆", "😁", "🤔", "😢", "🥳", "😇", "🤗",
            "😬", "😲", "🤩", "🥰", "😤", "😭", "😜", "🤪", "😛", "😋",
            "😅", "🤣", "😏", "🙃", "🤤", "🤨", "😞", "😓", "😳", "🥺",
            "👀", "👁️", "👍", "👎", "👏", "🙌", "👐", "🙏", "🧡",
            "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💖", "💗", "💓"
        ];

        const shuffled = randomEmojis.sort(() => 0.5 - Math.random());

        const rand = shuffled.slice(0,3);

        await message.react("❤️");

        rand.forEach(async (e) => {
            await message.react(e);
        })
    }

    const thread = await message.startThread({
        name: "Comments",
        reason: "Selfies need comments!",
    }).catch(async (error) => {
        const errorEmbed = makeEmbed(
            "Failed to create thread.",
            `Failed to create thread for ${message.url}`,
            [],
        );

        const errorTextEmbed = makeEmbed(
            "Full Error",
            `${error}`,
            [],
        );

        const errorChannel = await message.guild!.channels.fetch(channels.errors) as GuildTextBasedChannel;

        errorChannel?.send({ embeds: [errorEmbed, errorTextEmbed, ]});
    });

    if (!thread) return;

    if (channel === channels.verifiedSelfies) {
        const userInDb = await Users.findOne({
            where: {
                id: message.author.id,
            },
        });

        if (userInDb) {
            try {
                const fields = [
                    {
                        name: "Link",
                        value: `${(userInDb as any)?.verificationImage ?? "No link"}`
                    },
                ];

                const embed = makeEmbed(
                    "Verification Proof", 
                    "This user has been verified as **Not a Catfish!**\nIf you're staff, you can cross reference their verification image via the link below.", 
                    fields,
                );

                thread.send({ embeds: [embed] });
            } catch(e) {
                console.log(userInDb);
            }        
        }
    } else {
        const fieldsOne = [
            {
                name: "Link",
                value: `<#${channels.verificationInstructions}>`,
            },
        ];

        const embedTwo = makeEmbed(
            "Be wary of catfishes!", 
            `
                This user hasn't verified themselves, which means they COULD be a catfish.
                If this post is suspicious, please <@&${roles.staff}> and they'll investigate further.
                This is an automated message, and is sent for every user who has not verified themselves.
            `, []);

        const embedOne = makeEmbed(
            "Hey! It looks like you're not verified!", 
            `If you'd like to prove you're not a catfish, and want gain access to the <#${channels.verifiedSelfies}> channel, please photo verify yourself below! **It takes just 5 minutes.** :heart:`, 
            fieldsOne, 
        )

        thread.send({ embeds: [embedOne, embedTwo] });
    }
};

const messageListener: MessageListener = {
    data: {
        name: "selfies",
        description: "Listens to selfies",
    },

    execute: execute,
};


export default messageListener;
