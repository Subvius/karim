const { model, Schema } = require("mongoose");

module.exports = model(
  "userInformation",
  new Schema({
    UserID: String,
    UserName: String,
    isPlus: Boolean,
    Rank: String,
    isBlackListed: Boolean,
    Level: Number,
    XP: Number,
    GuildID: String,
    AvailableToGuildCreate: Boolean,
  })
);
