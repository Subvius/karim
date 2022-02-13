const { CommandInteraction, MessageEmbed } = require("discord.js");
const fetch = require("node-fetch");



module.exports = {
    name: "server",
    description: "Shows information about the given Minecraft server",
    options: [
        {
            name: "ip", 
            description: "Ip of the server ( mc.hypixel.net or xxx.xxx.x.x port required)", 
            type: "STRING", 
            required: true
        },
        {
            name: "port", 
            description: "Port of the server default: 25565", 
            type: "STRING", 
            required: false
        }
        
    ],
    /**
     * 
     * @param {CommandInteraction} interaction 
     */
    async execute(interaction) {
        
        const mcip = interaction.options.getString("ip");
        const mcport = interaction.options.getString("port") || "25565";

        fetch(`https://api.mcsrvstat.us/2/${mcip}`)
        .then((response) => {
            return response.json();
          })
        .then((body) => {
            if(body.online === false) {
                const e1 = new MessageEmbed()
                .setColor("RANDOM")
                .setAuthor("MC SERVER", interaction.member.user.displayAvatarURL ({dynamic: true}))
                .setDescription(`Status <a:Offline:766303914654957610>`)
                .addField(`**${mcip}** is Currently Offline :sad:`, "If this is a mistake join the support server")
                .setTimestamp();
                interaction.reply({embeds: [e1]})
            } else {
                const e2 = new MessageEmbed()
                .setColor("RANDOM")
                .setThumbnail(`https://mc-api.net/v3/server/favicon/${mcip}`)
                .setAuthor(`MC SERVER`, interaction.member.user.displayAvatarURL ({dynamic: true}) || "none")
                .addField("Status", "<a:Online:766303827850690600>"|| "none")
                .addField("IP", body.ip|| "none")
                .addField("Hostname", body.hostname|| "none")
                .addField("Players", `${body.players.online}/${body.players.max}`|| "none")
                .addField("Software", body.software|| "none")
                .addField("Version", body.version)
                .addField("Motd", `${body.motd.clean[0]}\n${body.motd.clean[1]}`|| "none")
                .setTimestamp()
                .setImage(`http://status.mclive.eu/${mcip}/${mcip}/${mcport}/banner.png`|| "none")
                interaction.reply({embeds: [e2]})
            } 
        })

    } 
}