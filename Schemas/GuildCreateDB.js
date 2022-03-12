const { model, Schema } = require("mongoose");

module.exports = model(
  "GuildSystem", // Name of the guild system in the database
  new Schema({
    OwnerID: String, // Guild owner ID
    GuildID: String, // Guild ID
    GuildName: String, // Guild name
    GuildLevel: Number, // Guild level
    GuildXP: Number, // Guild xp
    GuildMembers: [String], // List of guild members
    GuildAdmins: [String], // List of guild admins
    GuildModerators: [String], // List of guild mods
    GuildLogo: String, // Path to the logo file
    GuildMaxMembers: Number, // Maximum number of members
    GuildDescription: String, // Guild description
    GuildXPBoost: Number, // Guild xp boost for chat
    GuildNews: [String], // List of guild news
    GuildTag: String, // Guild tag
  })
);
