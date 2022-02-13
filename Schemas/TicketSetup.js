const { model, Schema } = require("mongoose");

module.exports = model(
  "TicketSetup",
  new Schema({
    GuildID: String,
    Channel: String,
    Category: String,
    Transcripts: String,
    Handlers: String,
    Everyone: String,
    Buttons: [String],
  })
);