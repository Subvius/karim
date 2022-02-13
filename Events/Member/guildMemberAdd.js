const {
  MessageEmbed,
  MessageAttachment,
  WebhookClient,
  GuildMember,
} = require("discord.js");

module.exports = {
  name: "guildMemberAdd",
  /**
   *
   * @param {GuildMember} member
   */
  async execute(member) {
    const { user, guild } = member;
    if (member.bot) return;

    const Welcomer = new WebhookClient({
      id: "929392855649230898",
      token:
        "uedHt_Sdjh-JLFP49Xj4tydgOVziYZLk_KUN3KrC5JfenceFACFM3UfM7K_IJ5gWFi8p",
    });

    const Welcome = new MessageEmbed()
      .setColor("AQUA")
      .setAuthor(user.tag, user.avatarURL({ dynamic: true, size: 512 }))
      .setThumbnail(user.avatarURL({ dynamic: true, size: 512 }))
      .setDescription(
        `
        Welcome ${member} to the **${guild.name}**! \n
        Account Created: <t:${parseInt(user.createdTimestamp / 1000)}:R> \n
        Latest Member Count: **${guild.memberCount}**`
      )
      .setFooter(`ID: ${user.id}`);

    Welcomer.send({ embeds: [Welcome] });
  },
};
