const { MessageEmbed, CommandInteraction } = require("discord.js");
const DB = require("../../Schemas/clientGuildCreateDB");

module.exports = {
  name: "removechannel",
  description: "Remove channel",
  permission: "MANAGE_CHANNELS",
  options: [
    {
      name: "type",
      description: "What type of channel to remove?",
      type: "STRING",
      required: true,
      choices: [
        { name: "⬆️ Level Up", value: "level_up" },
        { name: "📄 Logs Channel", value: "logs_channel" },
        { name: "👋 Welcome Channel", value: "welcome_channel" },
      ],
    },
    {
      name: "channel",
      type: "CHANNEL",
      channelTypes: ["GUILD_TEXT"],
      description: "Specify channel",
      required: true,
    },
  ],
  /**
   *
   * @param {CommandInteraction} interaction
   */
  async execute(interaction) {
    const { options, user, guild } = interaction;
    const GuildInfo = await DB.findOne({ GuildID: guild.id });
    const channel = options.getChannel("channel");
    // await interaction.deferReply();
    switch (options.getString("type")) {
      case "level_up":
        if (!GuildInfo.LevelUpChannel)
          return interaction.reply({
            content: "You haven't set up a level-up channel yet",
            ephemeral: true,
          });
        if (GuildInfo.LevelUpChannel !== channel.id)
          return interaction.reply({
            content: "This channel isn't level-up channel",
            ephemeral: true,
          });
        await DB.updateOne({ GuildID: guild.id }, { LevelUpChannel: null });
        interaction.reply({
          content: `${channel} is no longer level-up channel`,
          ephemeral: true,
        });
        break;
      case "welcome_channel":
        if (!GuildInfo.WelcomeChannel)
          return interaction.reply({
            content: "You haven't set up a welcome channel yet",
            ephemeral: true,
          });
        if (GuildInfo.WelcomeChannel !== channel.id)
          return interaction.reply({
            content: "This channel isn't welcome channel",
            ephemeral: true,
          });
        await DB.updateOne({ GuildID: guild.id }, { WelcomeChannel: null });
        interaction.reply({
          content: `${channel} is no longer welcome channel`,
          ephemeral: true,
        });
        break;
      case "logs_channel":
        if (!GuildInfo.LogChannel)
          return interaction.reply({
            content: "You haven't set up a logging channel yet",
            ephemeral: true,
          });
        if (GuildInfo.LogChannel !== channel.id)
          return interaction.reply({
            content: "This channel isn't logging channel",
            ephemeral: true,
          });
        await DB.updateOne({ GuildID: guild.id }, { LogChannel: null });
        interaction.reply({
          content: `${channel} is no longer logging channel`,
          ephemeral: true,
        });
        break;
    }
  },
};
