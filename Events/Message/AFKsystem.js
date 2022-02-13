const { Message, MessageEmbed } = require("discord.js");
const DB = require("../../Schemas/AFKSYSTEM")

module.exports = { 
    name: "messageCreate",
    /**
     * 
     * @param {*} message 
     */
    async execute(message) {
        if (message.author.bot) return;

        // await DB.deleteOne({GuildID: guild.id, UserID: message.author.id});

        if (message.mentions.members.size) {
            const Embed = new MessageEmbed()
            .setColor("RED")
            message.mentions.members.forEach((m) => { 
                DB.findOne({GuildID: message.guild.id, UserID: m.id}, async (err, data) => { 
                    if(err) throw err
                    if(data)
                    Embed.setDescription(`${m} went AFK <t:${data.Time}:R>\n **Status**: ${data.Status}`);
                    return message.reply({embeds: [Embed]})
                })
            })

        }

    }
}

