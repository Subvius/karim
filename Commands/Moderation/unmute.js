const { MessageEmbed, CommandInteraction } = require("discord.js");

module.exports = {
  name: "unmute",
  description: "Unmute a muted user",
  permission: "MUTE_MEMBERS",
  options: [
    {
      name: "member",
      type: "USER",
      description: "Target member",
      required: true,
    },
    {
      name: "reason",
      description: "What are you unmuting them for?",
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
      member.timeout(null);
      interaction.reply({
        embeds: [
          Embed.setColor("GREEN")
            .setDescription(`${User} has been unmuted \nReason: \`${Reason}\``)
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
