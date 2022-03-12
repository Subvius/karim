const { model, Schema } = require("mongoose");

module.exports = model(
  "Guilds",
  new Schema({
    GuildID: String, // Guild ID
    LogChannel: String, // Log channel ID
    LevelUpChannel: String, // Level up channel ID
    WelcomeChannel: String, // Welcome channel ID
    LeaveChannel: String, // Leave channel ID
  })
);
