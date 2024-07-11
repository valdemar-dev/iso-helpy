import { CommandInteraction, Message, PermissionFlagsBits } from "discord.js";
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

        message.author.send(`Please only post *selfies* in the selfie channels!`);
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
                await message.react(e);
            })
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
    });

    if (channel === channels.verifiedSelfies) {
        const userInDb = await Users.findOne({
            where: {
                id: message.author.id,
            },
        });

        if (userInDb) {
            const fields = [
                {
                    name: "Link",
                    value: `${(userInDb as unknown as any).verificationImage}`
                },
            ];

            const embed = makeEmbed("Verification Proof", "This user has been verified as **Not a Catfish!**\nIf you're staff, you can cross reference their verification image via the link below.", fields);

            thread.send({ embeds: [embed] });
        }
    } else {
        const fieldsTwo = [
            {
                name: "Link",
                value: `<#${channels.verificationInstructions}>`,
            },
        ];

        const embedOne = makeEmbed("Catfish Warning!", `This post has **NOT** been Photo Verified! Please be weary of [Catfishes!](https://en.wikipedia.org/wiki/Catfishing)\n\nIs this post suspicious? <@&${roles.staff}> and they'll investigate further.`, []);

        const embedTwo = makeEmbed("Are you the poster?", `You can Photo Verify yourself below! :heart:`, fieldsTwo)

        thread.send({ embeds: [embedOne, embedTwo] });
    }

    return;
};

const messageListener: MessageListener = {
    data: {
        name: "selfies",
        description: "Listens to selfies",
    },

    execute: execute,
};


export default messageListener;
