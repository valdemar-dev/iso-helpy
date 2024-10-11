import { ApplicationCommandOptionType, CommandInteraction, } from "discord.js";
import roles from "../utils/roles";
import { Users, Confessions } from "../utils/dbObjects";
import makeEmbed from "../utils/makeEmbed";

const execute = async (interaction: CommandInteraction) => {
    const confession = await Confessions.findOne({
        where: {
            messageId: interaction.options.get("messageid")?.value,
        }
    });

    if (!confession) {
        await interaction.editReply({
            content: "Confession doesn't exist."
        });

        return;
    }

    await Users.update({
        isConfessionBanned: true,
    }, {
        where: {
            id: (confession as any).authorId,
        }
    });

    const embed = makeEmbed("Confession Banned", `<@!${(confession as any).authorId}> can no longer make confessions.`, []);

    interaction.editReply({
        embeds: [embed],
    });

    return;
};

const command: Command = {
    requiredRoles: [
        roles.staff,
    ],

    data: {
        name: "confessionban",
        description: "Ban someone from using confessions.",
        defaultMemberPermissions: [],
        options: [
            {
                name: "messageid",
                description: "Confession message ID to ban.",
                type: ApplicationCommandOptionType.String,
                max_length: 256,
                min_length: 2,
            },  
        ],
    },

    execute: execute,
};


export default command;
