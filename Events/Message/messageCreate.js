const { Message, MessageEmbed, WebhookClient, Client } = require("discord.js");
const DB = require("../../Schemas/ProfileDB");
const Config = require("../../config.json");
// const profile = require("../../Commands/Information/profile");
const GuildDB = require("../../Schemas/clientGuildCreateDB");
const scamLinks = require("../../Container/src/scamLinks.json");
const GuildSystemDB = require("../../Schemas/GuildCreateDB");

module.exports = {
  name: "messageCreate",
  /**
   *
   * @param {Message} message
   * @param {Client} client
   */
  async execute(message, client) {
    if (message.author.bot) return;
    if (
      scamLinks.some((word) => message.content.toLowerCase().includes(word))
    ) {
      message.delete();
      const embed = new MessageEmbed()
        .setTitle("Scam detected")
        .setColor("RED")
        .setThumbnail(`${message.author.displayAvatarURL({ dynamic: true })}`)
        .setDescription(`Please don't send any scam messages.`)
        .addField(
          "User:",
          `\`\`\`${message.author.tag} (${message.author.id})\`\`\``
        )
        .addField("Message Content:", `\`\`\`${message.content}\`\`\``);
      // .setFooter({ text: "Automatically delete messages after 1 minute" });
      const GuildInformation = await GuildDB.findOne({
        GuildID: message.guild.id,
      });
      const logChannel = message.guild.channels.cache.get(
        GuildInformation.LogChannel
      );
      if (!logChannel) {
        await GuildDB.updateOne(
          { GuildID: message.guild.id },
          { LogChannel: null }
        );
        return message.channel.send({
          embeds: [
            embed.setFooter({
              text: "If you want to show this message in the Logging channel:\n/setChannel [📄 Logs Channel] [channel]",
            }),
          ],
        });
      } else {
        return logChannel.send({ embeds: [embed] });
      }
    }

    const MemberId = message.author.id;
    const Profile = await DB.findOne({ UserID: MemberId });
    if (!Profile) {
      await DB.create({
        UserID: MemberId,
        UserName: message.author.username,
        isPlus: false,
        Rank: "Member",
        isBlackListed: false,
        Level: 0,
        XP: 0,
        GuildID: null,
        AvailableToGuildCreate: true,
      });
    } else {
      const XPplus = (Math.random() + 0.1) * 10;
      let XPcurrent = Profile.XP + XPplus;
      let levelCurrent = Profile.Level;

      // console.log(
      //   5 * (levelCurrent ^ 2) + 50 * levelCurrent + 100 - Profile.XP
      // );
      let flag = false;
      while (5 * (levelCurrent ^ 2) + 50 * levelCurrent + 100 - XPcurrent < 0) {
        levelCurrent++;
        flag = true;
      }
      await DB.updateOne(
        {
          UserID: MemberId,
        },
        {
          Level: levelCurrent,
          XP: XPcurrent,
        }
      );
      let guildSys = await GuildSystemDB.findOne({ GuildID: Profile.GuildID });
      await GuildSystemDB.updateOne(
        { GuildID: Profile.GuildID },
        { GuildXP: guildSys.GuildXP + XPplus * 0.5 }
      );
      const guildLevelUp = (level) => {
        return level * level * 100;
      };
      guildSys.GuildXP = guildSys.GuildXP + XPplus * 0.5;

      while (guildSys.GuildXP > guildLevelUp(guildSys.GuildLevel)) {
        await GuildSystemDB.updateOne(
          { GuildID: Profile.GuildID },
          { GuildLevel: guildSys.GuildLevel + 1 }
        );
        guildSys.GuildLevel++;
        message.reply({
          embeds: [
            new MessageEmbed()
              .setAuthor({
                name: message.author.username,
                iconUrl: message.author.avatarURL({ size: 512, dynamic: true }),
              })
              .setDescription(
                `Congratulations!\nYour Guild leveled up to ${guildSys.GuildLevel}`
              ),
          ],
        });
      }
      const GuildProfile = await GuildDB.findOne({ GuildID: message.guild.id });
      if (flag) {
        const levelChannel = message.guild.channels.cache.get(
          GuildProfile.LevelUpChannel
        );
        if (levelChannel) {
          levelChannel.send({
            embeds: [
              new MessageEmbed()
                .setColor("RANDOM")
                .setAuthor({
                  name: message.author.username,
                  iconURL: message.author.avatarURL({
                    size: 512,
                    dynamic: true,
                  }),
                })
                .setDescription(
                  `${message.author} Leveled up to \`${levelCurrent}\`. GG!`
                ),
            ],
          });
        } else {
          message.channel
            .send({
              embeds: [
                new MessageEmbed()
                  .setColor("RANDOM")
                  .setAuthor({
                    name: message.author.username,
                    iconURL: message.author.avatarURL({
                      size: 512,
                      dynamic: true,
                    }),
                  })
                  .setDescription(
                    `${message.author} Leveled up to \`${levelCurrent}\`. GG!`
                  ),
              ],
            })
            .then((msg) => {
              setTimeout(() => msg.delete(), 10000);
            })
            .catch();
        }
      }
    }
    if (message.author.id === "670233042715148319") {
      if (message.content.startsWith(".setRank")) {
        const managerCommand = message.content.split(" ");
        const memberId = managerCommand[1];
        const rank = managerCommand[2];

        if (!rank || !rank in Config.Ranks) {
          return message.reply({
            content: `⛔ Invalid usage!\n Make sure You have provided the Rank and  User that exists (List of ranks - ${Config.Ranks.join(
              ", "
            )})\nUsage: .setRank <userID> <rank>`,
          });
        }
        const Data = await DB.findOne({ UserID: memberId });
        if (!Data)
          return message.reply({
            content: "There is no such user ID",
          });
        if (rank === Data.Rank) {
          return message.reply({
            content: "This user already has this rank",
          });
        }
        await DB.updateOne({ UserID: memberId }, { Rank: rank }).then(() => {
          return message.reply({ content: "Successfully updated user Rank" });
        });
      } else if (message.content.startsWith(".setPlus")) {
        const managerCommand = message.content.split(" ");
        const memberId = managerCommand[1];
        const Plus = managerCommand[2].toLowerCase();

        if (!Plus || !typeof Plus == "boolean") {
          return message.reply({
            content: `⛔ Invalid usage!\n Make sure You have provided the Boolean (true or false) and  User that exists\nUsage: .setPlus <userID> <true OR false>`,
          });
        }
        const Data = await DB.findOne({ UserID: memberId });
        if (!Data)
          return message.reply({
            content: "There is no such user ID",
          });
        if (Plus == String(Data.isPlus)) {
          return message.reply({
            content: "Nothing to change",
          });
        }
        await DB.updateOne({ UserID: memberId }, { isPlus: Plus }).then(() => {
          return message.reply({
            content: "Successfully updated user Plus status",
          });
        });
      }
    }
  },
};
