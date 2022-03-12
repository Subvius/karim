const { MessageEmbed, Client, CommandInteraction } = require("discord.js");
const GuildDB = require("../../Schemas/clientGuildCreateDB");

module.exports = {
  name: "serverinfo",
  description: "View an information about the server",
  permission: "USE_APPLICATION_COMMANDS",

  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const { guild } = interaction;
    const GuildInfo = await GuildDB.findOne({ GuildID: guild.id });
    let levelUp;
    let welcome;
    let logs;
    if (GuildInfo.LevelUpChannel) levelUp = `<#${GuildInfo.LevelUpChannel}>`;
    if (GuildInfo.LoggingChannel) logs = `<#${GuildInfo.LoggingChannel}>`;
    if (GuildInfo.WelcomeChannel) welcome = `<#${GuildInfo.WelcomeChannel}>`;
    const Embed = new MessageEmbed()
      .setColor("PURPLE")
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .setAuthor({
        name: guild.name,
        iconURL: guild.iconURL({ size: 512, dynamic: true }),
      })

      .addFields(
        {
          name: "General",
          value: [
            `Name: ${guild.name}`,
            `Created: <t:${parseInt(guild.createdTimestamp / 1000)}:R>`,
            `Owner: <@${guild.ownerId}>`,
            `Members: ${guild.memberCount}`,
            `Roles: ${guild.roles.cache.size}`,
            ` `,
            `Description: ${
              guild.description || "This guild has no description"
            }`,
          ].join("\n"),
        },
        {
          name: "📔 | Channels",
          value: [
            `- Text: ${
              guild.channels.cache.filter((c) => c.type === "GUILD_TEXT").size
            }`,
            `- Voice: ${
              guild.channels.cache.filter((c) => c.type === "GUILD_VOICE").size
            }`,
            `- Threads: ${
              guild.channels.cache.filter(
                (c) =>
                  c.type === "GUILD_NEW_THREAD" &&
                  "GUILD_PRIVATE_THREAD" &&
                  "GUILD_PUBLIC_THREAD"
              ).size
            }`,
            `- Category: ${
              guild.channels.cache.filter((c) => c.type === "GUILD_CATEGORY")
                .size
            }`,
            `- Stages: ${
              guild.channels.cache.filter((c) => c.type === "GUILD_STAGE_VOICE")
                .size
            }`,
            `- News: ${
              guild.channels.cache.filter((c) => c.type === "GUILD_NEWS").size
            }`,
            ` `,
            `- Total: ${guild.channels.cache.size}`,
          ].join("\n"),
        },
        {
          name: "🥳 | Emojis & Stickers",
          value: [
            `- Animated: ${guild.emojis.cache.filter((e) => e.animated).size}`,
            `- Static: ${guild.emojis.cache.filter((e) => !e.animated).size}`,
            `- Stickers: ${guild.stickers.cache.size}`,
            ` `,
            `Total: ${guild.stickers.cache.size + guild.emojis.cache.size}`,
          ].join("\n"),
        },
        {
          name: "<:Boost:926958474670243910> | Nitro statistics",
          value: [
            `- Tier: ${guild.premiumTier.replace("TIER_", "")}`,
            `- Boosts: ${guild.premiumSubscriptionCount}`,
            `- Boosters: ${
              guild.members.cache.filter((m) => m.premiumSince).size
            }`,
          ].join("\n"),
        },
        {
          name: ":dividers: | Other information",
          value: [
            `- Level-up channel: ${levelUp || "None"}`,
            `- Welcome channel: ${welcome || "None"}`,
            `- Logging channel: ${logs || "None"}`,
          ].join("\n"),
        }
      );
    interaction.reply({ embeds: [Embed] });
  },
};
