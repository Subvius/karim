const {
  MessageEmbed,
  MessageActionRow,
  CommandInteraction,
  MessageButton,
} = require("discord.js");
const DB = require("../../Schemas/TicketSetup");

module.exports = {
  name: "ticketsetup",
  description: "Setup your ticketing message.",
  permission: "ADMINISTRATOR",
  options: [
    {
      name: "channel",
      description: "Select the ticket creation channel",
      required: true,
      type: "CHANNEL",
      channelTypes: ["GUILD_TEXT"],
    },

    {
      name: "category",
      description: "Select the ticket channel's creation category",
      required: true,
      type: "CHANNEL",
      channelTypes: ["GUILD_CATEGORY"],
    },
    {
      name: "transcripts",
      description: "Select the transcripts channel",
      required: true,
      type: "CHANNEL",
      channelTypes: ["GUILD_TEXT"],
    },
    {
      name: "handlers",
      description: "Select the ticket handler's role",
      required: true,
      type: "ROLE",
    },
    {
      name: "everyone",
      description: "Provide the @everyone role",
      required: true,
      type: "ROLE",
    },

    {
      name: "firstbutton",
      description:
        "Give your first button a name and add an emoji by adding a comma followed by the emoji",
      required: true,
      type: "STRING",
    },
    {
      name: "secondbutton",
      description:
        "Give your second button a name and add an emoji by adding a comma followed by the emoji",
      required: true,
      type: "STRING",
    },
    {
      name: "thirdbutton",
      description:
        "Give your third button a name and add an emoji by adding a comma followed by the emoji",
      required: true,
      type: "STRING",
    },
  ],

  /**
   *
   * @param {*} interaction
   */
  async execute(interaction) {
    const { guild, options } = interaction;

    try {
      const Channel = options.getChannel("channel");
      const Category = options.getChannel("category");
      const Transcripts = options.getChannel("transcripts");
      const Handlers = options.getRole("handlers");
      const Everyone = options.getRole("everyone");

      const Button1 = options.getString("firstbutton").split(",");
      const Button2 = options.getString("secondbutton").split(",");
      const Button3 = options.getString("thirdbutton").split(",");

      const Emoji1 = Button1[1];
      const Emoji2 = Button2[1];
      const Emoji3 = Button3[1];

      await DB.findOneAndUpdate(
        { GuildID: guild.id },
        {
          Channel: Channel.id,
          Category: Category.id,
          Transcripts: Transcripts.id,
          Handlers: Handlers.id,
          Everyone: Everyone.id,
          Buttons: [Button1[0], Button2[0], Button3[0]],
        },
        {
          new: true,
          upsert: true,
        }
      );

      const Buttons = new MessageActionRow();
      Buttons.addComponents(
        new MessageButton()
          .setCustomId(Button1[0])
          .setLabel(Button1[0])
          .setStyle("PRIMARY")
          .setEmoji(Emoji1),
        new MessageButton()
          .setCustomId(Button2[0])
          .setLabel(Button2[0])
          .setStyle("SECONDARY")
          .setEmoji(Emoji2),
        new MessageButton()
          .setCustomId(Button3[0])
          .setLabel(Button3[0])
          .setStyle("SUCCESS")
          .setEmoji(Emoji3)
      );

      const Embed = new MessageEmbed()
        .setAuthor({
          name: "🎟️ Create a Ticket!",
          iconURL: guild.iconURL({ dynamic: true }),
        })
        .setDescription(
          `Open  a ticket to discuss any of issues listed on the buttons\n \n ${Emoji1} → ${Button1[0]}\n${Emoji2} → ${Button2[0]}\n${Emoji3} → ${Button3[0]}\n\nPlease be respectful, support will reply to you very soon.\n`
        )
        .setColor("#2f3136");

      await guild.channels.cache
        .get(Channel.id)
        .send({ embeds: [Embed], components: [Buttons] });

      interaction.reply({ content: "Done", ephemeral: true });
    } catch (err) {
      const errEmbed = new MessageEmbed()
      .setColor("RED")
      .setDescription(`⛔ | An error occurred while setting up your ticket.\n **What to make sure of?**
      1.Make sure none of your button's names are duplicated.
      2.Make sure you use this format to your buttons => Name,Emoji.
      3.Make sure your button names do not exceed 200 characters.
      4.Make sure your button emojis, are actually emojis, not ids`);
      console.log(err)
      interaction.reply({ embeds: [errEmbed] });
    }
  },
};
