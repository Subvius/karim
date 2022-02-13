const {
  CommandInteraction,
  Client,
  MessageEmbed,
  MessageSelectMenu,
  MessageActionRow,
} = require("discord.js");
const ee = require("../../Config/embed.json");

module.exports = {
  name: "music",
  description: "🎶 Music System",
  permission: "ADMINISTRATOR",
  options: [
    {
      name: "clear",
      description: "Clear the Queue",
      type: "SUB_COMMAND",
    },
    {
      name: "play",
      description: "Play a song in your voice channel",
      type: "SUB_COMMAND",
      options: [
        {
          name: "query",
          description: "Song name or URL to add to the queue",
          type: "STRING",
          required: true,
        },
      ],
    },
    {
      name: "volume",
      description: "Change the volume",
      type: "SUB_COMMAND",
      options: [
        {
          name: "percent",
          description: "(11 = 11%)",
          type: "NUMBER",
          required: true,
        },
      ],
    },
    {
      name: "settings",
      description: "Select an option",
      type: "SUB_COMMAND",
      options: [
        {
          name: "options",
          description: "Select an option",
          type: "STRING",
          required: true,
          choices: [
            { name: "🔢 View Queue", value: "queue" },
            { name: "⏭️ Skip Song", value: "skip" },
            { name: "⏸️ Pause Song", value: "pause" },
            { name: "▶️ Resume Song", value: "resume" },
            { name: "⏹️ Stop Music", value: "stop" },
            { name: "🔀 Shuffle Queue", value: "shuffle" },
            { name: "🔃 Toggle Autoplay Modes", value: "AutoPlay" },
            { name: "🔂 Toggle Repeat Mode", value: "RepeatMode" },
            { name: "◀️ Jump to song", value: "Jump" },
          ],
        },
        {
          name: "song",
          description:
            "Specify the song number (The next one is 1, 2,.. The previous one is -1, -2,..)",
          type: "NUMBER",
          required: false,
        },
      ],
    },
  ],
  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const { options, member, guild, channel } = interaction;
    const VoiceChannel = member.voice.channel;

    if (!VoiceChannel)
      return interaction.reply({
        content:
          "You must be in a voice channel to be able to use the music commands",
        ephemeral: true,
      });

    if (
      guild.me.voice.channelId &&
      VoiceChannel.id !== guild.me.voice.channelId
    )
      return interaction.reply({
        content: `I'm already playing music in <#${guild.me.voice.channelId}>`,
        ephemeral: true,
      });

    try {
      switch (options.getSubcommand()) {
        case "play": {
          client.distube.playVoiceChannel(
            VoiceChannel,
            options.getString("query"),
            { textChannel: channel, member: member }
          );
          return interaction.reply({
            content: `🎼 Request recieved`,
            ephemeral: true,
          });
        }
        case "volume": {
          const Volume = options.getNumber("percent");
          if (Volume < 1 || Volume > 100)
            return interaction.reply({
              content: `You have to specify a number between 1 and 100`,
              ephemeral: true,
            });

          client.distube.setVolume(VoiceChannel, Volume);
          return interaction.reply({
            embeds: [
              new MessageEmbed()
                .setColor("GREEN")
                .setDescription(`🔊 | Volume has been set to \`${Volume}%\``),
            ],
          });
        }
        case "clear": {
          try {
            await interaction.deferReply();
            let newQueue = client.distube.getQueue(VoiceChannel);
            let song = newQueue.songs[0];
            if (song.user.id !== member.id) {
              return interaction.editReply({
                embeds: [
                  new MessageEmbed()
                    .setColor("RED")
                    .setFooter({
                      text: "ee.footertext",
                      iconURL: ee.footericon,
                    })
                    .setDescription(`⛔ **You are not the Song Requester!**`),
                ],
                ephemeral: true,
              });
            }
            let amount = newQueue.songs.length - 2;
            newQueue.songs = [newQueue.songs[0]];
            interaction.editReply({
              embeds: [
                new MessageEmbed()
                  .setColor(ee.color)
                  .setTimestamp()
                  .setTitle(
                    `🗑 **Cleared the Queue and deleted ${amount} Songs!**`
                  )
                  .setFooter({
                    text: `💢 Action by: ${member.user.tag}`,
                    iconURL: member.user.displayAvatarURL({ dynamic: true }),
                  }),
              ],
            });
          } catch (e) {
            console.log(e.stack ? e.stack : e);
            interaction.editReply({
              content: `⛔ | Error: `,
              embeds: [
                new MessageEmbed()
                  .setColor(ee.wrongcolor)
                  .setDescription(`\`\`\`${e}\`\`\``),
              ],
              ephemeral: true,
            });
          }
        }
        case "settings": {
          const queue = await client.distube.getQueue(VoiceChannel);
          if (!queue)
            return interaction.reply({
              content: `⛔ There is no queue.`,
              ephemeral: true,
            });

          switch (options.getString("options")) {
            case "skip":
              await queue.skip(VoiceChannel);
              return interaction.reply({
                embeds: [
                  new MessageEmbed()
                    .setColor("GREEN")
                    .setDescription(`⏭️ Song has been skipped.`),
                ],
              });
            case "pause":
              await queue.pause(VoiceChannel);
              return interaction.reply({
                embeds: [
                  new MessageEmbed()
                    .setColor("GREEN")
                    .setDescription(`⏯️ Song has been paused`),
                ],
              });

            case "Jump":
              await queue
                .jump(options.getNumber("song") || 1)
                .catch((err) =>
                  interaction.reply(
                    "Invalid song number. Song number must be: The next one is 1, 2,... The previous one is -1, -2,..."
                  )
                );
              return interaction.reply({
                embeds: [
                  new MessageEmbed()
                    .setColor("GREEN")
                    .setDescription(`◀️ Jumping to the song..`),
                ],
              });

            case "stop":
              await queue.stop(VoiceChannel);
              return interaction.reply({
                embeds: [
                  new MessageEmbed()
                    .setColor("GREEN")
                    .setDescription(`⏹️ Music has been stopped`),
                ],
              });
            case "resume":
              await queue.resume(VoiceChannel);
              return interaction.reply({
                embeds: [
                  new MessageEmbed()
                    .setColor("GREEN")
                    .setDescription(`▶️ Song has been resumed`),
                ],
              });

            case "shuffle":
              await queue.shuffle(VoiceChannel);
              return interaction.reply({
                embeds: [
                  new MessageEmbed()
                    .setColor("GREEN")
                    .setDescription(`🔀 The queue has been shuffled`),
                ],
              });

            case "AutoPlay":
              let Mode = await queue.toggleAutoplay(VoiceChannel);
              return interaction.reply({
                embeds: [
                  new MessageEmbed()
                    .setColor("GREEN")
                    .setDescription(
                      `🔃 Autoplay Mode is set to ${Mode ? "on" : "off"}`
                    ),
                ],
              });

            case "RepeatMode":
              let Mode1 = await client.distube.setRepeatMode(queue);
              return interaction.reply({
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

            case "queue":
              try {
                let newQueue = client.distube.getQueue(VoiceChannel);
                if (!newQueue || !newQueue.songs || newQueue.songs.length == 0)
                  return interaction.reply({
                    embeds: [
                      new MessageEmbed()
                        .setColor("RED")
                        .setTitle(`⛔ **I am nothing Playing right now!**`),
                    ],
                    ephemeral: true,
                  });
                let embeds = [];
                let k = 10;
                let theSongs = newQueue.songs;
                //defining each Pages
                for (let i = 0; i < theSongs.length; i += 10) {
                  let qus = theSongs;
                  const current = qus.slice(i, k);
                  let j = i;
                  const info = current
                    .map(
                      (track) =>
                        `**${j++} -** [\`${String(track.name)
                          .replace(/\[/giu, "{")
                          .replace(/\]/giu, "}")
                          .substr(0, 60)}\`](${track.url}) - \`${
                          track.formattedDuration
                        }\``
                    )
                    .join("\n");
                  const embed = new MessageEmbed()
                    .setColor("LUMINOUS_VIVID_PINK")
                    .setDescription(`${info}`);
                  if (i < 10) {
                    embed.setTitle(
                      `📑 **Top ${
                        theSongs.length > 50 ? 50 : theSongs.length
                      } | Queue of ${guild.name}**`
                    );
                    embed.setDescription(
                      `**(0) Current Song:**\n> [\`${theSongs[0].name
                        .replace(/\[/giu, "{")
                        .replace(/\]/giu, "}")}\`](${
                        theSongs[0].url
                      })\n\n${info}`
                    );
                  }
                  embeds.push(embed);
                  k += 10; //Raise k to 10
                }
                embeds[embeds.length - 1] = embeds[embeds.length - 1].setFooter(
                  `\n${theSongs.length} Songs in the Queue | Duration: ${newQueue.formattedDuration}`
                );
                let pages = [];
                for (let i = 0; i < embeds.length; i += 3) {
                  pages.push(embeds.slice(i, i + 3));
                }
                pages = pages.slice(0, 24);
                const Menu = new MessageSelectMenu()
                  .setCustomId("QUEUEPAGES")
                  .setPlaceholder("Select a Page")
                  .addOptions([
                    pages.map((page, index) => {
                      let Obj = {};
                      Obj.label = `Page ${index}`;
                      Obj.value = `${index}`;
                      Obj.description = `Shows the ${index}/${
                        pages.length - 1
                      } Page!`;
                      return Obj;
                    }),
                  ]);
                const row = new MessageActionRow().addComponents([Menu]);
                interaction.reply({
                  embeds: [embeds[0]],
                  components: [row],
                  ephemeral: true,
                });
                //Event
                client.on("interactionCreate", (i) => {
                  if (!i.isSelectMenu()) return;
                  if (
                    i.customId === "QUEUEPAGES" &&
                    i.applicationId == client.user.id
                  ) {
                    i.reply({
                      embeds: pages[Number(i.values[0])],
                      ephemeral: true,
                    }).catch((e) => {});
                  }
                });
              } catch (e) {
                console.log(e.stack ? e.stack : e);
                interaction.editReply({
                  content: `⛔ | Error: `,
                  embeds: [
                    new MessageEmbed()
                      .setColor("RED")
                      .setDescription(`\`\`\`${e}\`\`\``),
                  ],
                  ephemeral: true,
                });
              }
          }
          return;
        }
      }
    } catch (e) {
      const errEmbed = new MessageEmbed()
        .setColor("RED")
        .setDescription(`⛔ Alert: ${e}`);
      return interaction.editReply({ embeds: [errEmbed] });
    }
  },
};
