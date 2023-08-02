const Guilded = require("guilded.js");
const fetch = require("node-fetch");
const ms = require("moment");
const user = require("../db/model/user");
const history = require("../db/model/history");
const daily = require("../db/model/daily");
const server = require("../db/model/server");

module.exports = {
    name: 'eval',
    description: 'eval.',
    aliases: [],
    owner:true,
    async execute(client, message, args) {

        if(message.author.id == "dzk7MKpm" || message.author.id == "mMp5QG7d") {
  
            try {
                const code = args.join(' ');
                let evaled = await eval(code);
          
                if (typeof evaled !== 'string') {
                  evaled = require('util').inspect(evaled);
                }
        
                if(evaled.length > 3999) {
                    message.reply("Konsolda")
                    return console.log(evaled)
                }
        
                message.reply(clean(evaled));
              } catch (err) {
                message.reply(`Error: ${clean(err)}`);
              }
            }
        }
};

function clean(text) {
    if (typeof text === 'string') {
      return text
        .replace(/`/g, '`' + String.fromCharCode(8203))
        .replace(/@/g, '@' + String.fromCharCode(8203));
    } else {
      return text;
    }
  }