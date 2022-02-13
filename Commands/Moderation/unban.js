const { Client, MessageEmbed, CommandInteraction } = require("discord.js");
const ms = require("ms");

module.exports = {
  name: "unban",
  description: "Unban a user from the server",
  permission: "BAN_MEMBERS",
  options: [
    {
      name: "member",
      type: "USER",
      description: "Target member (ID)",
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
   * @param {Client} client
   */
  async execute(interaction, client) {
    const User = interaction.options.getUser("member");
    const Reason =
      interaction.options.getString("reason") || "No reason provided";

    const Embed = new MessageEmbed();
    try {
      interaction.guild.bans.fetch().then((bans) => {
        let member = bans.get(User.id);

        if (member == null)
          return interaction.reply({
            content: "Cannot find a ban for the given user.",
            ephemeral: true,
          });

        interaction.guild.members.unban(User, Reason);
        interaction.reply({
          embeds: [
            Embed.setColor("GREEN")
              .setDescription(
                `${User} has been unbanned\n Reason: \`${Reason}\``
              )
              .setAuthor({
                name: User.tag,
                iconURL: User.displayAvatarURL({ dynamic: true, size: 512 }),
              })
              .setFooter({ text: `ID: ${User.id}` }),
          ],
          ephemeral: true,
        });
      });
    } catch (e) {
      interaction.reply(`⛔ | Something went wrong\n${e}`);
      console.log(e);
    }
  },
};
