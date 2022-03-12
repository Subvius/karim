const {
  ButtonInteraction,
  MessageEmbed,
  MessageActionRow,
  MessageButton,
} = require("discord.js");
const suggestDB = require("../../Schemas/sugestDB");
const suggestSetupDB = require("../../Schemas/sugestSetupDB");

module.exports = {
  name: "interactionCreate",
  /**
   *
   * @param {ButtonInteraction} interaction
   */
  async execute(interaction, client) {
    if (!interaction.isButton()) return;

    if (
      !["suggestion-upvote", "suggestion-downvote"].includes(
        interaction.customId
      )
    )
      return;

    const suggestionsSetup = await suggestSetupDB.findOne({
      GuildID: interaction.guildId,
    });
    var suggestionsChannel;

    if (!suggestionsSetup) {
      return interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor("RED")
            .setDescription(
              `❌ This server has not setup the suggestion system.`
            ),
        ],
      });
    } else {
      suggestionsChannel = interaction.guild.channels.cache.get(
        suggestionsSetup.ChannelID
      );
    }

    const suggestion = await suggestDB.findOne({
      GuildID: interaction.guild.id,
      MessageID: interaction.message.id,
    });

    if (!suggestion)
      return interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor("RED")
            .setDescription(
              `❌ This [suggestion](${interaction.message.url}) was not found in the database.`
            ),
        ],
        ephemeral: true,
      });

    if (suggestion.InUse) {
      return interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor("RED")
            .setDescription(
              `❌ Please wait as someone else it currently trying to upvote/downvote.`
            ),
        ],
        ephemeral: true,
      });
    } else {
      suggestion.InUse = true;
      await suggestion.save();
    }

    if (
      suggestion.UpvotesMembers.includes(interaction.member.id) &&
      suggestion.DownvotesMembers.includes(interaction.member.id)
    ) {
      while (suggestion.DownvotesMembers.includes(interaction.member.id)) {
        suggestion.DownvotesMembers.splice(
          suggestion.DownvotesMembers.indexOf(interaction.member.id, 1)
        );
      }

      while (suggestion.UpvotesMembers.includes(interaction.member.id)) {
        suggestion.UpvotesMembers.splice(
          suggestion.UpvotesMembers.indexOf(interaction.member.id, 1)
        );
      }

      await suggestion.save();

      return interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor("RED")
            .setDescription(
              `❌ You have somehow appeared in both upvotes and downvotes, so your votes have been reset.`
            ),
        ],
        ephemeral: true,
      });
    }

    const Embed = interaction.message.embeds[0];
    if (!Embed) return;

    switch (interaction.customId) {
      case "suggestion-upvote":
        if (suggestion.UpvotesMembers.includes(interaction.member.id)) {
          interaction.reply({
            embeds: [
              new MessageEmbed()
                .setColor("RED")
                .setDescription(
                  `❌ You have already upvoted this [suggestion](${interaction.message.url}).`
                ),
            ],
            ephemeral: true,
          });
        } else if (
          suggestion.DownvotesMembers.includes(interaction.member.id)
        ) {
          suggestion.DownvotesMembers.splice(
            suggestion.DownvotesMembers.indexOf(interaction.member.id, 1)
          );

          suggestion.UpvotesMembers.push(interaction.member.id);

          interaction.reply({
            embeds: [
              new MessageEmbed()
                .setColor("RED")
                .setDescription(
                  `✅ You have upvoted this [suggestion](${interaction.message.url}).`
                ),
            ],
            ephemeral: true,
          });
        } else {
          suggestion.UpvotesMembers.push(interaction.member.id);

          interaction.reply({
            embeds: [
              new MessageEmbed()
                .setColor("GREEN")
                .setDescription(
                  `✅ You have upvoted this [suggestion](${interaction.message.url}).`
                ),
            ],
            ephemeral: true,
          });
        }
        break;

      case "suggestion-downvote":
        if (suggestion.DownvotesMembers.includes(interaction.member.id)) {
          interaction.reply({
            embeds: [
              new MessageEmbed()
                .setColor("RED")
                .setDescription(
                  `❌ You have already downvoted this [suggestion](${interaction.message.url}).`
                ),
            ],
            ephemeral: true,
          });
        } else if (suggestion.UpvotesMembers.includes(interaction.member.id)) {
          suggestion.UpvotesMembers.splice(
            suggestion.UpvotesMembers.indexOf(interaction.member.id, 1)
          );

          suggestion.DownvotesMembers.push(interaction.member.id);

          interaction.reply({
            embeds: [
              new MessageEmbed()
                .setColor("RED")
                .setDescription(
                  `✅ You have downvoted this [suggestion](${interaction.message.url}).`
                ),
            ],
            ephemeral: true,
          });
        } else {
          suggestion.DownvotesMembers.push(interaction.member.id);

          interaction.reply({
            embeds: [
              new MessageEmbed()
                .setColor("GREEN")
                .setDescription(
                  `✅ You have downvoted this [suggestion](${interaction.message.url}).`
                ),
            ],
            ephemeral: true,
          });
        }
        break;
    }

    Embed.fields[3] = {
      name: "Upvotes",
      value: `${suggestion.UpvotesMembers.length}`,
      inline: true,
    };
    Embed.fields[4] = {
      name: "Downvotes",
      value: `${suggestion.DownvotesMembers.length}`,
      inline: true,
    };
    Embed.fields[5] = {
      name: "Overall votes",
      value: `${
        suggestion.UpvotesMembers.length - suggestion.DownvotesMembers.length
      }`,
      inline: true,
    };

    await interaction.message.edit({ embeds: [Embed] });

    suggestion.InUse = false;
    await suggestion.save();
  },
};
