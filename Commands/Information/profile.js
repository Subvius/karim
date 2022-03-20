const {
  MessageEmbed,
  Client,
  CommandInteraction,
  MessageButton,
  MessageActionRow,
} = require("discord.js");
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
    let previousData = 0;
    let WeeklyStats = 0;
    let MonthlyStats = 0;
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
        Math.floor(Number(JSON.parse(dataJSON)["670233042715148319"]["XP"])) -
          previousData
      );
      MonthlyStats +=
        Math.floor(Number(JSON.parse(dataJSON)["670233042715148319"]["XP"])) -
        previousData;

      Labels.push(
        new Date(
          `${file.split(".")[0]} ${new Date().toUTCString().split(" ")[3]}`
        )
          .toISOString()
          .split("T")[0]
      );

      DescriptionText.push(
        `\`•\` ${
          new Date(
            `${file.split(".")[0]} ${new Date().toUTCString().split(" ")[3]}`
          )
            .toISOString()
            .split("T")[0]
        }: **${Math.floor(
          Number(JSON.parse(dataJSON)["670233042715148319"]["XP"])
        )}** | ${
          Math.floor(Number(JSON.parse(dataJSON)["670233042715148319"]["XP"])) -
          previousData
        }`
      );
      previousData = Math.floor(
        Number(JSON.parse(dataJSON)["670233042715148319"]["XP"])
      );
    });
    const chart = new QuickChart();
    while (UserXPData.length > 7) {
      Labels.shift();
      UserXPData.shift();
    }
    UserXPData.forEach((num) => {
      WeeklyStats += num;
    });
    chart.setConfig({
      type: "line",
      data: {
        labels: Labels,
        datasets: [
          {
            label: "EXP",
            data: UserXPData,
            backgroundColor: "rgba(40, 166, 70, 0.2)",
            borderColor: "rgb(40, 166, 70)",
            lineTension: 0.4,
          },
        ],
      },
      options: {
        title: {
          align: "end",
          display: true,
          position: "left",
          text: "Raw UEXP",
        },
        scales: {
          xAxes: [
            {
              scaleLabel: {
                display: true,
                labelString: "Date",
              },
            },
          ],
        },
      },
    });
    chart.setBackgroundColor("transparent");
    const url = await chart.getShortUrl();
    DescriptionText.reverse();
    DescriptionText.push(
      `\n\`•\` Weekly: **${WeeklyStats}**\n\`•\` Monthly: **${MonthlyStats}**`
    );
    const Embed = new MessageEmbed()
      .setColor("BLURPLE")
      .setAuthor({
        name: `${member.username || "Something went wrong"}`,
        iconURL: `attachment://${iconPng}`,
      })
      .setImage(url)
      .addFields({
        name: "UEXP History (Total | Per Day)",
        value: DescriptionText.join("\n"),
      })
      .setDescription(
        // `${emoji} ${member.username || "Something went wrong"}
        `
        ${guildText}\nLevel: **${Profile.Level}**\nXP: **${Math.floor(
          5 * (Profile.Level ^ 2) +
            50 * Profile.Level +
            100 -
            (5 * (Profile.Level ^ 2) + 50 * Profile.Level + 100 - Profile.XP)
        )}/${Math.floor(5 * (Profile.Level ^ 2) + 50 * Profile.Level + 100)}**\n
      `
      );
    const pageType = {};
    const id = user.id;

    const getRow = (id) => {
      const row = new MessageActionRow();
      row.addComponents([
        new MessageButton()
          .setCustomId("overal")
          .setStyle("SECONDARY")
          .setLabel("Overal")
          .setDisabled(pageType[id] === "overal"),
        new MessageButton()
          .setCustomId("permonth")
          .setStyle("SECONDARY")
          .setLabel("UEXP per Month")
          .setDisabled(pageType[id] === "permonth"),
      ]);
      return row;
    };
    pageType[id] = pageType[id] || "overal";
    interaction.reply({
      embeds: [Embed],
      files: [`Assets/Ranks/${iconPng}`],
      components: [getRow(id)],
    });
    // Bar chart //
    const filter = (i) => i.user.id === user.id;
    const time = 1000 * 60 * 5;
    let collector;
    const monthLabels = [];
    const tempEXP = {};
    const Exp = [];
    const dirs = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ].forEach((dir) => {
      if (new Date(`${dir} 2022`) > Date.now()) return;
      console.log(dir);
      monthLabels.push(dir);
      let dirEXP = 0;
      const files = fs
        .readdirSync(
          `${process.cwd()}/Container/Logs/User/${
            new Date().toString().split(" ")[3]
          }/${dir}`
        )
        .forEach((file) => {
          if (!file.endsWith(".json")) return;
          const dataJSON = fs.readFileSync(
            `${process.cwd()}/Container/Logs/User/${
              new Date().toString().split(" ")[3]
            }/${dir}/${file}`,
            "utf-8"
          );
          dirEXP += Math.floor(
            Number(JSON.parse(dataJSON)["670233042715148319"]["XP"])
          );
        });
      Exp.push(dirEXP);
    });
    const monthChart = new QuickChart();
    monthChart.setConfig({
      type: "bar",
      data: {
        labels: monthLabels,
        datasets: [
          {
            label: "UEXP Per Month",
            backgroundColor: [
              "rgba(197, 19, 20, 0.2)",
              "rgba(162, 85, 222, 0.2)",
              "rgba(95, 190, 235, 0.2)",
              "rgba(255, 255, 255, 0.2)",
              "rgba(42, 119, 11, 0.2)",
              "rgba(202, 127, 198, 0.2)",
              "rgba(255, 1, 0, 0.2)",
              "rgba(92, 234, 34, 0.2)",
              "rgba(0, 7, 107, 0.2)",
              "rgba(255, 3, 193, 0.2)",
              "rgba(255, 204, 0, 0.2)",
              "rgba(83, 115, 254, 0.2)",
            ],
            borderColor: [
              "rgb(197,19,20)",
              "rgb(162,85,222)",
              "rgb(95,190,235)",
              "rgb(255,255,255)",
              "rgb(42,119,11)",
              "rgb(202,127,198)",
              "rgb(255,1,0)",
              "rgb(92,234,32)",
              "rgb(0,7,107)",
              "rgb(254,2,192)",
              "rgb(255,203,0)",
              "rgb(83,115,254)",
            ],
            borderWidth: 1,
            data: Exp,
          },
        ],
      },
      options: {
        title: {
          align: "end",
          display: true,
          position: "left",
          text: "UEXP Per Month",
        },
        scales: {
          xAxes: [
            {
              scaleLabel: {
                display: true,
                labelString: "Date",
              },
            },
          ],
        },
      },
    });
    monthChart.setBackgroundColor("transparent");
    const monthURL = await monthChart.getShortUrl();

    collector = interaction.channel.createMessageComponentCollector({
      filter,
      time,
    });

    collector.on("collect", (btnIn) => {
      if (!btnIn) return;
      try {
        btnIn.deferUpdate();
        if (!["overal", "permonth"].includes(btnIn.customId)) return;
        if (btnIn.customId === "overal") {
          pageType[id] = "overal";
          interaction.editReply({
            embeds: [Embed.setImage(url)],
            components: [getRow(id)],
            files: [`Assets/Ranks/${iconPng}`],
          });
        } else if (btnIn.customId === "permonth") {
          pageType[id] = "permonth";
          interaction.editReply({
            embeds: [Embed.setImage(monthURL)],
            components: [getRow(id)],
            files: [`Assets/Ranks/${iconPng}`],
          });
        }
      } catch {}
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
