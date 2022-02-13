const {
  Client,
  MessageEmbed,
  CommandInteraction,
  MessageActionRow,
  MessageButton,
} = require("discord.js");
const { execute } = require("../Moderation/lock");
const { PERMANENTLINK, BOTINVITE } = require("../../config.json");

module.exports = {
  name: "invite",
  description: "Invite Lunar",
  permission: "USE_APPLICATION_COMMANDS",

  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    try {
      const Embed = new MessageEmbed()
        .setColor("PURPLE")
        .setTitle(`Lunar`)
        .setDescription(
          `Click the link above to invite the bot to your discord server.\n
        \`•\` [Invite Bot](${BOTINVITE})
        \`•\` [Discord](${PERMANENTLINK})\n
        `
        )
        .setThumbnail(client.user.avatarURL({ dynamic: true, size: 512 }))
        .setURL(BOTINVITE);

      const Buttons = new MessageActionRow();
      Buttons.addComponents(
        new MessageButton()
          .setLabel("Invite me!")
          .setStyle("LINK")
          .setURL(BOTINVITE)
      );

      interaction.reply({ embeds: [Embed], components: [Buttons] });
    } catch (e) {
      interaction.reply(`⛔ | Something went wrong\n${e}`);
      console.log(e);
    }
  },
};
