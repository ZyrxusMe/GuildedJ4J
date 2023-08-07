const Guilded = require("guilded.js");
let db = require("../db/model/user");
let history = require("../db/model/history");
let server = require("../db/model/server");
const fetch = require("node-fetch");
const config = require("../../config.json")

module.exports = {
    name: 'buy',
    description: 'Buy user. 1 member = 1 coin. You can specify an advertising message.',
    aliases: ["ad", "adversite"],
    async execute(client, message, args) {
      let perm = await permission(message.serverId, message.author.id, "CanUpdateServer")
      let permc = await permission(message.serverId, client.user.id, "CanUpdateServer")
      if(!perm) return message.reply("You do not have the necessary permissions to use this command. (Required Permission: `CanUpdateServer`)") 
      if(!permc) return message.reply("To do this, you must grant CanUpdateServer permission to the bot.") 
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
        if(c?.coin < coin || coin < 5) {
            embed.setDescription("Your funds are not sufficient to accomplish this. Please remember that you can request a minimum of 5 members.")
            return message.reply(embed)
        }

        let a = await generateUrl(team.id)
        embed.setDescription(`
        Your order has been received. You can use the +info command to check your order details.
        The description is as follows:
        ${description}
        [Join ${team.name}](https://www.guilded.gg/i/${a})
        `)
        message.reply(embed)
        
        let oro = new server({id:team.id, hak: coin, kalan: coin, giren: [], time: new Date(), desc: `${description}\n[Join ${team.name}](https://www.guilded.gg/i/${a})`, invite: a}) 
        await oro.save()

        await db.findOneAndUpdate({id: message.author.id }, {$inc: {coin: -coin }}, { upsert: true })
        await history.findOneAndUpdate({id: message.author.id}, {$push: {gecmis: { count: -coin, user: client.user.id, reason: `An order of ${coin} members for the ${team.name} server.`, time: new Date() } }}, { upsert: true});          

        async function generateUrl(server) {
          const a = await fetch("https://www.guilded.gg/api/teams/JRXG4DKj/invites", {
            "headers": {
              Authorization: `Bearer ${client.token}`,
              "Content-Type": "application/json"
            },
            "body": "{\"teamId\":\"JRXG4DKj\",\"gameId\":null, \"expiryInterval\": null, \"maxNumberOfUses\": 50}",
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
          })
          let jsonc = await a.json()
          await fetch("https://www.guilded.gg/api/teams/JRXG4DKj/invites/"+jsonc.invite.id, {
            method: "PUT",
            "headers": {
              Authorization: `Bearer ${client.token}`,
              "Content-Type": "application/json"
            },
            "body": "{\"expiryInterval\":null,\"maxNumberOfUses\": null}",
            mode: "cors",
            credentials: "include"
          })
        
          return jsonc.invite.id
         }
    },
};
async function getTeam(x) {
    const a = await fetch("https://www.guilded.gg/api/teams/"+x+"/info")
    const json = await a.json()
    return json.team
}
async function permission(server, user, perm) {
    const membersResponse = await fetch(`https://www.guilded.gg/api/teams/${server}/members`);
    const members = await membersResponse.json()
    const member = members.members.find(x => x.id == user);
  
    if (!member) {
      return false;
    }
  
    for (const roleId of member.roleIds) {
      const roleResponse = await fetch(`https://www.guilded.gg/api/v1/servers/${server}/roles/${roleId}`, {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${config.token}`,
          'Accept': 'application/json',
          'Content-type': 'application/json'
        }
      });
  
      const role = await roleResponse.json();
      if (role.role.permissions.includes(perm)) {
        return true;
      }
    }
  
    return false;
  }
