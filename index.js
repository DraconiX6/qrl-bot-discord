import {fs,readline,google,gmail,authorize} from "./googleAuth.js";

var chunk = require("chunk-text");

// DISCORD CODE

const { Client, Intents, MessageEmbed } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS,Intents.FLAGS.GUILD_MEMBERS,Intents.FLAGS.GUILD_MESSAGES,Intents.FLAGS.GUILD_MESSAGE_REACTIONS] });
// OLD const client = new Discord.Client();    //{ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] }
const CHANNEL_PATH = "./channels.json";

const { token } = require('./config.json');

const call = "!";

function checkForMail(auth) {
    gmail.users.messages.list({auth: auth, userId: 'me', 'q': "is:unread {from:(verena@questionable.co.nz) from:(kevin.waugh@questionable.co.nz)}"}, function(err, response) {
        if (err) {
            console.log("Error getting mail: "+err);
            messageToEdit.edit("Error getting mail: "+err);
            return;
        }
        else if (response['data'].resultSizeEstimate == 0) {
          if (checkMail) messageToEdit.edit("No new mail.");
          console.log("No new mail from "+email[ihatenodejs]+".");
          return;
        }
    }
}

client.on("message", message => {
    if (message.content.startsWith(call+"checkmail")) {
        message.channel.send("Checking for mail...");
        fs.readFile('credentials.json', (err, content) => {
            if (err) return console.log('Error loading client secret file:', err);
              authorize(JSON.parse(content), getRecentEmail);
          });
    }
});