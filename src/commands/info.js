const Guilded = require("guilded.js")
let server = require("../db/model/server");
const config = require("../../config.json")
module.exports = {
	name: 'info',
	description: 'Get info about your current order.',
    aliases: [],
	async execute(client, message) {
        let perm = await permission(message.serverId, message.author.id, "CanUpdateServer")
        if(!perm) return message.reply("You do not have the necessary permissions to use this command. (Required Permission: CanUpdateServer)") 
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
  