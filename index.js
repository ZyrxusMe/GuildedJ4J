const Guilded = require("guilded.js")
const {prefix,token,mongo} = require("./config.json")
const client = new Guilded.Client({token})
const chalk = require("chalk")
const server = require("./src/db/model/server")
let db = require("./src/db/model/user");
let history = require("./src/db/model/history");

client.on("ready", async() => {
    console.log(chalk.green.bgGreen.bold("Bot is successfully logged in"))
    require("./src/utils/Loader")(client)
})
client.login();
client.on('messageCreated', message => {
	if (!message.content.startsWith(prefix) || message.author.type === 0) return;
	const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    let cmd;
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