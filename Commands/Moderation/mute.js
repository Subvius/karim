const {
  Client,
  MessageEmbed,
  WebhookClient,
  CommandInteraction,
} = require("discord.js");
const ms = require("ms");

module.exports = {
  name: "mute",
  description: "Mute a user which prevent them from talking",
  permission: "MUTE_MEMBERS",
  options: [
    {
      name: "member",
      type: "USER",
      description: "Target member",
      required: true,
    },
    {
      name: "time",
      description: "(2m, 6h, 7d)",
      type: "STRING",
      required: true,
    },
    {
      name: "reason",
      description: "What are you muting them for?",
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
    const Time = interaction.options.getString("time");
    const Reason =
      interaction.options.getString("reason") || "No reason provided";

    const Loger = new WebhookClient({
      id: "929398046939283537",
      token:
        "utXkUVrT42EIaeVhu_fFQ0OrSYxb6_ftqKh03dNObyHHGMzH_pJGKv6n3YzNlscR9mfN",
    });
    const LogEmbed = new MessageEmbed();

    const member = interaction.guild.members.cache.get(User.id);
    if (!member)
      return interaction.reply({
        content: `I can't find this user in the guild`,
        ephemeral: true,
      });
    const TimeInMs = ms(Time);
    const Embed = new MessageEmbed();
    if (!TimeInMs || TimeInMs > 604800000 || TimeInMs < 60000)
      return interaction.reply({
        embeds: [
          Embed.setColor("RED").setDescription(
            "Please specify a valid amount of time (1m, 1h, 1d)"
          ),
        ],
        ephemeral: true,
      });

    try {
      await member.timeout(TimeInMs, Reason);
      interaction.reply({
        embeds: [
          Embed.setColor("GREEN")
            .setDescription(
              `${User} has been timed out for ${Time}\n Reason: \`${Reason}\``
            )
            .setAuthor({
              name: User.tag,
              iconURL: User.displayAvatarURL({ dynamic: true, size: 512 }),
            })
            .setFooter({ text: `ID: ${User.id}` }),
        ],
        ephemeral: true,
      });

      Loger.send({
        embeds: [
          LogEmbed.setColor("DARK_RED")
            .setDescription(
              `Member: ${User} | has been **muted**
    Staff: ${interaction.user}
    Duration: \`${Time}\`
    Reason: \`${Reason}\``
            )
            .setAuthor({
              name: "MUTE",
              iconURL: client.user.displayAvatarURL({
                dynamic: true,
                size: 512,
              }),
            }),
        ],
      });
    } catch (e) {
      if (e == "DiscordAPIError: Missing Permissions") {
        return interaction.reply({
          content: `I don't have permissions to do that`,
          ephemeral: true,
        });
      } else {
        interaction.reply(`⛔ | Something went wrong\n${e}`);
      }

      console.log(e);
    }
  },
};
