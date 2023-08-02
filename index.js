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
    console.log(chalk.green.bgGreen.bold("Bot is successfully logged in"))
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

/*client.on("memberJoined", async (user) => {
    const servers = await server.findOne({ id: user.serverId });
    if (servers) {
      const formatDate = (date) => {
        return new Date(date).toLocaleString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZoneName: 'short'
        });
      };
  
      const joined = formatDate(user.joinedAt);
  
      const tar = new Date(user.joinedAt);
      tar.setDate(tar.getDate() + 3);
      const cikabilcke = formatDate(tar);
  
      await server.findOneAndUpdate(
        { id: user.serverId },
        {
          $push: {
            giren: {
              id: user.id,
              time: joined,
              cikabilecek: cikabilcke
            }
          }
        },
        { upsert: true }
      );
    }
  });*/

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
    content:  `${await fetchUserGuilds(client.user.id)} guilds!`
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