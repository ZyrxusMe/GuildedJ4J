const Guilded = require("guilded.js")

module.exports = {
	name: 'help',
	description: 'Help menu!',
    aliases: [],
	execute(client, message) {
        let c = []
		let commands = client.commands.filter(x=>x.name != "help" && x.name != "give" && x.name != "eval")
        commands.forEach(async(x) => {c.push({name: "+"+x.name, value: x.description})})
        const embed = new Guilded.Embed()
        .setThumbnail(message.author.avatar||client.user.profilePicture)
        .setColor("BLUE")
        .setTitle("Help Server: [https://guilded.gg/j4j](https://guilded.gg/j4j)")
        .setAuthor(client.user.name+" Bot", client.user.profilePicture || message.author.avatar)
        .addFields(c)
        .setFooter("(C) 2023 "+ client.user.name+" | guilded.gg/j4j")
        message.reply(embed)
	},
};

