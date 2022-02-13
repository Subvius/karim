const client = require("../../index");
const {
  CommandInteraction,
  Client,
  MessageEmbed,
  MessageActionRow,
  MessageButton,
  MessageAttachment,
} = require("discord.js");
const path = require("path");
const fs = require("fs");

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
client.distube
  .on("playSong", (queue, song) =>
    queue.textChannel.send({
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
          .addField("⌛ Duration", `>>> \`${song.formattedDuration}\``, true)
          .addField("🌀 Queue", `\`${queue.formattedDuration}\``, true)
          .addField("🎚️ Status", `>>> ${status(queue)}`, false),
        //   .setDescription(
        //     `🎶 | Plaing \`${song.name}\` - \`${
        //       song.formattedDuration
        //     }\`\nRequested by: ${song.user}\n${status(queue)}`
        //   ),
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
    })
  )

  .on("addSong", (queue, song) =>
    queue.textChannel.send({
      embeds: [
        new MessageEmbed()
          .setColor("GREEN")
          .setDescription(
            `🎶 | Added ${song.name} - \`${song.formattedDuration}\` to the queue by ${song.user}`
          ),
      ],
    })
  )

  .on("addList", (queue, playlist) =>
    queue.textChannel.send({
      embeds: [
        new MessageEmbed()
          .setColor("GREEN")
          .setDescription(
            `🎶 | Added \`${playlist.name}\` playlist (${
              playlist.songs.length
            } songs) to queue\n${status(queue)}`
          ),
      ],
    })
  )

  .on("error", (channel, e) => {
    channel.send({
      embeds: [
        new MessageEmbed()
          .setColor("RED")
          .setDescription(`⛔ | An error encountered: ${e}`),
      ],
    });
  })
  .on("empty", (channel) =>
    channel.send({
      embeds: [
        new MessageEmbed()
          .setColor("RED")
          .setDescription(`Voice channel is empty, leaving the channel.`),
      ],
    })
  )

  .on("searchNoResult", (message) =>
    message.channel.send({
      embeds: [
        new MessageEmbed()
          .setColor("RED")
          .setDescription(`⛔ | No result found!`),
      ],
    })
  )

  .on("finish", (queue) =>
    queue.textChannel.send({
      embeds: [
        new MessageEmbed()
          .setColor("RED")
          .setDescription(`Queue finished, leaving the channel.`),
      ],
    })
  );
