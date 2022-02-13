const { MessageEmbed, CommandInteraction, Client } = require("discord.js");
const Schema = require("../../Schemas/FilterDB");
const sourcebin = require("sourcebin");

module.exports = {
  name: "filter",
  description: "A chat filtering system",
  permission: "MANAGE_MESSAGES",
  options: [
    {
      name: "help",
      description: "Help command for your filtering system",
      type: "SUB_COMMAND",
    },
    {
      name: "clear",
      description: "Clear your blacklist",
      type: "SUB_COMMAND",
    },
    {
      name: "list",
      description: "List your blacklist",
      type: "SUB_COMMAND",
    },
    {
      name: "settings",
      description: "Setup your filtering system",
      type: "SUB_COMMAND",
      options: [
        {
          name: "logging",
          description: "Select a logging channel",
          type: "CHANNEL",
          channelTypes: ["GUILD_TEXT"],
          required: true,
        },
      ],
    },
    {
      name: "configure",
      description: "Add or remove words from the blacklist",
      type: "SUB_COMMAND",
      options: [
        {
          name: "options",
          description: "Select an option",
          required: true,
          type: "STRING",
          choices: [
            { name: "Add", value: "add" },
            { name: "Remove", value: "remove" },
          ],
        },
        {
          name: "word",
          description:
            "Provide the word, add multiple words by placeing a comma in between (Badword,Badword2,...)",
          type: "STRING",
          required: true,
        },
      ],
    },
  ],
  /**
   *
   * @param {CommandInteration} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const { guild, options } = interaction;
    await interaction.deferReply();
    const subCommand = options.getSubcommand();

    switch (subCommand) {
      case "help":
        const Embed = new MessageEmbed()
          .setColor("BLURPLE")
          .setDescription(
            [
              `**How do i add or remove a word from the blacklist?**\nBy using /filter [configure] [Add/Remove] [word]\n`,
              `**How do i clear the blacklist?**\nBy using /filter [clear]\n`,
              `**How do I set up a logging channel?**\nBy using /filter [settings] [#channel]\n`,
              `**How do I get a blacklist?**\nBy using /filter [list]\n`,
            ].join("\n")
          );

        interaction.editReply({ embeds: [Embed] });
        break;
      case "list":
        const Data = await Schema.findOne({ Guild: guild.id });
        if (!Data)
          return interaction.editReply({
            content: "There is no data to list",
            ephemeral: true,
          });

        await sourcebin
          .create(
            [
              {
                content: `Blacklisted words:\n${
                  Data.Words.map((w) => w).join("\n") || "none"
                }`,
                language: "text",
              },
            ],
            {
              title: `${guild.name} | Blacklist.`,
              description: `List of the blacklisted words in ${guild.name}`,
            }
          )
          .then((bin) => {
            interaction.editReply({ content: bin.url });
          });
        break;
      case "clear":
        await Schema.findOneAndUpdate({ Guild: guild.id }, { Words: [] });
        client.filters.set(guild.id, []);
        interaction.editReply({
          content: "Cleared the blacklist",
          ephemeral: true,
        });
        break;
      case "settings":
        const loggingChannel = options.Channel("logging").id;
        await Schema.findOneAndUpdate(
          { Guild: guild.id },
          { Log: loggingChannel },
          { new: true, upsert: true }
        );

        client.filtersLog.set(guild.id, loggingChannel);

        interaction.editReply({
          content: `Added <#${loggingChannel}> as the logging channel for the filtering system`,
        });
        break;
      case "configure":
        const Choise = options.getString("options");
        const Words = options.getString("word").toLowerCase().split(",");
        switch (Choise) {
          case "add":
            Schema.findOne({ Guild: guild.id }, async (err, data) => {
              if (err) throw err;
              if (!data) {
                await Schema.create({
                  Guild: guild.id,
                  Log: null,
                  Words: Words,
                });

                client.filters.set(guild.id, Words);

                return interaction.editReply({
                  content: `Added ${Words.length} new word(s) to the blacklist`,
                  ephemeral: true,
                });
              }

              const newWords = [];
              Words.forEach((w) => {
                if (data.Words.includes(w)) return;
                newWords.push(w);
                data.Words.push(w);
                client.filters.get(guild.id).push(w);
              });

              interaction.editReply({
                content: `Added ${newWords.length} new word(s) to the blacklist`,
                ephemeral: true,
              });

              data.save();
            });

            break;
          case "remove":
            Schema.findOne({ Guild: guild.id }, async (err, data) => {
              if (err) throw err;
              if (!data) {
                return interaction.editReply({
                  content: "There is no data to remove!",
                  ephemeral: true,
                });
              }

              const removeWords = [];

              Words.forEach((w) => {
                if (!data.Words.includes(w)) return;
                data.Words.remove(w);
                removeWords.push(w);
              });

              const newArray = await client.filters
                .get(guild.id)
                .filter((word) => !removeWords.includes(word));

              client.filters.set(guild.id, newArray);

              interaction.editReply({
                content: `Removed ${removeWords.length} word(s) from the blacklist.`,
                ephemeral: true,
              });

              data.save();
            });
            break;
        }
        break;
    }
  },
};
