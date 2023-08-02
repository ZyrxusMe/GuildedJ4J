const Guilded = require("guilded.js");
let db = require("../db/model/user");
let history = require("../db/model/history");
const fetch = require("node-fetch");

module.exports = {
    name: 'balance',
    description: 'To view your current coin balance and coin history.',
    aliases: ["bal"],
    async execute(client, message, args) {
        const page = args[0] || 1; 
        const c = await db.findOne({ id: message.author.id });
        if (!c) {
            let a = new db({ id: message.author.id });
            await a.save();
        }

        const embed = new Guilded.Embed()
            .setAuthor(message.author.name + "'s Balance", message.author.avatar)
            .setColor("GREEN")
            .setTitle(`${c?.coin || "0.0"} Coin`)
            .setDescription("- **How to earn coins?**\n + You can earn coins by joining the servers listed in the '+list' command.");

        let g = await history.findOne({ id: message.author.id });
        if (!g) {
            embed.addField("💰 | History", "Not Found.");
        } else {
            const aa = 7;
            const bb = (page - 1) * aa;
            const cc = bb + aa;
            g = g.gecmis;
            g.sort((a, b) => b.time - a.time);
            g = g.slice(bb,cc);
            let gWithUserNames = await Promise.all(g.map(item => getFormattedHistoryEntry(item)));
            embed.addField("💰 | History", gWithUserNames.join(""));
        }

        message.reply(embed);
    },
};

async function getFormattedHistoryEntry(item) {
    try {
        const user = await checkUser(item.user);
        if (item.count < 0) {
            return `[${item.count}] Given by ${user.name || "Join4Join+"} due to \`${item.reason}\`\n`;
        } else {
            return `[${item.count||0.5}] Given by ${user.name || "Join4Join+"} due to \`${item.reason}\`\n`;
        }
    } catch (error) {
        console.error("Error fetching user data:", error);
        return "";
    }
}

function checkUser(x) {
    return fetch("https://www.guilded.gg/api/users/" + x + "/profilev3")
        .then(async (response) => {
            return response.json();
        })
        .catch((error) => {
            console.error(error);
        });
}
