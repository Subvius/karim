const { Client, MessageEmbed, CommandInteraction } = require("discord.js");
const { connection } = require("mongoose");
require("../../Events/Client/ready");

module.exports = {
  name: "status",
  description: "Displays the status of the client and database connection",
  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    try {
      const Response = new MessageEmbed().setColor("AQUA")
        .setDescription(`**Client**: \`🟢 ONLINE\` - \`${
        client.ws.ping
      }ms\`\n **Uptime**: <t:${parseInt(client.readyTimestamp / 1000)}:R> \n
        **Database**: \`${switchTo(connection.readyState)}\``);

      interaction.reply({ embeds: [Response] });
    } catch (e) {
      interaction.reply(`⛔ | Something went wrong\n${e}`);
      console.log(e);
    }
  },
};

function switchTo(val) {
  var status = " ";
  switch (val) {
    case 0:
      status = `🔴 DISCONNECTED`;
      break;
    case 1:
      status = `🟢 CONNECTED`;
      break;
    case 2:
      status = `🟠 CONNECTING`;
      break;
    case 3:
      status = `🟡 DISCONNECTING`;
      break;
  }

  return status;
}
