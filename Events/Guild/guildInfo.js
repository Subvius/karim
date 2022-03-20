const {
  ButtonInteraction,
  MessageEmbed,
  MessageActionRow,
  MessageButton,
  Client,
} = require("discord.js");
const DB = require("../../Schemas/GuildCreateDB");
const InviteDB = require("../../Schemas/GuildInviteDB");
const UserDB = require("../../Schemas/ProfileDB");

module.exports = {
  name: "interactionCreate",
  /**
   *
   * @param {ButtonInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    if (!interaction.isButton) return;

    const { user, customId, message } = interaction;
    if (!["acceptinvite", "declineinvite"].includes(customId)) return;
    const InviteData = await InviteDB.findOne({
      MessageID: interaction.message.id,
    });
    if (!InviteData) return;

    const inviter = client.users.cache.get(InviteData.InviterID);
    const GuildInfo = await DB.findOne({ GuildID: InviteData.GuildID });
    const Profile = await UserDB.findOne({ UserID: user.id });
    if (!Profile) return;
    if (!GuildInfo)
      return user.send({ content: "This Guild is no longer exists." });
    console.log(user.id);
    switch (customId) {
      case "acceptinvite":
        let members = [user.id];
        GuildInfo.GuildMembers.forEach((m) => {
          members.push(m);
        });
        await DB.findOneAndUpdate({
          GuildID: InviteData.GuildID,
          GuildMembers: members,
        });
        await InviteDB.deleteOne({ MessageID: interaction.message.id });
        console.log(user.id);
        await UserDB.findOneAndUpdate({
          UserID: user.id,
          GuildID: InviteData.GuildID,
        });
        try {
          inviter.send({
            embeds: [
              new MessageEmbed()
                .setColor(`DARK_ORANGE`)
                .setDescription(
                  `${user} accepted your invite and now he is Guild Member`
                ),
            ],
          });
        } catch (err) {}
        break;
      case "declineinvite":
        try {
          await interaction.message.delete();
          inviter.send({
            embeds: [
              new MessageEmbed()
                .setColor(`DARK_AQUA`)
                .setDescription(
                  `${user.username}#${user.discriminator} declined your invite`
                ),
            ],
          });
        } catch (err) {}
        break;
    }
  },
};
