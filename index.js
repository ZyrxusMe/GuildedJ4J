const Guilded = require("guilded.js")
const {prefix,token,mongo} = require("./config.json")
const client = new Guilded.Client({token})
const chalk = require("chalk")
const server = require("./src/db/model/server")
let db = require("./src/db/model/user");
let history = require("./src/db/model/history");

client.on("ready", async() => {
      setInterval(() => {
    update()
  }, 10000);
  update()
    console.log(chalk.green.bold("Bot is successfully logged in"))
    require("./src/utils/Loader")(client)
})
client.login();
client.on('messageCreated',async message => {
	if (!message.content.startsWith(prefix) || message.author.type === 0) return;
	const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    let cmd;
    const c = await db.findOne({ id: message.author.id });
    if (!c) {
        const newDocument = new db({ id: message.author.id, coin: 4.75 });
        await newDocument.save();
    }  
	if (client.commands.has(command)) {
        cmd = client.commands.get(command).execute(client, message, args);
    } else if(client.aliases.has(command)) {
        cmd = client.commands.get(client.aliases.get(command)).execute(client, message, args);
    }
	try {
	} catch (error) {
		console.error(error);
		message.reply('there was an error trying to execute that command!');
	}
});

client.on("botServerCreated", async(server) => {

  const embed = new Guilded.Embed()
  .setColor("GREEN")
  .setTitle("Added")
  .addFields([
    {name: "name", value: server.name || "?"},
    {name: "shorturl", value: server.shortURL|| "?"},
    {name: "ownerId", value: server.ownerId|| "?"},
    {name: "_createdAt", value: String(server["_createdAt"]|| "?")},
  ])
  .setImage("https://img.guildedcdn.com/UserBanner/37cf22043ef387c764eae8c954f8a87f-Hero.png?w=1920&h=300")

  await client.messages.send("3035198c-1644-48ba-9121-1fa9ea0d2a71", embed)
})

client.on("botServerDeleted", async(server) => {

  const embed = new Guilded.Embed()
  .setColor("RED")
  .setTitle("Deleted")
  .addFields([
    {name: "name", value: server.name || "?"},
    {name: "shorturl", value: server.shortURL|| "?"},
    {name: "ownerId", value: server.ownerId|| "?"},
    {name: "_createdAt", value: String(server["_createdAt"]|| "?")},
  ])
  .setImage("https://img.guildedcdn.com/UserBanner/37cf22043ef387c764eae8c954f8a87f-Hero.png?w=1920&h=300")

  await client.messages.send("3035198c-1644-48ba-9121-1fa9ea0d2a71", embed)
})


client.on("memberJoined", async(user) => {
        if(user.serverId == "dlOywd9j") {
  const c = await db.findOne({ id: user.userId });
  if (!c) {
      const newDocument = new db({ id: user.userId, coin: 0.0 });
      await newDocument.save();
  }
  await db.findOneAndUpdate({id: user.userId }, {$inc: {coin: 4.5 }}, { upsert: true })
  await history.findOneAndUpdate({id: user.userId}, {$push: {gecmis: { count: 4.5, user: client.user.id, reason: "Joined Support Server", time: Date.now() } }}, { upsert: true});     }     
})

client.on("memberJoined", async(user) => {
    const servers = await server.findOne({ id: user.serverId, disabled: "false" });
    if(servers) {
      if(!servers?.invite) return
      const b = await fetch("https://www.guilded.gg/api/teams/JRXG4DKj/invites/"+servers.invite, {
    method: "PUT",
    "headers": {
      Authorization: `Bearer ${client.token}`,
      "Content-Type": "application/json"
    },
    "body": "{\"expiryInterval\":null}",
    mode: "cors",
    credentials: "include"
  })
  let json = await b.json()
  if(json[0].usedBy == user.id) {
    if(!servers.giren.find(x=>x.user == user.id) || servers.kalan > 1) {
      await db.findOneAndUpdate({id: user.id }, {$inc: {coin: 1 }}, { upsert: true })
      await history.findOneAndUpdate({id: user.id}, {$push: {gecmis: { count: 1, user: client.user.id, reason: `Given for Joining the Server.`, time: Date.now() } }}, { upsert: true});                  
      await server.findOneAndUpdate({id: user.serverId}, {$inc: {kalan: -1} ,$push: {giren: { user: user.id } }}, { upsert: true});  
        }
      if(servers.kalan <= 1) {

        await fetch("https://www.guilded.gg/api/teams/JRXG4DKj/invites/"+servers.invite, {
          method: "DELETE",
          "headers": {
            Authorization: `Bearer ${client.token}`,
            "Content-Type": "application/json"
          },
          "body": "{}",
          mode: "cors",
          credentials: "include"
        })
        await server.findOneAndUpdate({id: user.serverId, disabled: "false"}, {$set: {disabled: "true"}} , { upsert: true});  
        }
      }
    }
  })

  client.on("memberRemoved", async(user) => {
    if(user.serverId == "dlOywd9j") {
      await db.findOneAndUpdate({id: user.userId }, {$inc: {coin: -4.5 }}, { upsert: true })
      return await history.findOneAndUpdate({id: user.userId }, {$push: {gecmis: { count: -4.5, user: client.user.id, reason: `Leaving Support Server.`, time: new Date() } }}, { upsert: true});          
    }

    const member = await client.members.fetch(user.serverId, user.userId);

    let servecr = await server.findOne({id: user.serverId})
    if(!servecr) return
    if(servecr.giren.find(x=>x.user == user.userId)) {
        const joinDate = member.joinedAt;
        const newDate = new Date(joinDate);
        newDate.setDate(newDate.getDate() + 3);
        if(servecr.time > joinDate || joinDate > newDate) return
        await db.findOneAndUpdate({id: user.userId }, {$inc: {coin: -1.5 }}, { upsert: true })
        await history.findOneAndUpdate({id: user.userId }, {$push: {gecmis: { count: -1.5, user: client.user.id, reason: `Leaving Guilded Server.`, time: new Date() } }}, { upsert: true});          
    }
})
  
require("./src/db/connection")(client,mongo)

  
process.on("uncaughtException", (error) => {
    console.error("Beklenmeyen bir hata oluştu:");
    console.error(error);
  });
  
  process.on("unhandledRejection", (reason, promise) => {
    console.error("İşlenmemiş bir geri dönüşüm hatası oluştu:");
    console.error("Promise:", promise);
    console.error("Reason:", reason);
  });

async function update() {
  const url = `https://www.guilded.gg/api/v1/users/${client.user.id}/status`;
  const headers = {
    Authorization: `Bearer ${token}`,
    'Accept': 'application/json',
    'Content-type': 'application/json',
  };
  const data = {
    emoteId: '1662336',
    content:  `+help / +buy`
  };
  const requestOptions = {
    method: 'PUT',
    headers: headers,
    body: JSON.stringify(data)
  };  
  fetch(url, requestOptions)
}

async function fetchUserGuilds(x) {
    const a = await fetch("https://www.guilded.gg/api/users/"+x+"/teams")
    const json = await a.json()
    return json.teams.length
}

