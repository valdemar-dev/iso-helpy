import { Attachment, EmbedBuilder } from "discord.js";


export default function makeEmbed(
    title: string,
    description: string,
    fields: Array<{
        name: string,
        value: string,
    }>,
    thumbnail?: string | null,
    imageURL?: string | null,
    footer?: string,
) {
    const embed = new EmbedBuilder();

    embed.setTitle(title);
    embed.setDescription(description);
    embed.setFields(fields);
    embed.setColor(8454071)
    embed.setFooter({
        text: footer ? footer : "Fueled by Caffeine",
    });

    embed.setThumbnail(`${thumbnail || client.user?.displayAvatarURL({ size: 128, })}`) 
    embed.setTimestamp();
    embed.setImage(imageURL ?? null);

    return embed;
}
