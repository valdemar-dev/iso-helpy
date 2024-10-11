
import { ApplicationCommandOptionType, CommandInteraction, } from "discord.js";
import roles from "../utils/roles";
import { Confessions, Users } from "../utils/dbObjects";
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
        isConfessionBanned: false,
    }, {
        where: {
            id: (confession as any).authorId,
        }
    });

    const embed = makeEmbed("Confession Unbanned", `<@!${(confession as any).authorId}> can now make confessions.`, []);

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
        name: "confessionunban",
        description: "Allow someone to use confessions again.",
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
