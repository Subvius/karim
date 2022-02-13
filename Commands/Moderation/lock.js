const { CommandInteraction, MessageEmbed } = require("discord.js");
const DB = require("../../Schemas/Lockdown");
const ms = require("ms");

module.exports = {
  name: "lock",
  description: "Lockdown this channel",
  permission: "MANAGE_CHANNELS",
  options: [
    {
      name: "time",
      description: "Expire date for this channel lockdown (2m, 3h, 8d)",
      type: "STRING",
      required: true,
    },
    {
      name: "reason",
      description: "Provide a reason for this lockdown",
      type: "STRING",
      required: false,
    },
  ],
  /**
   *
   * @param {CommandInteraction} interaction
   */
  async execute(interaction) {
    const { guild, channel, options } = interaction;
    const reason = options.getString("reason") || "no reason provided";

    const Embed = new MessageEmbed();

    if (!channel.permissionsFor(guild.id).has("SEND_MESSAGES"))
      return interaction.reply({
        embeds: [
          Embed.setColor("RED").setDescription(
            `⛔ | This channel is already locked`
          ),
        ],
        ephemeral: true,
      });
    try {
      channel.permissionOverwrites.edit(guild.id, {
        SEND_MESSAGES: false,
      });

      interaction.reply({
        embeds: [
          Embed.setColor("RED").setDescription(
            `🔒 | This channel is now under lockdown for: ${reason}`
          ),
        ],
      });
      const Time = options.getString("time");
      if (Time) {
        const ExpiredDate = Date.now() + ms(Time);
        DB.create({
          GuildID: guild.id,
          ChannelID: channel.id,
          Time: ExpiredDate,
        });

        setTimeout(async () => {
          channel.permissionOverwrites.edit(guild.id, {
            SEND_MESSAGES: null,
          });

          interaction
            .editReply({
              embeds: [
                Embed.setColor("GREEN").setDescription(
                  "🔓 | The lockdown has been lifted"
                ),
              ],
            })
            .catch((err) => {});
          await DB.deleteOne({ ChannelID: channel.id });
        }, ms(Time));
      }
    } catch (e) {
      interaction.reply(`⛔ | Something went wrong\n${e}`);
      console.log(e);
    }
  },
};
