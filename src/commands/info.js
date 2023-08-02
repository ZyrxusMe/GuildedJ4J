const Guilded = require("guilded.js")
let server = require("../db/model/server");

module.exports = {
	name: 'info',
	description: 'Get info about your current order.',
    aliases: [],
	async execute(client, message) {
        let team = await getTeam(message.serverId)
        let sw = await server.findOne({id: message.serverId, disabled: "false"})
        const embed = new Guilded.Embed()
        .setThumbnail(team?.profilePicture || client.user.avatar)
        .setColor("BLUE")
        .setTitle("Order Of "+ team.name)
        .setDescription("Here is the current status of your lastest order.")
        if(!sw) {
            embed.addField("Current Order:", "You do not have any orders.")
        } else {
            const progressBar = generateProgressBar(sw.kalan, sw.hak);
            embed.addField("Current Order:", progressBar+ ` (${(sw.hak - sw.kalan) + "/" + sw.hak})`)
        }
        message.reply(embed)
	},
};

async function getTeam(x) {
    const a = await fetch("https://www.guilded.gg/api/teams/"+x+"/info")
    const json = await a.json()
    return json.team
}

function generateProgressBar(kalan, hak, length = 20, a = "#", b = "=") {
    const filledCount = Math.round(((hak - kalan) / hak) * length);
    const emptyCount = length - filledCount;

    const filledSection = a.repeat(filledCount);
    const emptySection = b.repeat(emptyCount);

    return `${filledSection}${emptySection}`;
}