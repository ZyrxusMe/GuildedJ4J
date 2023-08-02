const Guilded = require("guilded.js");
let db = require("../db/model/user");
let history = require("../db/model/history");

module.exports = {
    name: 'pay',
    description: 'Send coins to the user.',
    aliases: [],
    async execute(client, message, args) {

        let user = message.mentions?.users[0]
        if(!user) return message.reply("❌ **|** Please mention a user.")
        user = await checkUser(user.id)
        if(user?.code || message.author.id == user.id) return message.reply("❌ **|** Failed to send coin to user.")

        const money = Number(args[1])
        if(isNaN(money) || money < 3 || money > 50) return message.reply("❌ **|** Please specify how many coins you want to send. You can send a minimum of 3 coins, a maximum of 50 coins")

        const c = await db.findOne({ id: user.id });
        const cc = await db.findOne({ id: message.author.id });

        if (!c) {
            const newDocument = new db({ id: user.id, coin: 0.0 });
            await newDocument.save();
        }

        if(money > cc) return message.reply("❌ **|** You do not have enough coins to send so many coins.")
        await user.findOneAndUpdate({ id: message.author.id }, { $inc: { coin: -money } }, { upsert: true });
        await history.findOneAndUpdate({ id: message.author.id }, { $push: { gecmis: { count: -money, user: user.id, reason: `Transfer between users.`, time: new Date() } } }, { upsert: true });
        await user.findOneAndUpdate({ id: user.id }, { $inc: { coin: coins } }, { upsert: true });
        await history.findOneAndUpdate({ id: user.id }, { $push: { gecmis: { count: coins, user: message.author.id, reason: `Transfer between users.`, time: new Date() } } }, { upsert: true });

        const embed = new Guilded.Embed()
        .setAuthor(client.user.name, client.user.avatar)
        .setTitle("🎉 You are in a generous mood today!")
        .setDescription(`The transfer of ${money} coins to the user [${user.name}](https://guilded.gg/u/${user.subdomain}) was successful.`)
        .setFooter("(C) 2023 " + client.user.name + " | guilded.gg/j4j")
        message.reply(embed)
    },
};


function checkUser(x) {
    return fetch("https://www.guilded.gg/api/users/" + x + "/profilev3")
        .then(async (response) => {
            return response.json();
        })
        .catch((error) => {
            console.error(error);
        });
}