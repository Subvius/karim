const { MessageEmbed, Client, MessageAttachment } = require("discord.js");
const QuickChart = require("quickchart-js");
const mongoose = require("mongoose");
const { connection } = require("mongoose");
const { Database, STATUSMSG, STATUSCHANNEL } = require("../../config.json");
const { promisify } = require("util");
const { glob } = require("glob");
const PG = promisify(glob);
const fs = require("fs");
const UsersDB = require("../../Schemas/ProfileDB");
const path = require("path");

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    console.log("The client is now ready");
    // client.user.setStatus('dnd');
    // client.user.setActivity('Version: 1.0 🎉', {type: 'WATCHING'});
    const Labels = [];
    let Time = new Date().toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
    Labels.push(Time);
    const ClientPing = [Math.floor(Math.random() * 98) + 2];
    client.user.setPresence({
      activities: [
        {
          name: "Version: 1.0 🎉",
          type: "STREAMING",
          url: "https://www.twitch.tv/monstercat",
        },
      ],
      status: "idle",
    });

    if (!Database) return;
    mongoose
      .connect(Database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => {
        console.log("The client is now connected to the database!");
      })
      .catch((err) => {
        console.log(err);
      });

    require("../../Systems/LockdownSys")(client);
    require("../../Systems/ChatFilterSys")(client);
    const Embed = new MessageEmbed().setColor("AQUA");
    client.channels.fetch(STATUSCHANNEL).then((channel) =>
      channel.messages.fetch(STATUSMSG).then((message) => {
        setInterval(async () => {
          if (Labels.length >= 30) {
            Labels.shift();
            ClientPing.shift();
          }
          let Time = new Date().toLocaleString("en-US", {
            hour: "numeric",
            minute: "numeric",
            hour12: true,
          });
          Labels.push(Time);
          ClientPing.push(client.ws.ping);
          let ColorPing = "#F00000";
          let PingEmoji = "";
          if (client.ws.ping >= 250) {
            ColorPing = "#FF0000";
            PingEmoji = "<:connection3:934490443947835542>";
          } else if (client.ws.ping < 250 && client.ws.ping >= 200) {
            ColorPing = "#ff4300";
            PingEmoji = "<:connection2:934486676938567712>";
          } else if (client.ws.ping < 200 && client.ws.ping >= 100) {
            ColorPing = "#ffa700";
            PingEmoji = "<:connection1:934486676934385735>";
          } else if (client.ws.ping < 100) {
            ColorPing = "#2ece2e";
            PingEmoji = "<:connection:934486676804370432>";
          }

          const chart = new QuickChart();
          chart.setConfig({
            type: "line",
            data: {
              labels: Labels,
              datasets: [
                {
                  label: "API STATUS",
                  data: ClientPing,
                  borderColor: "rgb(57, 116, 242)",
                  fill: {
                    target: "origin",
                    above: "rgb(255, 0, 0)",
                    below: "rgb(0, 0, 255)",
                  },
                  tension: 0.1,
                },
              ],
            },
          });
          chart.setBackgroundColor("transparent");
          const url = await chart.getShortUrl();
          const Embed = new MessageEmbed()
            .setImage(url)
            .setColor("#3974f2")
            .setTitle(`${PingEmoji} Lunar API Status`)
            .setDescription(
              `**Ping**:\`${client.ws.ping}\`\n**Uptime**: <t:${parseInt(
                client.readyTimestamp / 1000
              )}:R>`
            )
            .setURL("https://lunar-bot.xyz/status")
            .setTimestamp(Date.now());
          message.edit({
            embeds: [Embed],
          });
        }, 1500000);
        setInterval(async () => {
          // (await PG(`${process.cwd()}/Container/Logs/User/*.json`)).map(
          //   (file) => {
          //     console.log(file);
          //   }
          // );
          if (
            fs.existsSync(
              `${process.cwd()}/Container/Logs/User/${
                new Date().toString().split(" ")[3]
              }`
            )
          ) {
            if (
              // new Date().toString().split(" ")[2] === "01" &&
              fs.existsSync(
                `${process.cwd()}/Container/Logs/User/${
                  new Date().toString().split(" ")[3]
                }/${new Date().toString().split(" ")[1]}`
              )
            ) {
              if (new Date().toLocaleTimeString() >= "23:00:00") {
                const data = {};
                console.log(
                  (await UsersDB.find()).forEach((p) => (data[p.UserID] = p))
                );
                fs.exists(
                  `${process.cwd()}/Container/Logs/User/${
                    new Date().toString().split(" ")[3]
                  }/${new Date().toString().split(" ")[1]}/${
                    new Date().toString().split(" ")[1]
                  } ${new Date().toString().split(" ")[2]}.json`,
                  function (exists) {
                    if (exists) {
                    } else {
                      fs.writeFile(
                        `${process.cwd()}/Container/Logs/User/${
                          new Date().toString().split(" ")[3]
                        }/${new Date().toString().split(" ")[1]}/${
                          new Date().toString().split(" ")[1]
                        } ${new Date().toString().split(" ")[2]}.json`,
                        JSON.stringify(data, null, 2),
                        function callback() {}
                      );
                    }
                  }
                );
              }
            } else {
              let callback = () => {};
              fs.mkdir(
                `${process.cwd()}/Container/Logs/User/${
                  new Date().toString().split(" ")[3]
                }/${new Date().toString().split(" ")[1]}`,
                callback
              );
            }
          } else {
            let callback = () => {};
            fs.mkdir(
              `${process.cwd()}/Container/Logs/User/${
                new Date().toString().split(" ")[3]
              }`,
              callback
            );
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
            ].forEach(async (dir) => {
              fs.mkdirSync(
                `${process.cwd()}/Container/Logs/User/${
                  new Date().toString().split(" ")[3]
                }/${dir}`
              );
            });
          }

          // if (new Date().toLocaleTimeString() >= "00:00:00") return;
        }, 3 * 1000);
      })
    );
  },
};

function switchTo(val) {
  var status = " ";
  switch (val) {
    case 0:
      status = `🔴 DISCONNECTED`;
      break;
    case 1:
      status = `🟢 CONNECTED`;
      break;
    case 2:
      status = `🟠 CONNECTING`;
      break;
    case 3:
      status = `🟡 DISCONNECTING`;
      break;
  }

  return status;
}
