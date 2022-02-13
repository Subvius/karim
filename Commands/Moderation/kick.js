const { Client, MessageEmbed, CommandInteraction } = require("discord.js");
const ms = require("ms");

module.exports = {
  name: "kick",
  description: "Kick a user from the server.",
  permission: "KICK_MEMBERS",
  options: [
    {
      name: "member",
      type: "USER",
      description: "Target member",
      required: true,
    },
    {
      name: "reason",
      description: "What are you kicking them for?",
      type: "STRING",
      required: false,
    },
  ],
  /**
   *
   * @param {CommandInteraction} interaction
   */
  async execute(interaction) {
    try {
      const User = interaction.options.getUser("member");
      const Reason =
        interaction.options.getString("reason") || "No reason provided";

      const member = interaction.guild.members.cache.get(User.id);
      const Embed = new MessageEmbed();
      if (!member)
        return interaction.reply({
          embeds: [
            Embed.setColor("RED").setDescription("Can't find this user!"),
          ],
          ephemeral: true,
        });

      if (member.kickable === false)
        return interaction.reply({
          embeds: [
            Embed.setColor("RED").setDescription(`I can't kick this user`),
          ],
          ephemeral: true,
        });

      member.kick(Reason);
      interaction.reply({
        embeds: [
          Embed.setColor("GREEN")
            .setDescription(`${User} has been kicked \n Reason: \`${Reason}\``)
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
