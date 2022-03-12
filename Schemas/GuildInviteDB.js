const { model, Schema } = require("mongoose");

module.exports = model(
  "guildinvites",
  new Schema({
    InviterID: String,
    InvitedID: String,
    MessageID: String,
    GuildID: String,
  })
);
