const { MessageEmbed, CommandInteraction } = require("discord.js");
const scamLinks = require("../../Container/src/scamLinks.json");
var QRCode = require("qrcode");
const fs = require("fs");

module.exports = {
  name: "qrcode",
  description: "Generate a QR code",
  options: [
    {
      name: "text",
      description: "Specify the URL or text ",
      type: "STRING",
      required: true,
    },
  ],
  /**
   *
   * @param {CommandInteraction} interaction
   */
  async execute(interaction) {
    const { options } = interaction;
    const Text = options.getString("text");
    if (scamLinks.some((word) => Text.toLowerCase().includes(word))) {
      return interaction.reply({
        embeds: [
          new MessageEmbed().setColor("RED")
            .setDescription(`You have specified scam link! 
        We do not support such actions and are not responsible for them. You have been warned for trying to create a QR code with a malicious link. 2 more warnings and you will be blocked and will not be able to use the commands of our bot.`),
        ],
        ephemeral: true,
      });
    }
    const fileName = makeFilename(7);
    QRCode.toFile(
      `Assets/QR codes/${fileName}.png`,
      Text,
      {
        color: {
          dark: "#000",
          light: "#FFFF",
        },
      },
      function (err) {
        if (err) throw err;
      }
    );
    await interaction.deferReply();
    await interaction
      .editReply({
        embeds: [
          new MessageEmbed()
            .setColor("DARK_VIVID_PINK")
            .setAuthor({
              name: interaction.member.displayName,
              iconURL: interaction.member.displayAvatarURL({
                size: 512,
                dynamic: true,
              }),
            })
            .setTitle(`Here is your QR code`)
            .setFooter({
              text: `Warning:\nattempts to specify a scam link are punishable`,
            })
            .setImage(`attachment://${fileName}.png`),
        ],
        files: [`Assets/QR codes/${fileName}.png`],
      })
      .then(() => {
        fs.unlinkSync(`${process.cwd()}/Assets/QR codes/${fileName}.png`);
      });
  },
};

function makeFilename(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
