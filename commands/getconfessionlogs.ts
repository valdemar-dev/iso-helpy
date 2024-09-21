import { ActionRowBuilder, ApplicationCommandOptionType, AttachmentBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, CommandInteraction, EmbedField, Interaction, PermissionFlagsBits } from "discord.js";
import roles from "../utils/roles";
import { Confessions } from "../utils/dbObjects";
import makeEmbed from "../utils/makeEmbed";
import channels from "../utils/channels";

const execute = async (interaction: CommandInteraction) => {
    await interaction.editReply("Beginning spying..");

    const messageLink = interaction.options.get("messagelink", true);

    const confession = await Confessions.findOne({
        where: {
            messageLink: messageLink.value,
        }
    });

    if (!confession) {
        const failEmbed = makeEmbed(
            "Failed to find confession.",
            "No confession for this message ID was found.",
            [],
        )

        await interaction.followUp({ 
            content: "Failed to get confession from message ID.",
            embeds: [failEmbed], 
        })

        return;
    }

    const allUserConfessions = await Confessions.findAll({
        where: {
            authorId: confession.dataValues.authorId,
        },
    });

    const confessionAmount = allUserConfessions.length;

    const mappedConfessions: Array<Array<EmbedField>> = [];
    let currentConfessionBatch: Array<EmbedField> = [];

    for (let i = 0; i < allUserConfessions.length; i++) {
        const confession = allUserConfessions[i];

        if (currentConfessionBatch.length === 10) {
            mappedConfessions.push([...currentConfessionBatch]);
            currentConfessionBatch = [];
        }

        currentConfessionBatch.push({
            name: `Confession #${i + 1}`,
            value: `${confession.dataValues.messageLink}`,
            inline: false,
        })
    }

    if (currentConfessionBatch.length !== 0) mappedConfessions.push([...currentConfessionBatch])

    let page = 0;

    const target = await interaction.guild!.members.fetch(confession.dataValues.authorId).catch();

    const embed = makeEmbed(
        "Spying Results",
        `Confession spying results for <@${confession.dataValues.authorId}>`,
        [
            {
                name: "Confessions Sent",
                value: `${confessionAmount}`,
            },
        ],
        target && target.displayAvatarURL({ size: 512, })

    );

    const confessionListEmbed = makeEmbed(
        "List of Confessions",
        `Page ${page + 1} / ${mappedConfessions.length}`,
        mappedConfessions[page]
    );

    const prevPageButton = new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page === (mappedConfessions.length / 10) || page === 1)
        .setLabel("Prev")
        .setCustomId("prevButton")

    const nextPageButton = new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page === (mappedConfessions.length / 10))
        .setLabel("Next")
        .setCustomId("nextButton")

    const interactions = new ActionRowBuilder()
        .addComponents(prevPageButton, nextPageButton);

    let messageContent = {
        content: "hello",
        embeds: [embed, confessionListEmbed],
        components: [interactions as any],
    };

    const message = await interaction.channel!.send(messageContent);

    if (!message) return;

    const filter = (interaction: Interaction) => { return interaction.isButton() };

    const collector = message.createMessageComponentCollector({ filter: filter, time: 3_600_000, })

    collector.on("collect", async (interaction: ButtonInteraction) => {
        await interaction.deferUpdate();

        if (interaction.customId === "prevButton") {
            if (page === 0) page = mappedConfessions.length - 1;
            else page -= 1; 

            messageContent.embeds[1].setFields(mappedConfessions[page]);
            messageContent.embeds[1].setDescription(`Page ${page + 1} / ${mappedConfessions.length}`);

            await message.edit(messageContent);
        } else {
            if (page === mappedConfessions.length - 1) page = 0;
            else page += 1;

            messageContent.embeds[1].setFields(mappedConfessions[page]);
            messageContent.embeds[1].setDescription(`Page ${page + 1} / ${mappedConfessions.length}`);

            await message.edit(messageContent);
        } 
        console.log(interaction.customId);
    });
    
    collector.once("end", async () => {
        return;
    });

    return;
};

const command: Command = {
    requiredRoles: [
    ],

    data: {
        name: "getconfessionlogs",
        description: "Get a confessions author.",
        defaultMemberPermissions: [
            PermissionFlagsBits.Administrator
        ],
        options: [
            {
                name: "messagelink",
                description: "The link of the confession you'd like to spy on.",
                type: ApplicationCommandOptionType.String,
                required: true,
            },
        ],
    },

    execute: execute,
};


export default command;
