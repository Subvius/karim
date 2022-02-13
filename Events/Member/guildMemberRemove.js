const {MessageEmbed, WebhookClient, GuildMember } = require("discord.js");


module.exports = {
    name: 'guildMemberRemove',
    /**
     * 
     * @param {GuildMember} member 
     */
    execute(member) {
        const { user, guild} = member;


        const Loger = new WebhookClient({
            id: "929398046939283537",
            token: 'utXkUVrT42EIaeVhu_fFQ0OrSYxb6_ftqKh03dNObyHHGMzH_pJGKv6n3YzNlscR9mfN'
        })

        const GoodBye = new MessageEmbed()
        .setColor('RED')
        .setAuthor(user.tag, user.avatarURL({dynamic: true, size: 512}))
        .setThumbnail(user.avatarURL({dynamic: true, size: 512}))
        .setDescription(`
        ${member} has left the Guild \n
        Joined: <t:${parseInt(member.joinedTimestamp / 1000)}:R> \n
        Latest Member Count: **${guild.memberCount}**`)
        .setFooter(`ID: ${user.id}`)

        Loger.send({embeds: [GoodBye]})
        
    }
}