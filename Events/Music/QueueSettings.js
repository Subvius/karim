const {
  ButtonInteraction,
  MessageEmbed,
  Client,
  MessageActionRow,
  MessageButton,
  MessageAttachment,
} = require("discord.js");
const path = require("path");
const fs = require("fs");

module.exports = {
  name: "interactionCreate",
  /**
   *
   * @param {ButtonInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    if (!interaction.isButton) return;
    const { guild, customId, channel, member, message } = interaction;
    if (!["previous", "pause", "skip", "songLoop"].includes(customId)) return;

    const VoiceChannel = member.voice.channel;
    if (!VoiceChannel) return;

    if (member.voice.channel.id == guild.me.voice.channelId) {
      await interaction.deferReply();
      const queue = await client.distube.getQueue(VoiceChannel);
      if (!queue)
        return interaction.editReply({
          content: `⛔ There is no queue.`,
          ephemeral: true,
        });

      const musicImage = fs.readFileSync(path.join("Images", "music.png"));
      const authorImage = new MessageAttachment(musicImage);

      const status = (queue) =>
        `Volume: \`${queue.volume}%\` | Filter: \`${
          queue.filters.join(", ") || "Off"
        }\` | Loop: \`${
          queue.repeatMode
            ? queue.repeatMode === 2
              ? "All Queue"
              : "This Song"
            : "Off"
        }\` | Autoplay: \`${queue.autoplay ? "On" : "Off"}\``;
      const song = queue.songs[0];

      switch (customId) {
        case "previous":
          interaction.editReply({
            embeds: [
              new MessageEmbed()
                .setColor("GREEN")
                .setDescription(`◀️ Jumping to the song..`),
            ],
          });
          return await queue.jump(-1).catch((err) =>
            interaction.editReply({
              embeds: [
                new MessageEmbed()
                  .setColor("RED")
                  .setDescription(`⛔ There is no previous song`),
              ],
            })
          );

        case "pause":
          if (queue.playing) {
            await queue.pause(VoiceChannel);
            await message.edit({
              embeds: [
                new MessageEmbed()
                  .setAuthor({
                    name: `${song.name}`,
                    iconURL: "attachment://music.png",
                  })
                  .setColor("GREEN")
                  .addField(
                    "<:people:928045532759359518> Required by:",
                    `>>> ${song.user}`,
                    true
                  )
                  .addField(
                    "⌛ Duration",
                    `>>> \`${song.formattedDuration}\``,
                    true
                  )
                  .addField("🌀 Queue", `\`${queue.formattedDuration}\``, true)
                  .addField("🎚️ Status", `>>> ${status(queue)}`, false),
              ],
              files: ["Images/music.png"],
              components: [
                new MessageActionRow().addComponents(
                  new MessageButton()
                    .setCustomId("previous")
                    .setLabel("Previous")
                    .setStyle("PRIMARY")
                    .setEmoji("⏮️"),

                  new MessageButton()
                    .setCustomId("pause")
                    .setLabel("Resume")
                    .setStyle("SECONDARY")
                    .setEmoji("▶️"),

                  new MessageButton()
                    .setCustomId("skip")
                    .setLabel("Skip")
                    .setStyle("PRIMARY")
                    .setEmoji("⏭️"),

                  new MessageButton()
                    .setCustomId("songLoop")
                    .setLabel("Loop")
                    .setStyle("SECONDARY")
                    .setEmoji("🔂")
                ),
              ],
            });
            return interaction.editReply({
              embeds: [
                new MessageEmbed()
                  .setColor("GREEN")
                  .setDescription(`⏯️ Song has been paused`),
              ],
            });
          } else if (queue.paused) {
            await queue.resume(VoiceChannel);
            await message.edit({
              embeds: [
                new MessageEmbed()
                  .setAuthor({
                    name: `${song.name}`,
                    iconURL: "attachment://music.png",
                  })
                  .setColor("GREEN")
                  .addField(
                    "<:people:928045532759359518> Required by:",
                    `>>> ${song.user}`,
                    true
                  )
                  .addField(
                    "⌛ Duration",
                    `>>> \`${song.formattedDuration}\``,
                    true
                  )
                  .addField("🌀 Queue", `\`${queue.formattedDuration}\``, true)
                  .addField("🎚️ Status", `>>> ${status(queue)}`, false),
              ],
              files: ["Images/music.png"],
              components: [
                new MessageActionRow().addComponents(
                  new MessageButton()
                    .setCustomId("previous")
                    .setLabel("Previous")
                    .setStyle("PRIMARY")
                    .setEmoji("⏮️"),

                  new MessageButton()
                    .setCustomId("pause")
                    .setLabel("Pause")
                    .setStyle("SECONDARY")
                    .setEmoji("⏸️"),

                  new MessageButton()
                    .setCustomId("skip")
                    .setLabel("Skip")
                    .setStyle("PRIMARY")
                    .setEmoji("⏭️"),

                  new MessageButton()
                    .setCustomId("songLoop")
                    .setLabel("Loop")
                    .setStyle("SECONDARY")
                    .setEmoji("🔂")
                ),
              ],
            });
            return interaction.editReply({
              embeds: [
                new MessageEmbed()
                  .setColor("GREEN")
                  .setDescription(`▶️ Song has been resumed`),
              ],
            });
          }

        case "skip":
          interaction.editReply({
            embeds: [
              new MessageEmbed()
                .setColor("GREEN")
                .setDescription(`⏭️ Skipping song...`),
            ],
          });
          return await queue.skip(VoiceChannel).catch((err) =>
            interaction.editReply({
              embeds: [
                new MessageEmbed()
                  .setColor("RED")
                  .setDescription(`⛔ There is no up next song`),
              ],
            })
          );

        case "songLoop":
          let Mode1 = await client.distube.setRepeatMode(queue);
          return interaction.editReply({
            embeds: [
              new MessageEmbed()
                .setColor("GREEN")
                .setDescription(
                  `🔂 Repeat Mode is set to: ${(Mode1 = Mode1
                    ? Mode1 == 2
                      ? "Queue"
                      : "Song"
                    : "Off")}`
                ),
            ],
          });
      }
    } else {
      interaction.reply({
        content: "You are not allowed to interact with this",
        ephemeral: true,
      });
    }
  },
};
