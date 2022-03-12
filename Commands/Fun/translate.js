const translate = require(`@iamtraction/google-translate`);
const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "translate",
  description: "translate any word to any languge you want",
  options: [
    {
      name: "language",
      description: "The languge You want to translate to",
      type: "STRING",
      required: true,
    },
    {
      name: "message",
      description: "The message You want to translate",
      type: "STRING",
      required: true,
    },
  ],
  async execute(interaction, args, client) {
    const la = interaction.options.getString(`language`);
    const msg = interaction.options.getString(`message`);

    translate(msg, { to: la })
      .then((res) => {
        var ee = new MessageEmbed()
          .setTitle(`Translate`)
          .setColor(`RANDOM`)
          .setTimestamp()
          .addField(`Before: `, `${msg}`)
          .addField(`After: `, `${res.text}`)
          .addField(`Language: `, `${la} `);
        interaction.reply({ embeds: [ee] });
      })
      .catch((err) => {
        interaction.reply({ content: `${err.message}` });
      });
  },
};
