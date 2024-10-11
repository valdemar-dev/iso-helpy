import { Attachment, Client, Collection, CommandInteraction, Message, PartialMessage, PermissionFlagsBits, SlashCommandBooleanOption, SlashCommandNumberOption, SlashCommandOptionsOnlyBuilder, SlashCommandRoleOption, SlashCommandStringOption, SlashCommandUserOption } from "discord.js"

declare global {
    type Command = {
        requiredRoles: Array<string>,
        data: {
            name: string,
            description: string,
            defaultMemberPermissions: Array<BigInt>,
            dmPermission?: boolean,
            options: Array<{
                name: string,
                description: string,
                type: number,
                max_length?: number,
                min_length?: number,
                required?: boolean,

                choices?: Array<{
                    name: string,
                    value: string,
                }>
            }>
        },

        execute: (interaction: CommandInteraction) => Promise<void>
    }

    type MessageListener = {
        data: {
            name: string,
            description: string,
        },

        execute: (message: Message) => Promise<void>
    }

    var client: Client;
    var pendingVerificationImages: Collection<string, Attachment>;
    var snipeChannels: Collection<string, Message<boolean> | PartialMessage>;
}

declare module globalThis {

}

export {}
