const Guilded = require("guilded.js");
const ms = require("ms")
module.exports = {
    name: 'stats',
    description: 'Statistics about the bot.',
    aliases: [],
    async execute(client, message, args) {

        const guilds = await fetchUserGuilds(client.user.id)
        let uptime = formatUptime(client.uptime)
        const embed = new Guilded.Embed()
        .setAuthor(client.user.name, client.user.avatar)
        .setFooter("(C) 2023 "+ client.user.name+" | guilded.gg/j4j")
        //.setThumbnail(client.user.avatar)
        .addField(`Memory Usage`,(process.memoryUsage().rss / 1024 / 1024).toFixed(2) + "MB",true)
        .addField("Server Count", guilds, true)
        .addField("Libary", "guilded.js@0.23.4", true)
        .addField("Prefix", "+", true)
        .addField("Uptime", uptime, true)
        .addField("Invite", `[Add Bot](https://www.guilded.gg/b/3a7b46c5-6199-4685-b96f-f80af282818e)\n[Support](https://www.guilded.gg/j4j)
        `, true)
        message.reply(embed)
        },
};

async function fetchUserGuilds(x) {
    const a = await fetch("https://www.guilded.gg/api/users/"+x+"/teams")
    const json = await a.json()
    return json.teams.length
}

function formatUptime(ms) {
    const ss = Math.floor(ms / 1000);
    const d = Math.floor(ss / 86400);
    const h = Math.floor((ss % 86400) / 3600);
    const m = Math.floor(((ss % 86400) % 3600) / 60);
    const s = ((ss % 86400) % 3600) % 60;

    return `${d}d ${h}h ${m}m ${s}s`;
}
