const Guilded = require("guilded.js");
let db = require("../db/model/user");
let history = require("../db/model/history");
let server = require("../db/model/server");
const fetch = require("node-fetch");

module.exports = {
    name: 'buy',
    description: 'Buy user. 1 member = 1 coin. You can specify an advertising message.',
    aliases: ["ad", "adversite"],
    async execute(client, message, args) {
        let team = await getTeam(message.serverId)
        const embed = new Guilded.Embed()
        .setAuthor(team.name, team?.profilePicture)
        .setTitle("Order for "+ team.name)
        .setThumbnail(team?.profilePicture || client.user.avatar)
        .setColor("AQUA")
        const c = await db.findOne({ id: message.author.id, disabled: "false" });
        const servers = await server.find({disabled: "false"})
        if(servers.find(x=>x.id == message.serverId)) {
            embed.setDescription("You already have a pending order. Please wait for the current order to be completed")
            return message.reply(embed)
        }

        let coin = Number(args[0])
        let description = args.slice(1).join(" ").slice(0,150) || ""
        if(!coin || isNaN(coin)) {
            embed.setDescription("Please write how many members you want to purchase. 1 coin = 1 member (you can buy a minimum of 5 members).")
            return message.reply(embed)
        }
        if(description.includes("guilded.gg", "https://", "http://")) {
            embed.setDescription("Please do not provide another link. We will already provide the invite url of your server for you to explain.")
            return message.reply(embed)
        }
        if(c?.coin < coin || c?.coin < 5) {
            embed.setDescription("Your funds are not sufficient to accomplish this. Please remember that you can request a minimum of 5 members.")
            return message.reply(embed)
        }

        embed.setDescription(`
        Your order has been received. You can use the +info command to check your order details.
        The description is as follows:
        ${description}
        [Join ${team.name}](https://www.guilded.gg/${team.subdomain}?i=mb1yrpRd)
        `)
        message.reply(embed)
        
        let oro = new server({id:team.id, hak: coin, kalan: coin, giren: [], time: new Date(), desc: `${description}\n[Join ${team.name}](https://www.guilded.gg/${team.subdomain}?i=mb1yrpRd)`}) 
        await oro.save()

        await db.findOneAndUpdate({id: message.author.id }, {$inc: {coin: -coin }}, { upsert: true })
        await history.findOneAndUpdate({id: message.author.id}, {$push: {gecmis: { count: -coin, user: client.user.id, reason: `An order of ${coin} members for the [${team.name} (${team.id})](https://guilded.gg/${team.subdomain}) server.`, time: new Date() } }}, { upsert: true});          

    },
};
async function getTeam(x) {
    const a = await fetch("https://www.guilded.gg/api/teams/"+x+"/info")
    const json = await a.json()
    return json.team
}