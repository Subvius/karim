const { CommandInteraction, MessageEmbed } = require("discord.js");
const DB = require("../../Schemas/Lockdown");

module.exports = {
  name: "unlock",
  description: "Lift a lockdown from a channel",
  permission: "MANAGE_CHANNELS",
  /**
   *
   * @param {CommandInteraction} interaction
   */
  async execute(interaction) {
    const { guild, channel } = interaction;

    const Embed = new MessageEmbed();

    if (!channel.permissionsFor(guild.id).has("SEND_MESSAGES"))
      return interaction.reply({
        embeds: [
          Embed.setColor("RED").setDescription(
            `⛔ | This channel is not locked`
          ),
        ],
        ephemeral: true,
      });

    try {
      channel.permissionOverwrites.edit(guild.id, {
        SEND_MESSAGES: null,
      });

      await DB.deleteOne({ ChannelID: channel.id });

      interaction.reply({
        embeds: [
          Embed.setColor("GREEN").setDescription(
            `🔓 | Lockdown has been lifted`
          ),
        ],
      });
    } catch (e) {
      interaction.reply(`⛔ | Something went wrong\n${e}`);
      console.log(e);
    }
  },
};
