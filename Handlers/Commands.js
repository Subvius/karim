const { Perms } = require("../Validation/Permissions");
const { Client } = require("discord.js");
const { promisify } = require("util");
const { glob } = require("glob");
const PG = promisify(glob);
const Ascii = require("ascii-table");

/**
 * @param {Client} client
 */
module.exports = async (client) => {
  const Table = new Ascii("Commands Loaded");

  CommandsArray = [];

  (await PG(`${process.cwd()}/Commands/*/*.js`)).map(async (file) => {
    const command = require(file);

    if (!command.name)
      return Table.addRow(file.split("/")[7], "🔸FAILED", "Missing a name.");

    if (command.type !== "USER" && !command.description)
      return Table.addRow(command.name, "🔸FAILED", "Missing a description.");

    if (command.permission) {
      if (Perms.includes(command.permission)) command.defaultPermission = false;
      else
        return Table.addRow(command.name, "🔸FAILED", "Permission is invalid");
    }

    client.commands.set(command.name, command);
    CommandsArray.push(command);

    await Table.addRow(command.name, "🔹SUCCESSFUL");
  });

  console.log(Table.toString());

  // PERMISSIONS CHECK //

  client.on("ready", async () => {
    // const MainGuld = await client.guilds.cache.get("817436827660845147"); // MainGuld
    const MainGuld = await client.guilds.cache.get("947916422590365696"); // TestGuild
    MainGuld.commands.set(CommandsArray).then(async (command) => {
      const Roles = (commandName) => {
        const cmdPerms = CommandsArray.find(
          (c) => c.name === commandName
        ).permission;
        if (!cmdPerms) return null;

        return MainGuld.roles.cache
          .filter((r) => r.permissions.has(cmdPerms) && !r.managed)
          .first(10);
      };

      const fullPermissions = command.reduce((accumulator, r) => {
        const roles = Roles(r.name);
        if (!roles) return accumulator;

        const permissions = roles.reduce((a, r) => {
          return [...a, { id: r.id, type: "ROLE", permission: true }];
        }, []);

        return [...accumulator, { id: r.id, permissions }];
      }, []);

      await MainGuld.commands.permissions.set({ fullPermissions });
    });
  });
};
