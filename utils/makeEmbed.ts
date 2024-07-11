import { EmbedBuilder } from "discord.js";


export default function makeEmbed(
    title: string,
    description: string,
    fields: Array<{
        name: string,
        value: string,
    }>
) {
    const embed = new EmbedBuilder();

    embed.setTitle(title);
    embed.setDescription(description);
    embed.setFields(fields);
    embed.setColor(8454071)
    embed.setFooter({
        text: "Fueled by Caffeine",
    });

    embed.setThumbnail(`${client.user?.displayAvatarURL({ size: 128, })}`) 
    embed.setTimestamp();

    return embed;
}
