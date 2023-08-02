const Guilded = require("guilded.js");
const user = require("../db/model/user");
const history = require("../db/model/history");
const daily = require("../db/model/daily");
const moment = require("moment");
require("moment-duration-format");

module.exports = {
    name: 'daily',
    description: 'Daily prize.',
    aliases: ["d"],
    async execute(client, message, args) {
        let a = await daily.findOne({ id: message.author.id });

        if (a) {
            if (a.timestamp > Date.now()) {
                const remainingTime = moment.duration(a.timestamp - Date.now()).format("h [hours], m [minutes], s [seconds]");
                const embed = new Guilded.Embed()
                    .setTitle("Daily")
                    .setDescription(`You need to wait until ${remainingTime} to claim your daily reward.`);
                return message.reply(embed);
            }
        } else {
            await daily.create({ id: message.author.id, timestamp: 0 });
        }

        await daily.findOneAndUpdate({ id: message.author.id }, { $set: { timestamp: Date.now() + require("ms")("12h") } });

        const coin = generateCoins(1, 1, 1)[0];

        const embed = new Guilded.Embed()
            .setTitle("Daily")
            .setDescription(`You have won ${coin} coins from the daily reward.`);

        message.reply(embed);
        await user.findOneAndUpdate({ id: message.author.id }, { $inc: { coin: coin } }, { upsert: true });
        await history.findOneAndUpdate({ id: message.author.id }, { $push: { gecmis: { count: coin, user: client.user.id, reason: `Daily.`, time: new Date() } } }, { upsert: true });
    },
};

function getRandomFloat(min, max, decimalPlaces) {
    const rand = Math.random() * (max - min) + min;
    return rand.toFixed(decimalPlaces);
}

function generateCoins(minCoins, maxCoins, decimalPlaces) {
    const numCoins = Math.floor(Math.random() * (maxCoins - minCoins + 1)) + minCoins;
    const coins = [];

    for (let i = 0; i < numCoins; i++) {
        const coinValue = getRandomFloat(1, 3, decimalPlaces);
        coins.push(coinValue);
    }

    return coins;
}
