const { Message, MessageEmbed, WebhookClient } = require("discord.js");

module.exports = { 
    name: "messageDelete",
    /**
     * 
     * @param {*} message 
     */
    execute(message) { 
        if(message.author.bot) return;
        const Log = new MessageEmbed()
        .setColor('#2f3136')
        .setDescription(`📕 A [message](${message.url}) by ${message.author} was **deleted**.\n
        **Deleted Messsage**:\n\`\`\`fix\n${message.content ? message.content : "None"}\`\`\``.slice(0, 4096))

        if(message.attachments.size > 0){
            Log.addField(`Attachments:`, `${message.attachments.map(a => a.url)}`, true)
        }

        new WebhookClient({url: "https://discord.com/api/webhooks/929398046939283537/utXkUVrT42EIaeVhu_fFQ0OrSYxb6_ftqKh03dNObyHHGMzH_pJGKv6n3YzNlscR9mfN"}
        ).send({embeds: [Log]}).catch((err) => { console.log(err) });

    }
}