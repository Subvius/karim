const { MessageEmbed, CommandInteraction } = require("discord.js");
const DB = require("../../Schemas/clientGuildCreateDB");

module.exports = {
  name: "setchannel",
  description: "Set channel to send",
  permission: "MANAGE_CHANNELS",
  options: [
    {
      name: "type",
      description: "What type of channel?",
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
        if (GuildInfo.LevelUpChannel === channel.id)
          return interaction.reply({
            content: "This channel is already level-up channel",
            ephemeral: true,
          });
        await DB.updateOne(
          { GuildID: guild.id },
          { LevelUpChannel: channel.id }
        );
        channel.send({
          embeds: [
            new MessageEmbed()
              .setColor(`BLUE`)
              .setAuthor({
                name: user.username,
                iconURL: user.avatarURL({ size: 512, dynamic: true }),
              })
              .setDescription(
                `✅ This channel is now set to a level-up channel`
              ),
          ],
        });
        interaction.reply({
          content: `${channel} has been set to a level-up channel`,
          ephemeral: true,
        });
        break;
      case "welcome_channel":
        if (GuildInfo.WelcomeChannel === channel.id)
          return interaction.reply({
            content: "This channel is already welcome channel",
            ephemeral: true,
          });
        await DB.updateOne(
          { GuildID: guild.id },
          { WelcomeChannel: channel.id }
        );
        channel.send({
          embeds: [
            new MessageEmbed()
              .setColor(`BLUE`)
              .setAuthor({
                name: user.username,
                iconURL: user.avatarURL({ size: 512, dynamic: true }),
              })
              .setDescription(
                `✅ This channel is now set to a Welcome channel`
              ),
          ],
        });
        interaction.reply({
          content: `${channel} has been set to a welcome channel`,
          ephemeral: true,
        });
        break;
      case "logs_channel":
        if (GuildInfo.LogChannel === channel.id)
          return interaction.reply({
            content: "This channel is already logs channel",
            ephemeral: true,
          });
        await DB.updateOne({ GuildID: guild.id }, { LogChannel: channel.id });
        channel.send({
          embeds: [
            new MessageEmbed()
              .setColor(`BLUE`)
              .setAuthor({
                name: user.username,
                iconURL: user.avatarURL({ size: 512, dynamic: true }),
              })
              .setDescription(
                `✅ This channel is now set to a logging channel`
              ),
          ],
        });
        interaction.reply({
          content: `${channel} has been set to a logging channel channel`,
          ephemeral: true,
        });
        break;
    }
  },
};
