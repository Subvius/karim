const { MessageEmbed, Client, CommandInteraction } = require("discord.js");
const { promisify } = require("util");
const { glob } = require("glob");
const PG = promisify(glob);

module.exports = {
  name: "help",
  description: "Get an overview about all commands!",
  permission: "USE_APPLICATION_COMMANDS",
  options: [
    {
      name: "group",
      description: "Help command for a specific group",
      required: false,
      type: "STRING",
      choices: [
        { name: "Information", value: "info" },
        { name: "Moderation", value: "moderation" },
        { name: "Systems", value: "systems" },
        { name: "Utilities", value: "utils" },
      ],
    },
  ],
  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const { options } = interaction;
    const Group = options.getString("group");
    await interaction.deferReply();
    const helpEmbed = new MessageEmbed().setColor("BLURPLE").setAuthor({
      name: client.user.username,
      iconURL: client.user.displayAvatarURL({ dynamic: true, size: 512 }),
    });
    try {
      if (Group) {
        switch (Group) {
          case "info":
            helpEmbed.setTitle("Help - Information");
            (await PG(`${process.cwd()}/Commands/Information/*.js`)).map(
              async (file) => {
                const command = require(file);
                helpEmbed.addField(
                  command.name.charAt(0).toUpperCase() + command.name.slice(1),
                  `>>> ${command.description || "No description provided"}`,
                  true
                );
              }
            );
            interaction.editReply({ embeds: [helpEmbed] });
            break;
          case "moderation":
            helpEmbed.setTitle("Help - Moderation");
            (await PG(`${process.cwd()}/Commands/Moderation/*.js`)).map(
              async (file) => {
                const command = require(file);
                helpEmbed.addField(
                  command.name.charAt(0).toUpperCase() + command.name.slice(1),
                  `>>> ${command.description || "No description provided"}`,
                  true
                );
              }
            );
            interaction.editReply({ embeds: [helpEmbed] });
            break;
          case "systems":
            helpEmbed.setTitle("Help - Systems");
            (await PG(`${process.cwd()}/Commands/Systems/*.js`)).map(
              async (file) => {
                const command = require(file);
                helpEmbed.addField(
                  command.name.charAt(0).toUpperCase() + command.name.slice(1),
                  `>>> ${command.description || "No description provided"}`,
                  true
                );
              }
            );
            interaction.editReply({ embeds: [helpEmbed] });
            break;
          case "utils":
            helpEmbed.setTitle("Help - Utilities");
            (await PG(`${process.cwd()}/Commands/Utilities/*.js`)).map(
              async (file) => {
                const command = require(file);
                helpEmbed.addField(
                  command.name.charAt(0).toUpperCase() + command.name.slice(1),
                  `>>> ${command.description || "No description provided"}`,
                  true
                );
              }
            );
            interaction.editReply({ embeds: [helpEmbed] });
            break;
        }
      } else {
        helpEmbed.setTitle("Help - General");

        /// Info ///
        (await PG(`${process.cwd()}/Commands/Information/*.js`)).map(
          async (file) => {
            const command = require(file);

            helpEmbed.addField(
              command.name.charAt(0).toUpperCase() + command.name.slice(1),
              `>>> ${command.description || "No description provided"}`,
              true
            );
          }
        );

        /// Moderation commands ///
        (await PG(`${process.cwd()}/Commands/Moderation/*.js`)).map(
          async (file) => {
            const command = require(file);

            helpEmbed.addField(
              command.name.charAt(0).toUpperCase() + command.name.slice(1),
              `>>> ${command.description || "No description provided"}`,
              true
            );
          }
        );
        /// Systems ///

        (await PG(`${process.cwd()}/Commands/Systems/*.js`)).map(
          async (file) => {
            const command = require(file);
            helpEmbed.addField(
              command.name.charAt(0).toUpperCase() + command.name.slice(1),
              `>>> ${command.description || "No description provided"}`,
              true
            );
          }
        );
        /// Utils ///
        (await PG(`${process.cwd()}/Commands/Utilities/*.js`)).map(
          async (file) => {
            const command = require(file);
            let desc = String();
            if (command.type == "USER")
              desc = "Right-click on the Guild member to get information";
            helpEmbed.addField(
              command.name.charAt(0).toUpperCase() + command.name.slice(1),
              `>>> ${desc}`,
              true
            );
          }
        );
        /// Other ///
        (await PG(`${process.cwd()}/Commands/Fun/*.js`)).map(async (file) => {
          const command = require(file);
          helpEmbed.addField(
            command.name.charAt(0).toUpperCase() + command.name.slice(1),
            `>>> ${command.description || "No description provided"}`,
            true
          );
        });
        interaction.editReply({ embeds: [helpEmbed] });
      }
    } catch (e) {
      interaction.reply(`⛔ | Something went wrong\n${e}`);
      console.log(e);
    }
  },
};
