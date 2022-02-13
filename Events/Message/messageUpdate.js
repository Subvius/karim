const { Message, MessageEmbed, WebhookClient } = require("discord.js");

module.exports = { 
    name: "messageUpdate", 
    /**
     * 
     * @param {*} oldMessage 
     * @param {*} newMessage 
     */
    execute(oldMessage, newMessage) { 
        if(oldMessage.author.bot) return;

        if (oldMessage.content === newMessage.content) return;

        const Count = 1900;

        const Original = oldMessage.content.slice(0, Count) + (oldMessage.content.length > 1900 ? "..." : "")
        const Edited = newMessage.content.slice(0, Count) + (newMessage.content.length > 1900 ? "..." : "")

        const Log = new MessageEmbed()
        .setColor("#2f3136")
        .setDescription(`📘 A [message](${newMessage.url}) by ${newMessage.author} was **edited** in ${newMessage.channel}.\n
        **Original**:\n\`\`\`fix\n ${Original}\`\`\`\n**Edited**:\n\`\`\`fix\n ${Edited}\`\`\``.slice("0", "4096"))
        .setFooter(`Member: ${newMessage.author.tag} | ID: ${newMessage.author.id}`)
        .setTimestamp(Date.now())

        new WebhookClient({url: "https://discord.com/api/webhooks/929398046939283537/utXkUVrT42EIaeVhu_fFQ0OrSYxb6_ftqKh03dNObyHHGMzH_pJGKv6n3YzNlscR9mfN"}).send({embeds:[Log]}).catch((err) => console.log(err));
    }
}