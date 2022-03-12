const {
  CommandInteraction,
  MessageEmbed,
  MessageAttachment,
  Client,
  ButtonInteraction,
  MessageActionRow,
  MessageButton,
} = require("discord.js");
const DB = require("../../Schemas/GuildCreateDB");
const UserDB = require("../../Schemas/ProfileDB");
const path = require("path");
const fs = require("fs");
const Emojis = require("../../Container/src/emoji.json");

module.exports = {
  name: "guild",
  description: "Guild system commands",
  options: [
    {
      name: "create",
      type: "SUB_COMMAND",
      description: "Create a new guild",
      options: [
        {
          name: "name",
          description: "Guild name",
          required: true,
          type: "STRING",
        },
        {
          name: "description",
          description: "Description of the guild",
          required: false,
          type: "STRING",
        },
      ],
    },
    {
      name: "manage",
      type: "SUB_COMMAND",
      description:
        "Manage your guild (You must be an Owner or an Admin of the guild )",
      options: [
        {
          name: "options",
          choices: [
            { name: "🛠️ Rename", value: "rename" },
            { name: "⚙️ Change Description", value: "changedesc" },
            // { name: "🖼️ Change Guild Logo", value: "changelogo" },
            { name: "🏷️ Set Guild Tag", value: "settag" },
            { name: "➕ Add Administrator", value: "addadmin" },
            { name: "❌ Remove Administrator", value: "removeadmin" },
            { name: "➕ Add User to the Guild", value: "add" },
            { name: "❌ Kick", value: "kick" },
            { name: "🗑️ Delete Guild", value: "deleteguild" },
          ],
          type: "STRING",
          required: true,
          description: "Select an option",
        },
        {
          name: "value",
          description: "This parameter must be a user ID or text",
          type: "STRING",
          required: true,
        },
        {
          name: "guildid",
          description:
            "Provide the Guild ID (Can be found on the guild information page)",
          type: "STRING",
          required: false,
        },
      ],
    },
    {
      name: "info",
      description: "Get information about the guild",
      type: "SUB_COMMAND",
      options: [
        {
          name: "options",
          description: "Select an option",
          type: "STRING",
          required: true,
          choices: [
            { name: "📜 Main Page", value: "mainpage" },
            { name: "📃 List the Guild members", value: "list" },
            { name: "📰 News", value: "news" },
          ],
        },
        {
          name: "id",
          description:
            "Provide the Guild ID (Can be found on the guild information page) ",
          type: "STRING",
          required: false,
        },
      ],
    },
    {
      name: "news",
      type: "SUB_COMMAND",
      description: "Manage your Guild's news",
      options: [
        {
          name: "createnews",
          description: "create a new news item",
          required: false,
          type: "STRING",
        },
        {
          name: "deletenews",
          description:
            'Delete a news item. (Provide the ID of the news or "all" to delete all news)',
          required: false,
          type: "STRING",
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
    const { options, user, guild } = interaction;
    // await interaction.deferReply();
    const subCommand = options.getSubcommand();
    const Profile = await UserDB.findOne({ UserID: user.id });
    if (!Profile)
      return interaction.reply({
        content: "You cannot Create or Manage any Guild",
        ephemeral: true,
      });
    const Embed = new MessageEmbed().setColor("RANDOM");
    switch (subCommand) {
      case "create":
        if (Profile.AvailableToGuildCreate) {
          const guildName = options.getString("name");
          const guildDescription =
            options.getString("description") || "No description provided";
          const guildID = makeid(20);
          const tempArray = [user.id];
          let logoFiles = [
            "award.png",
            "protection.png",
            "shield (3).png",
            "Shield_with_Fire.png",
            "Shield_with_gem.png",
            "wooden.png",
          ];
          let Logo = logoFiles[Math.floor(Math.random() * logoFiles.length)];

          await DB.create({
            OwnerID: user.id,
            GuildID: guildID,
            GuildName: guildName,
            GuildLevel: 0,
            GuildXP: 0,
            GuildMembers: tempArray,
            GuildAdmins: [],
            GuildModerators: [],
            // GuildLogo: `https://media.discordapp.net/attachments/771804912391946291/950487773352173598/no-image-available-icon-6.png`,
            GuildLogo: Logo,
            GuildMaxMembers: 5,
            GuildDescription: guildDescription,
            GuildXPBoost: 1,
          });
          interaction.reply({
            embeds: [
              Embed.setColor("GREEN")
                .setAuthor({
                  name: user.username,
                  iconURL: user.avatarURL({ size: 512, dynamic: true }),
                })
                .setDescription(
                  `Congratulations ${user}!\n You have successfully created a new guild.\n \`/guild manage\` - To update Guild settings\n\`/guild info\` - To get an overview of the guild`
                ),
            ],
          });
          await UserDB.updateOne(
            {
              UserID: user.id,
            },
            { AvailableToGuildCreate: false, GuildID: guildID }
          );
        } else {
          return interaction.reply({
            embeds: [
              Embed.setColor("RED").setDescription(
                `⛔ You have already created a guild`
              ),
            ],
            ephemeral: true,
          });
        }
        break;
      case "news":
        const IDguild = Profile.GuildID;
        // console.log(Profile.GuildID);
        const createNews = options.getString("createnews");
        let deleteNews = options.getString("deletenews");
        const GuildInform = await DB.findOne({ GuildID: IDguild });
        if (!GuildInform)
          return interaction.reply({
            content: `There is no such Guild with \`${IDguild}\` ID`,
          });
        if (
          GuildInform.GuildAdmins.indexOf(user.id) === -1 &&
          user.id !== GuildInform.OwnerID
        )
          return interaction.reply({
            content:
              "You must be an Administrator or a higher to use this command",
            ephemeral: true,
          });
        if (createNews) {
          let news = GuildInform.GuildNews;
          news.push(`${createNews}/dYYxXC7vVYGG8QIrGOo9n${Date.now()}`);
          await DB.updateOne({ GuildID: IDguild }, { GuildNews: news });
          interaction.reply({
            embeds: [
              Embed.setColor("GREEN").setDescription(
                `A new news item has been successfully created\nYou can view all the news using \`/guild info [📰 News]\``
              ),
            ],
          });
        }
        if (deleteNews) {
          if (!GuildInform.GuildNews)
            return interaction.reply({
              content: "This Guild doesn't have any news",
            });
          if (deleteNews.toLowerCase() === "all") {
            await DB.updateOne({ GuildID: IDguild }, { GuildNews: [] });
            return interaction.reply({
              embeds: [
                Embed.setColor("GREEN").setDescription(
                  `All news has been successfully deleted`
                ),
              ],
            });
          }
          deleteNews = Number(deleteNews);
          if (deleteNews !== deleteNews)
            return interaction.reply({
              content:
                "You must provide the ID of news item. Can be checked in `/guild info [📰 News]`",
            });
          if (!GuildInform.GuildNews[deleteNews - 1])
            return interaction.reply({
              content: `This Guild doesn't have news this ID \`${deleteNews}\``,
            });
          let news = GuildInform.GuildNews;
          news.splice(deleteNews - 1, 1);
          await DB.updateOne({ GuildID: IDguild }, { GuildNews: news });
          interaction.reply({
            embeds: [
              Embed.setColor("GREEN").setDescription(
                `Successfully deleted the news item with ID ${deleteNews}`
              ),
            ],
          });
        }
        break;

      case "info":
        const guildId = options.getString("id") || Profile.GuildID;
        if (!Profile.GuildID)
          return interaction.reply({
            content: "You must be a member of Guild to use this command.",
            ephemeral: true,
          });
        const GuildInfo = await DB.findOne({ GuildID: guildId });
        if (!GuildInfo)
          return interaction.reply({
            content: `There is no such Guild with \`${guildId}\` ID`,
          });
        const ops = options.getString("options");
        // const guildLogo = fs.readFileSync(
        //   path.join("Assets", GuildInfo.GuildLogo)
        // );
        const guildOwner = client.users.cache.get(GuildInfo.OwnerID);
        const filter = (i) => i.user.id === user.id;
        const time = 1000 * 60 * 5;
        let collector;
        switch (ops) {
          case "list":
            let Titleembed;
            if (GuildInfo.GuildTag) {
              Titleembed = `[${GuildInfo.GuildTag}] ${GuildInfo.GuildName}`;
            } else {
              Titleembed = `${GuildInfo.GuildName}`;
            }
            Embed.setColor("RANDOM")
              .setTitle(Titleembed)
              .setThumbnail(`attachment://${GuildInfo.GuildLogo}`)
              .setDescription(`List of the Guild members`)
              .addField(
                "👑 Owner",
                `>>> ${guildOwner.username}#${guildOwner.discriminator}`,
                false
              );
            let temporaryIDs = [];
            let temporary = [];

            if (GuildInfo.GuildAdmins.length > 0) {
              GuildInfo.GuildAdmins.forEach((a) => {
                temporaryIDs.push(a);
                temporary.push(
                  `${client.users.cache.get(a).username}#${
                    client.users.cache.get(a).discriminator
                  }`
                );
              });
              Embed.addField(
                `${Emojis.Admin} Admins`,
                `>>> ${temporary.join("\n")}`,
                false
              );
            }
            let temporaryMembers = [];
            GuildInfo.GuildMembers.forEach((m) => {
              if (temporaryIDs.indexOf(m) === -1 && m !== guildOwner.id)
                temporaryMembers.push(
                  `${client.users.cache.get(m).username}#${
                    client.users.cache.get(m).discriminator
                  }`
                );
            });
            if (temporaryMembers.length > 0)
              Embed.addField(
                `${Emojis.Member} Members`,
                `>>> ${temporaryMembers.join("\n")}`,
                false
              );

            interaction.reply({
              embeds: [Embed],
              files: [`Assets/${GuildInfo.GuildLogo}`],
            });
            break;
          case "mainpage":
            let embedTitle;
            if (GuildInfo.GuildTag) {
              embedTitle = `[${GuildInfo.GuildTag}] ${GuildInfo.GuildName}`;
            } else {
              embedTitle = `${GuildInfo.GuildName}`;
            }
            const EmbedMain = new MessageEmbed();
            EmbedMain.setTimestamp(Date.now())
              // .setAuthor({
              //   name: GuildInfo.GuildName,
              //   iconURL: `attachment://${GuildInfo.GuildLogo}`,
              // })
              .setThumbnail(`attachment://${GuildInfo.GuildLogo}`)
              // .setThumbnail(`${GuildInfo.GuildLogo}`)
              .setDescription(
                `${GuildInfo.GuildDescription}
                      `
              )
              .addField(
                `:crown: Owner`,
                `>>> ${guildOwner.username}#${guildOwner.discriminator}`,
                false
              )
              .addField(
                `<:members:928045532503498792> Members`,
                `>>> ${GuildInfo.GuildMembers.length}/${GuildInfo.GuildMaxMembers}`,
                false
              )
              .addField(
                `<:level:948657314779512912> Level`,
                `>>> ${GuildInfo.GuildLevel}`,
                false
              )
              .addField(
                `<a:xp:906146365703323688> Total XP`,
                `>>> ${GuildInfo.GuildXP}`,
                false
              )
              .setTitle(`${embedTitle}`)
              .setColor("BLUE")
              .setFooter({ text: `ID: ${GuildInfo.GuildID}` });

            if (
              GuildInfo.GuildAdmins.indexOf(user.id) === -1 &&
              user.id !== GuildInfo.OwnerID
            ) {
              interaction.reply({
                embeds: [EmbedMain],
                files: [`Assets/${GuildInfo.GuildLogo}`],
              });
            } else {
              const pageType = {};
              const id = user.id;

              const EmbedSettings = new MessageEmbed()
                .setColor("PURPLE")
                .setThumbnail(`attachment://${GuildInfo.GuildLogo}`)
                .setTitle(`${embedTitle} | Settings`)
                .setDescription(
                  `Hey! This is your Guild's control panel.\n\nIf you want to change your Guild name, etc, do:\n\`\`\`/guild manege [option] [value(For example: User ID)]\`\`\`\n<:level:948657314779512912> Guild level: **${GuildInfo.GuildLevel}**\n<a:xp:906146365703323688> Guild XP: **${GuildInfo.GuildXP}**`
                );
              const getRow = (id) => {
                const row = new MessageActionRow();
                row.addComponents([
                  new MessageButton()
                    .setCustomId("mainpage")
                    .setEmoji("📜")
                    .setStyle("SECONDARY")
                    .setLabel("Main page")
                    .setDisabled(pageType[id] === "main"),
                  new MessageButton()
                    .setCustomId("settingspage")
                    .setEmoji("⚙️")
                    .setStyle("SECONDARY")
                    .setLabel("Settings")
                    .setDisabled(pageType[id] === "settings"),
                ]);
                return row;
              };
              pageType[id] = pageType[id] || "main";

              interaction.reply({
                embeds: [EmbedMain],
                components: [getRow(id)],
              });

              collector = interaction.channel.createMessageComponentCollector({
                filter,
                time,
              });

              collector.on("collect", (btnIn) => {
                if (!btnIn) return;
                try {
                  btnIn.deferUpdate();
                  if (!["mainpage", "settingspage"].includes(btnIn.customId))
                    return;
                  if (btnIn.customId === "mainpage") {
                    pageType[id] = "main";
                    interaction.editReply({
                      embeds: [EmbedMain],
                      components: [getRow(id)],
                    });
                  } else if (btnIn.customId === "settingspage") {
                    pageType[id] = "settings";
                    interaction.editReply({
                      embeds: [EmbedSettings],
                      components: [getRow(id)],
                    });
                  }
                } catch {}
              });
              break;
            }

            break;
          case "news":
            const guildNews = GuildInfo.GuildNews;
            if (!guildNews || guildNews.length === 0)
              return interaction.reply({
                content: "This guild doesn't have any news",
              });
            let pages = [];
            guildNews.forEach((n) => pages.push(n));
            const embeds = [];
            const pageNumber = {};
            for (let i = 0; i < pages.length; i++) {
              embeds.push(
                new MessageEmbed()
                  .setTimestamp(
                    Number(pages[i].split("/dYYxXC7vVYGG8QIrGOo9n")[1])
                  )
                  .setColor("NOT_QUITE_BLACK")
                  .setDescription(pages[i].split("/dYYxXC7vVYGG8QIrGOo9n")[0])
                  .setTitle(`${GuildInfo.GuildName} News#${i + 1}`)
                  .setFooter({ text: `${i + 1}/${pages.length} News` })
              );
            }
            const getRow = (id) => {
              const row = new MessageActionRow();
              row.addComponents([
                new MessageButton()
                  .setCustomId("prev_embed")
                  .setEmoji("⬅️")
                  .setStyle("SECONDARY")
                  .setDisabled(pageNumber[id] === 0),
                new MessageButton()
                  .setCustomId("next_embed")
                  .setEmoji("➡️")
                  .setStyle("SECONDARY")
                  .setDisabled(pageNumber[id] === embeds.length - 1),
              ]);
              return row;
            };
            const id = user.id;
            pageNumber[id] = pageNumber[id] || 0;
            const embedMessage = embeds[pageNumber[id]];
            // let collector;

            // const filter = (i) => i.user.id === user.id;
            // const time = 1000 * 60 * 5;
            interaction.reply({
              ephemeral: true,
              embeds: [embedMessage],
              components: [getRow(id)],
            });
            collector = interaction.channel.createMessageComponentCollector({
              filter,
              time,
            });

            collector.on("collect", (btnIn) => {
              if (!btnIn) return;
              try {
                btnIn.deferUpdate();
                if (!["prev_embed", "next_embed"].includes(btnIn.customId))
                  return;
                if (btnIn.customId === "prev_embed" && pageNumber[id] > 0) {
                  --pageNumber[id];
                } else if (
                  btnIn.customId === "next_embed" &&
                  pageNumber[id] < embeds.length - 1
                ) {
                  ++pageNumber[id];
                }

                interaction.editReply({
                  embeds: [embeds[pageNumber[id]]],
                  components: [getRow(id)],
                });
              } catch {}
            });
            break;
        }

        break;
      case "manage":
        const guildID = options.getString("guildid") || Profile.GuildID;
        const GuildInformation = await DB.findOne({ GuildID: guildID });
        if (!GuildInformation)
          return interaction.reply({
            content: `There is no such Guild with such \`${guildID}\` ID`,
          });
        if (
          user.id in GuildInformation.GuildAdmins ||
          user.id === GuildInformation.OwnerID
        ) {
        } else {
          return interaction.reply({
            embeds: [
              Embed.setColor("RED").setDescription(
                `⛔ You are not allowed to manage this Guild`
              ),
            ],
          });
        }
        const value = options.getString("value");
        if (!value)
          return interaction.reply({
            content: "You must provide a value",
            ephemeral: true,
          });
        switch (options.getString("options")) {
          case "rename":
            let nameBefore = GuildInformation.GuildName;
            await DB.updateOne({ GuildID: guildID }, { GuildName: value });
            interaction.reply({
              content: `Successfully updated Guild name.\n Before:\`${nameBefore}\` After:\`${value}\``,
              ephemeral: true,
            });
            break;
          case "changedesc":
            await DB.updateOne(
              {
                GuildID: guildID,
              },
              {
                GuildDescription: value,
              }
            );
            interaction.reply({
              content: `Successfully updated Guild description to: \n\`${value}\``,
              ephemeral: true,
            });
            break;
          // case "changelogo":
          //   const img = options.getString("value");
          //   await DB.updateOne({ GuildID: guildID }, { GuildLogo: img });
          //   interaction.reply({
          //     content: `Guild logo has been successfully updated`,
          //     ephemeral: true,
          //   });
          //   break;
          case "settag":
            const beforeTag = GuildInformation.GuildTag;
            let newTag = value;
            // console.log(beforeTag, newTag.split(""));
            if (newTag === "null") newTag = null;
            if (
              newTag === beforeTag ||
              (beforeTag !== beforeTag && newTag !== newTag)
            )
              return interaction.reply({
                content: "The new tag must be different from the current one",
                ephemeral: true,
              });
            if (newTag.length > 5)
              return interaction.reply({
                content:
                  "The length of the new tag must be less than 5 characters",
                ephemeral: true,
              });
            if (newTag.indexOf("[") !== -1 || newTag.indexOf("]") !== -1)
              return interaction.reply({
                content: "The new tag should not contain the characters: [ ]",
                ephemeral: true,
              });

            await DB.updateOne({ GuildID: guildID }, { GuildTag: newTag });
            interaction.reply({
              embeds: [
                Embed.setColor("GREEN")
                  .setDescription(
                    `The Guild tag has been updated successfully.\nBefore: \`\`\`[${
                      beforeTag || "None"
                    }]\`\`\`\nAfter: \`\`\`[${newTag || "None"}]\`\`\``
                  )
                  .setFooter({
                    text: "TIP:\nSet the value of value to null to remove the tag",
                  }),
              ],
            });
            break;
          case "addadmin":
            const newAdmin = client.users.cache.get(value);
            if (!newAdmin)
              return interaction.reply({
                content: `There is no such user with such ID: ${value}`,
                ephemeral: true,
              });
            if (
              GuildInformation.GuildMembers.indexOf(newAdmin.id) !== -1 &&
              GuildInformation.GuildAdmins.indexOf(newAdmin.id) === -1
            ) {
              let temp = [newAdmin.id];
              for (let i = 0; i < GuildInformation.GuildAdmins.length; i++) {
                temp.push(GuildInformation.GuildAdmins[i]);
              }
              await DB.updateOne(
                {
                  GuildID: guildID,
                },
                {
                  GuildAdmins: temp,
                }
              );
              interaction.reply({
                embeds: [
                  Embed.setColor("GREEN").setDescription(
                    `Successfully added ${newAdmin} to the Guild Admins`
                  ),
                ],
              });
            } else {
              return interaction.reply({
                content: `This user not in the guild or is already an Admin`,
                ephemeral: true,
              });
            }
            break;
          case "removeadmin":
            const Admin = client.users.cache.get(value);
            if (!Admin)
              return interaction.reply({
                content: `There is no such user with such ID: ${value}`,
                ephemeral: true,
              });
            if (
              GuildInformation.GuildMembers.indexOf(Admin.id) !== -1 &&
              GuildInformation.GuildAdmins.indexOf(Admin.id) !== -1
            ) {
              let temp = GuildInformation.GuildAdmins;
              temp.splice(temp.indexOf(Admin.id), 1);
              await DB.updateOne(
                {
                  GuildID: guildID,
                },
                {
                  GuildAdmins: temp,
                }
              );
              interaction.reply({
                embeds: [
                  Embed.setColor("GREEN").setDescription(
                    `Successfully removed ${Admin} from the Guild Admins`
                  ),
                ],
              });
            } else {
              return interaction.reply({
                content: `This user not in the guild or is not an Admin`,
                ephemeral: true,
              });
            }
            break;
          case "add":
            const invited = client.users.cache.get(value);
            if (!invited)
              return interaction.reply({
                content: "There is no such user with such ID",
                ephemeral: true,
              });
            const invitedProfile = await UserDB.findOne({ UserID: invited.id });
            if (!invitedProfile)
              return interaction.reply({
                content: "I can't find this user",
                ephemeral: true,
              });
            if (
              invitedProfile.GuildID ||
              invitedProfile.GuildID === Profile.GuildID
            )
              return interaction.reply({
                content: "This user is already in the Guild",
                ephemeral: true,
              });
            let members = [invited.id];
            GuildInformation.GuildMembers.forEach((m) => {
              members.push(m);
            });
            await DB.updateOne(
              {
                GuildID: guildID,
              },
              {
                GuildMembers: members,
              }
            );
            await UserDB.updateOne(
              {
                UserID: invited.id,
              },
              {
                GuildID: guildID,
              }
            );
            interaction.reply({
              embeds: [
                Embed.setColor("GREEN").setDescription(
                  `Successfully added ${invited} to the Guild`
                ),
              ],
            });

            break;
          case "kick":
            const kicked = client.users.cache.get(value);
            if (!kicked)
              return interaction.reply({
                content: "There is no such user with such ID",
                ephemeral: true,
              });
            const kickedProfile = await UserDB.findOne({ UserID: kicked.id });
            if (!kickedProfile)
              return interaction.reply({
                content: "I can't find this user",
                ephemeral: true,
              });
            if (kickedProfile.GuildID !== Profile.GuildID)
              return interaction.reply({
                content: "This user not in the Guild",
                ephemeral: true,
              });
            let Gmembers = GuildInformation.GuildMembers;
            Gmembers.splice(Gmembers.indexOf(kicked.id), 1);
            await DB.updateOne(
              {
                GuildID: guildID,
              },
              {
                GuildMembers: Gmembers,
              }
            );
            await UserDB.updateOne(
              {
                UserID: kicked.id,
              },
              {
                GuildID: null,
              }
            );
            interaction.reply({
              embeds: [
                Embed.setColor("GREEN").setDescription(
                  `Successfully kicked ${kicked} from the Guild`
                ),
              ],
            });

            break;
          case "deleteguild":
            if (GuildInformation.OwnerID !== user.id)
              return interaction.reply({
                content: "You are not allowed to delete this guild.",
              });
            if (value.toLowerCase() !== "confirm")
              return interaction.reply({
                content:
                  "if you want to delete a guild, write in the value field confirm.",
              });
            const guildName = await DB.findOne({ GuildID: guildID });
            GuildInformation.GuildMembers.forEach(
              async (m) =>
                await UserDB.updateOne({ UserID: m }, { GuildID: null })
            );
            await UserDB.updateOne(
              { UserID: user.id },
              { AvailableToGuildCreate: true }
            );
            await DB.deleteOne({ GuildID: guildID });
            interaction.reply({
              embeds: [
                Embed.setColor("ORANGE").setDescription(
                  `✅ Guild \`${guildName.GuildName}\` has been deleted.\nIf you want to create a new Guild /guild create [name] [description].`
                ),
              ],
            });
            break;
        }
        break;
    }
  },
};

function makeid(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
