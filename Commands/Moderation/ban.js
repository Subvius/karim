const { Client, MessageEmbed, CommandInteraction } = require("discord.js");
const ms = require("ms");

module.exports = {
  name: "ban",
  description: "Ban a user from the server.",
  permission: "BAN_MEMBERS",
  options: [
    {
      name: "member",
      type: "USER",
      description: "Target member",
      required: true,
    },
    {
      name: "reason",
      description: "What are you banning them for?",
      type: "STRING",
      required: false,
    },
  ],
  /**
   *
   * @param {CommandInteraction} interaction
   */
  async execute(interaction) {
    const User = interaction.options.getUser("member");
    const Reason =
      interaction.options.getString("reason") || "No reason provided";

    const member = interaction.guild.members.cache.get(User.id);
    if (!member)
      return interaction.reply({
        content: `I can't find this user in the guild`,
        ephemeral: true,
      });
    const Embed = new MessageEmbed();
    try {
      if (member.bannable === false)
        return interaction.reply({
          embeds: [
            Embed.setColor("RED").setDescription(`I can't ban this user`),
          ],
          ephemeral: true,
        });
      member.ban({ reason: Reason });
      interaction.reply({
        embeds: [
          Embed.setColor("GREEN")
            .setDescription(`${User} has been banned\n Reason: \`${Reason}\``)
            .setAuthor({
              name: User.tag,
              iconURL: User.displayAvatarURL({ dynamic: true, size: 512 }),
            })
            .setFooter({ text: `ID: ${User.id}` }),
        ],
        ephemeral: true,
      });
    } catch (e) {
      interaction.reply(`⛔ | Something went wrong\n${e}`);
      console.log(e);
    }
  },
};
