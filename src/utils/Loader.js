const fs = require('fs');
const path = require('path');
const Guilded = require("guilded.js")
module.exports = async (client) => {
    client.commands = new Guilded.Collection();
    client.aliases = new Guilded.Collection();
    const commandFiles = fs.readdirSync(path.join(__dirname, '../commands')).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    try {
      const command = require(path.join(__dirname, '../commands', file));
      client.commands.set(command.name, command);
      command.aliases.forEach(alias => {          
        client.aliases.set(alias, command.name);  
      });  
      } catch (error) {
      console.error(`Error importing ${file}:`, error);
    }
  }
};
