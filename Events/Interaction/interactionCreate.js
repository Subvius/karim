const { Client, CommandInteraction, MessageEmbed } = require("discord.js");

module.exports = {
  name: "interactionCreate",
  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    if (interaction.isCommand() || interaction.isContextMenu()) {
      const command = client.commands.get(interaction.commandName);

      if (!command)
        return (
          interaction.reply({
            embeds: [
              new MessageEmbed()
                .setColor("RED")
                .setDescription(
                  "⛔ An error occurred while running the command."
                ),
            ],
          }) && client.commands.delete(interaction.commandName)
        );
      try {
        command.execute(interaction, client);
      } catch (e) {
        console.log(e);
      }
    }
  },
};
