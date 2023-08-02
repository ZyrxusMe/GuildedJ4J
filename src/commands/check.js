const Guilded = require("guilded.js")
const fetch = require("node-fetch")
let server = require("../db/model/server");
let db = require("../db/model/user");
let history = require("../db/model/history");

module.exports = {
	name: 'check',
	description: 'Collect your server entry coin and find out when you can exit',
    aliases: [],
	async execute(client, message) {
        let team = await getTeam(message.serverId)
        let servecr = await server.findOne({id: message.serverId})
        const member = await client.members.fetch(message.serverId, message.author.id);
        const joinDate = member.joinedAt;
        const newDate = new Date(joinDate);
        if(!servecr) return message.reply("We're sorry, but we couldn't provide you with any coins on this server.")
        if(servecr.time > joinDate) return message.reply("We're sorry, but we couldn't provide you with any coins on this server.")
        newDate.setDate(newDate.getDate() + 3);
        const options = {year: 'numeric',month: 'long',day: 'numeric',hour: '2-digit',minute: '2-digit',second: '2-digit',timeZoneName: 'short'};
        const a = joinDate.toLocaleString('en-US', options);
        const b = newDate.toLocaleString('en-US', options);
        const embed = new Guilded.Embed()
        //.setThumbnail(team?.profilePicture || client.user.avatar)
        .setTitle(`Check For ${team.name}`)
        .setFooter("(C) 2023 "+ client.user.name+" | guilded.gg/j4j")
        let d = new Date()
        if(joinDate < newDate) {
            if(!servecr.giren.find(x=>x.user == message.author.id) || servecr.kalan > 1) {
                await db.findOneAndUpdate({id: message.author.id }, {$inc: {coin: 1 }}, { upsert: true })
                await history.findOneAndUpdate({id: message.author.id}, {$push: {gecmis: { count: 1, user: client.user.id, reason: `Given for Joining the Server. (By the System)".`, time: Date.now() } }}, { upsert: true});                  
                await server.findOneAndUpdate({id: message.serverId}, {$inc: {kalan: -1} ,$push: {giren: { user: message.author.id } }}, { upsert: true});  
            }
            if(servecr.kalan < 2) {
                if(servecr.disabled == "false") {
                    await server.findOneAndUpdate({id: message.serverId, disabled: "false"}, {$set: {disabled: "true"}} , { upsert: true});  
                }
            }                

            embed.setDescription(`
            You joined this server at ${a}.\n You can leave without losing coins at ${b}\n
            Current Bot Time: ${d.toLocaleString('en-US', options)}
            `.replaceAll(":", "."))

            return message.reply(embed)
        } else {
            embed.setDescription(`You can leave the server now. You won't experience any coin loss.`)

            return message.reply(embed)
        }
    },
};
async function getTeam(x) {
    const a = await fetch("https://www.guilded.gg/api/teams/"+x+"/info")
    const json = await a.json()
    return json.team
}