const Guilded = require("guilded.js");
let db = require("../db/model/user");
let history = require("../db/model/history");

module.exports = {
    name: 'give',
    description: 'u know.',
    aliases: [],
    owner:true,
    async execute(client, message, args) {

        if(message.author.id == "dzk7MKpm" || message.author.id == "mMp5QG7d") {
            const [userid, count] = args;
            const reason = message.content.split(" ").slice(3).join(" ");

            if (!userid || !count || !reason) {
                return message.reply("Please provide both userid, coin count and reason.");
            }
            const c = await db.findOne({ id: userid });

            if (!c) {
                const newDocument = new db({ id: userid, coin: 0.0 });
                await newDocument.save();
            }
    

            await db.findOneAndUpdate({id: userid }, {$inc: {coin: count }}, { upsert: true })
            await history.findOneAndUpdate({id: userid}, {$push: {gecmis: { count, user: message.author.id, reason: reason, time: Date.now() } }}, { upsert: true});          
  
            return message.reply("ok")
        }

    },
};