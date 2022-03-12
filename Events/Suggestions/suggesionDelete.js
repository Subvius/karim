const { Client, MessageEmbed, Message } = require("discord.js");
const suggestSetupDB = require("../../Schemas/sugestSetupDB");
const suggestDB = require("../../Schemas/sugestDB");

module.exports = {
  name: "messageDelete",
  disabled: false,
  /**
   * @param {Message} message
   */
  async execute(message, client) {
    const suggestSetup = await suggestSetupDB.findOne({
      GuildID: message.guild.id,
    });
    if (!suggestSetup) return;

    const suggestion = await suggestDB.findOne({
      GuildID: message.guild.id,
      MessageID: message.id,
    });
    if (!suggestion) return;

    return suggestDB.deleteOne({
      GuildID: message.guild.id,
      MessageID: message.id,
    });
  },
};
