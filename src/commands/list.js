const Guilded = require("guilded.js");
const fetch = require("node-fetch");
const server = require("../db/model/server");

module.exports = {
    name: 'list',
    description: 'Get coins by joining the servers on the list.',
    aliases: ["l"],
    async execute(client, message, args) {
        try {
            const userguilds = await fetchUserGuilds(message.author.id);
            const guilds = (await server.find({ disabled: "false" })).slice(0,3).sort((a,b) => a.time - b.time)
            let field = [];
            for (const x of guilds) {
                const foundGuild = userguilds.find(guild => guild.id == x.id);
                if (!foundGuild) {
                    const guild = await getTeam(x.id);
                    if (guild.visibility === "default" || guild.visibility === "open-entry") {
                        field.push({ name: guild.name, value: x.desc.replace(/\n/g, "\n").trim() || "" });
                    }
                }
            }
           if (field.length === 0) {
                field.push({ name: "Error", value: "We couldn't find a suitable server for you" });
            }   
            const embed = new Guilded.Embed()
                .setColor("BLUE")
                .setThumbnail(message.author.avatar)
                .setAuthor(client.user.name + " Bot", client.user.profilePicture || message.author.avatar)
                .setFooter("(C) 2023 " + client.user.name + " | guilded.gg/j4j")
                .setTitle("Server List")
                .setDescription("Join the servers below and earn 0.5 coins for each server.")
                .addFields(field)
                .addField("Is something problematic going on?","Report this server on our support server. We will take the necessary actions.")
            message.reply(embed);
        } catch (error) {
            console.error(error);
            message.reply("An error occurred while fetching the guild list.");
        }
    },
};

async function fetchUserGuilds(x) {
    const a = await fetch("https://www.guilded.gg/api/users/"+x+"/teams")
    const json = await a.json()
    return json.teams
}
async function getTeam(x) {
    const a = await fetch("https://www.guilded.gg/api/teams/"+x+"/info")
    const json = await a.json()
    return json.team
}