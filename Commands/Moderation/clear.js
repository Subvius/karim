const { CommandInteraction, MessageEmbed } = require("discord.js");

module.exports = {
  name: "clear",
  description: "Purge a specific amount of messages from the channel",
  permission: "MANAGE_MESSAGES",
  options: [
    {
      name: "amount",
      description: "Amount of messsages",
      type: "NUMBER",
      required: true,
    },
    {
      name: "target",
      description: "Specific user to purge",
      type: "USER",
      required: false,
    },
  ],
  /**
   *
   * @param {CommandInteraction} interaction
   */
  async execute(interaction) {
    const { channel, options } = interaction;

    const Amount = options.getNumber("amount");
    const Target = options.getMember("target");

    const Messages = await channel.messages.fetch();

    const Response = new MessageEmbed().setColor("LUMINOUS_VIVID_PINK");
    try {
      if (Target) {
        let i = 0;
        const filtered = [];
        (await Messages).filter((m) => {
          if (m.author.id === Target.id && Amount > i) {
            filtered.push(m);
            i++;
          }
        });

        await channel.bulkDelete(filtered, true).then((messages) => {
          Response.setDescription(
            `🧹 Cleared ${messages.size} from ${Target}.`
          );
          interaction.reply({ embeds: [Response] });
        });
      } else {
        await channel.bulkDelete(Amount, true).then((messages) => {
          Response.setDescription(
            `🧹 Cleared ${messages.size} from this channel.`
          );
          interaction.reply({ embeds: [Response] });
        });
      }
    } catch (e) {
      interaction.reply(`⛔ | Something went wrong\n${e}`);
      console.log(e);
    }
  },
};
