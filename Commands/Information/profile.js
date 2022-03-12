const { MessageEmbed, Client, CommandInteraction } = require("discord.js");
const DB = require("../../Schemas/ProfileDB");
const Emojis = require("../../Container/src/emoji.json");
const Ranks = require("../../Container/src/ranks.json");
const GuildDB = require("../../Schemas/GuildCreateDB");
const { promisify } = require("util");
const { glob } = require("glob");
const PG = promisify(glob);
const fs = require("fs");
const QuickChart = require("quickchart-js");

module.exports = {
  name: "profile",
  description: "Get an information about the User or Youself",
  permission: "USE_APPLICATION_COMMANDS",
  options: [
    {
      name: "userid",
      description: "Specify user ID that you want to get information about",
      required: false,
      type: "STRING",
    },
  ],
  /**
   *
   * @param {CommandInteration} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    await interaction.deferReply();
    const { options, user } = interaction;
    const Member = options.getString("userid") || user.id;

    const Profile = await DB.findOne({ UserID: Member });

    if (!Profile)
      return interaction.editReply({
        content: "There is no such user",
        ephemeral: true,
      });
    const member = client.users.cache.get(Profile.UserID);
    let memberIsPlus = Profile.isPlus;
    let emoji;
    let iconPng;
    if (memberIsPlus) {
      if (Profile.Rank === "Owner") {
        emoji = Emojis.Owner_plus;
        iconPng = Ranks.Owner_plus;
      }
      if (Profile.Rank === "Moon_plus") {
        emoji = Emojis.Moon_plus;
        iconPng = Ranks.Moon_plus;
      }
      if (Profile.Rank === "Partner") {
        emoji = Emojis.Partner_plus;
        iconPng = Ranks.Partner_plus;
      }
      if (Profile.Rank === "Staff") {
        emoji = Emojis.Staff_plus;
        iconPng = Ranks.Staff_plus;
      }
    } else {
      if (Profile.Rank === "Owner") {
        emoji = Emojis.Owner;
        iconPng = Ranks.Owner;
      }
      if (Profile.Rank === "Member") {
        emoji = Emojis.Member;
        iconPng = Ranks.Member;
      }
      if (Profile.Rank === "Admin") {
        emoji = Emojis.Admin;
        iconPng = Ranks.Admin;
      }
      if (Profile.Rank === "Developer") {
        emoji = Emojis.Developer;
        iconPng = Ranks.Developer;
      }
      if (Profile.Rank === "LunarPhase") {
        emoji = Emojis.LunarPhase;
        iconPng = Ranks.LunarPhase;
      }
      if (Profile.Rank === "Partner") {
        emoji = Emojis.Partner;
        iconPng = Ranks.Partner;
      }
      if (Profile.Rank === "Staff") {
        emoji = Emojis.Staff;
        iconPng = Ranks.Staff;
      }
    }
    let guildText = String();
    if (Profile.GuildID) {
      const temp = await GuildDB.findOne({ GuildID: Profile.GuildID });
      if (!temp) return;
      guildText = `Guild: **${temp.GuildName}**`;
    }
    let embedFooter = [];
    const UserXPData = [];
    const Labels = [];
    const DescriptionText = [];
    const files = fs.readdirSync(
      `${process.cwd()}/Container/Logs/User/${
        new Date().toString().split(" ")[3]
      }/${new Date().toString().split(" ")[1]}`
    );
    files.forEach(async (file) => {
      if (!file.endsWith(".json")) return;
      const dataJSON = fs.readFileSync(
        `${process.cwd()}/Container/Logs/User/${
          new Date().toString().split(" ")[3]
        }/${new Date().toString().split(" ")[1]}/${file}`,
        "utf-8"
      );
      UserXPData.push(
        Math.floor(Number(JSON.parse(dataJSON)["670233042715148319"]["XP"]))
      );
      Labels.push(
        new Date(
          `${file.split(".")[0].split(" ")[0]} ${(
            Number(file.split(".")[0].split(" ")[1]) + 1
          ).toString()} ${new Date().toUTCString().split(" ")[3]}`
        )
          .toISOString()
          .split("T")[0]
      );

      DescriptionText.push(
        `\`•\`${
          new Date(
            `${file.split(".")[0].split(" ")[0]} ${(
              Number(file.split(".")[0].split(" ")[1]) + 1
            ).toString()} ${new Date().toUTCString().split(" ")[3]}`
          )
            .toISOString()
            .split("T")[0]
        }: **${Math.floor(
          Number(JSON.parse(dataJSON)["670233042715148319"]["XP"])
        )}**`
      );
    });
    const chart = new QuickChart();
    chart.setConfig({
      type: "line",
      data: {
        labels: Labels,
        datasets: [
          {
            label: "EXP",
            data: UserXPData,
            borderColor: "rgb(40, 166, 70)",
            fill: {
              target: true,
              above: "rgb(40, 166, 70)",
              below: "rgb(40, 166, 70)",
            },
            tension: 0.1,
          },
        ],
      },
    });
    chart.setBackgroundColor("transparent");
    const url = await chart.getShortUrl();
    const Embed = new MessageEmbed()
      .setColor("BLURPLE")
      .setAuthor({
        name: `${member.username || "Something went wrong"}`,
        iconURL: `attachment://${iconPng}`,
      })
      .setImage(url)
      .addFields({ name: "UEXP History", value: DescriptionText.join("\n") })
      .setDescription(
        // `${emoji} ${member.username || "Something went wrong"}
        `
        ${guildText}
        Level: **${Profile.Level}**
        XP: **${Math.floor(
          5 * (Profile.Level ^ 2) +
            50 * Profile.Level +
            100 -
            (5 * (Profile.Level ^ 2) + 50 * Profile.Level + 100 - Profile.XP)
        )}/${Math.floor(5 * (Profile.Level ^ 2) + 50 * Profile.Level + 100)}**
        
      `
      );
    interaction.editReply({
      embeds: [Embed],
      files: [`Assets/Ranks/${iconPng}`],
    });
  },
};

Date.prototype.getWeekOfMonth = function (exact) {
  var month = this.getMonth(),
    year = this.getFullYear(),
    firstWeekday = new Date(year, month, 1).getDay(),
    lastDateOfMonth = new Date(year, month + 1, 0).getDate(),
    offsetDate = this.getDate() + firstWeekday - 1,
    index = 1, // start index at 0 or 1, your choice
    weeksInMonth = index + Math.ceil((lastDateOfMonth + firstWeekday - 7) / 7),
    week = index + Math.floor(offsetDate / 7);
  if (exact || week < 2 + index) return week;
  return week === weeksInMonth ? index + 5 : week;
};
