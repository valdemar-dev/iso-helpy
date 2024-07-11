import { CommandInteraction, PermissionFlagsBits } from "discord.js";
import roles from "../utils/roles";

const execute = async (interaction: CommandInteraction) => {
    await interaction.editReply("Pong!");

    return;
};

const command: Command = {
    requiredRoles: [
        roles.staff,
    ],

    data: {
        name: "ping",
        description: "Replies with pong!",
        defaultMemberPermissions: [
            PermissionFlagsBits.Administrator
        ],
        options: [],
    },

    execute: execute,
};


export default command;
