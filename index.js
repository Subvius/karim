const { Client, Collection } = require("discord.js");
const client = new Client({ intents: 32767 });
const { Token } = require("./config.json");

client.commands = new Collection();
const { DisTube } = require("distube");
const { SpotifyPlugin } = require("@distube/spotify");
client.filters = new Collection();
client.filtersLog = new Collection();

client.distube = new DisTube(client, {
  emitNewSongOnly: true,
  leaveOnFinish: true,
  emitAddSongWhenCreatingQueue: false,
  plugins: [new SpotifyPlugin()],
});
module.exports = client;

require("./Handlers/Events")(client);
require("./Handlers/Commands")(client);
require("./Systems/GiveawaysSys")(client);

client.login(Token);
