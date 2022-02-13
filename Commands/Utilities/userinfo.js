const { MessageEmbed, ContextMenuInteraction } = require("discord.js");

module.exports = {
  name: "User info",
  type: "USER",
  permission: "ADMINISTRATOR",
  /**
   *
   * @param {ContextMenuInteraction} interaction
   */
  async execute(interaction) {
    try {
      const target = await interaction.guild.members.fetch(
        interaction.targetId
      );

      const Response = new MessageEmbed()
        .setColor("RANDOM")
        .setAuthor(
          target.user.tag,
          target.user.avatarURL({ dynamic: true, size: 512 })
        )
        .setThumbnail(target.user.avatarURL({ dynamic: true, size: 512 }))
        .addField("ID", `${target.user.id}`, false)
        .addField(
          "Roles",
          `${
            target.roles.cache
              .map((r) => r)
              .join(" ")
              .replace("@everyone", "") || "None"
          }`,
          true
        )
        .addField(
          "Member Since",
          `<t:${parseInt(target.joinedTimestamp / 1000)}:R>`,
          true
        )
        .addField(
          "Discord User Since",
          `<t:${parseInt(target.user.createdTimestamp / 1000)}:R>`,
          true
        );

      interaction.reply({ embeds: [Response], ephemeral: true });
    } catch (e) {
      interaction.reply(`⛔ | Something went wrong\n${e}`);
      console.log(e);
    }
  },
};
