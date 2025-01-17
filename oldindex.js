//GOOGLE CODE

const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/gmail.modify'];
const TOKEN_PATH = 'token.json';

var gmail = google.gmail('v1');

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Gmail API.
  authorize(JSON.parse(content), listLabels);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}



/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
 function listLabels(auth) {
  const gmail = google.gmail({version: 'v1', auth});
  gmail.users.labels.list({
    userId: 'me',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const labels = res.data.labels;
    if (labels.length) {
      console.log('Labels:');
      labels.forEach((label) => {
        console.log(`- ${label.name}`);
      });
    } else {
      console.log('No labels found.');
    }
  });
}

// DISCORD CODE
// DISCORD CODE
// DISCORD CODE

const { Client, Intents, MessageEmbed } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS,Intents.FLAGS.GUILD_MEMBERS,Intents.FLAGS.GUILD_MESSAGES,Intents.FLAGS.GUILD_MESSAGE_REACTIONS] });
// OLD const client = new Discord.Client();    //{ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] }
var CHANNEL_PATH = "./channels.json";
var MESSAGE_PATH = "./messages.json";

var base64ToImage = require('base64-to-image');
var chunk = require("chunk-text");
const { SSL_OP_NETSCAPE_CHALLENGE_BUG, SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants');

const { token } = require('./config.json');

// --real--
// const call = "!";
// const managerRole = "492250278784139264";
// const secretChannel = "801951035161444442";

// defaultRoleId = "753543665053335552";
// roleToAddId = "492242981726978058";
// newMembersChannelId = "492677607327006720";
// mailNotificationRole = "763538056997109761";

// --test--
const call = "!";
const managerRole = "758548822476980234";
const secretChannel = "766159287784701952";

defaultRoleId = "752055286734389329";
roleToAddId = "743794514778521691";
newMembersChannelId = "743693457033527349";
mailNotificationRole = "758571392081461248";

var mailChecked = false;
var channelCount;
var channelToSendTo;
var email;
var emailsToSendTo;
var checkMail;
var newMembers = [];
var today = new Date();

client.login(token);

function cacheMessages() {
  fs.readFile('messages.json', (err, content) => {
    if (err) return console.log('Error loading emails file:', err);
    messages = JSON.parse(content);
    messageIds = [];
    messageChannelIds = [];
    rolesToAdd = [];
    for (i = 0; i < messages.length; i++) {
      messageIds.push(messages[i].reactMessageId);
      messageChannelIds.push(messages[i].reactMessageChannelId);
      rolesToAdd.push(messages[i].reactionRoleToAdd);
      message = client.channels.fetch(messageChannelIds[i])
      .then(message => message.messages.fetch(messageIds[i]));
      client.channels.fetch(messageChannelIds[i]);
    }
  });
}

function roleReactCreate(reactMessageChannelId,reactMessageId,reactionRoleToAdd) {
  messageIds.push(reactMessageId);
  client.channels.fetch(reactMessageChannelId)
  .then(channel => channel.messages.fetch(reactMessageId))
  .then(message => message.react('✔️'));
  fs.readFile('messages.json', (err, content) => {
    if (err) return console.log('Error loading messages file:', err);
    var obj = JSON.parse(content);
    obj.push({reactMessageId,reactMessageChannelId,reactionRoleToAdd});
    fs.writeFile(MESSAGE_PATH, JSON.stringify(obj), (err) => {
      if (err) {
        console.error(err);
        message.reply("There was an error: "+err);
        return;
      }
      console.log("New role react message created in " + reactMessageChannelId + ".");
    });
  });
}

client.on('messageReactionAdd', async (reaction, user) => {
  if (reaction.partial) {
		try {
			await reaction.fetch();
		} catch (error) {
			console.error('Something went wrong when fetching the message: ', error);
			return;
		}
	}
  if (messageIds.indexOf(reaction.message.id) != -1) {
    reaction.message.guild.members.fetch(user.id)
    .then(u => u.roles.add(rolesToAdd[messageIds.indexOf(reaction.message.id)]));
  }
});

client.on("guildMemberAdd", member => {
  defaultRole = member.guild.roles.cache.find(role => role.id === defaultRoleId);
  roleToAdd = member.guild.roles.cache.find(role => role.id === roleToAddId);
  channel = member.guild.channels.cache.find(ch => ch.id === newMembersChannelId);
  newMembers.push(member);
  member.roles.add(defaultRole,"User joined server");
  console.log("New Member: "+member);
  if (!channel) return;
  channel.send(`Welcome to the server, ${member}. `+"Please write !name <YOUR NAME>");
});

function decodeBodyData(bodyData) {
  buff = Buffer.from(bodyData, 'base64');
  return buff.toString();
}

function getRecentEmail(auth) {
  for (i = 0; i < channelCount; i++) {
    var ihatenodejs = i;
      gmail.users.messages.list({auth: auth, userId: 'me', 'q': "is:unread {from:(verena@questionable.co.nz) from:(kevin.waugh@questionable.co.nz)}"}, function(err, response) {
      setTimeout(() => {
        if (err) {
            console.log("Error getting mail: "+err);
            if (checkMail) messageToEdit.edit("Error getting mail: "+err);
            return;
        }
        else if (response['data'].resultSizeEstimate == 0) {
          if (checkMail) messageToEdit.edit("No new mail.");
          console.log("No new mail from "+email[ihatenodejs]+".");
          return;
        }
        else {
          console.log(response['data'].resultSizeEstimate + " new emails from "+email[ihatenodejs]+"!");
          for (i = 0; i < response['data'].resultSizeEstimate; i++) {
            var message_id = response['data']['messages'][i]['id'];
            gmail.users.messages.get({auth: auth, userId: 'me', 'id': message_id}, function(err, response) {
              if (err) {
                  console.log('Error getting messages: ' + err);
                  return;
              }
              var message_raw = "";
              attachments = [];
              encodedAttachments = [];
              attachmentNames = [];
              attachmentTypes = [];
              responseParts = response['data']['payload']['parts'];
              try {
                if (responseParts[0]['mimeType'] == 'text/plain') {
                  message_raw = responseParts[0].body.data;
                }
                else if (responseParts[0]['mimeType'] == 'multipart/alternative') {
                  message_raw = responseParts[0]['parts'][0].body.data;
                  for (i = 1; i < responseParts.length; i++) {
                    encodedAttachments.push(responseParts[i]['body']['attachmentId']);
                    attachmentNames.push(responseParts[i]['filename']);
                    if (responseParts[i].type == "image/jpeg") {
                      attachmentTypes.push("jpg");
                    }
                    else if (responseParts[i].type == "image/png") {
                      attachmentTypes.push("png");
                    }
                  }
                }
                else {
                  console.log("Error: Email suck, or there was another error. Send with a better client next time dummy");
                  channelToSendTo[ihatenodejs].send("Error: Got message but it was probably sent with some scuffed client. Try again with less scuffed client like gmail or smth");
                  return;
                }
              } catch {
                console.log("lol");
                return;
              }

                if (responseParts[0].mimeType == 'multipart/alternative') responseParts = responseParts[0]['parts'];
                if (responseParts[1].mimeType == 'text/html') {
                  fullMessage = decodeBodyData(responseParts[1].body.data);
                  dateAndTimeSent = today.getYear().toString()+today.getMonth().toString()+today.getDate().toString()+today.getHours().toString()+today.getMinutes().toString()+today.getSeconds().toString();
                }
              setTimeout(() => {
                textChunks = chunk(text,1023);
                textSplits = Math.ceil(text.substr(2047).length / 1024);
                embed = [];
                for (i=0;i<Math.ceil(text.length/5900);i++) {
                  embed.push(new MessageEmbed()
                    .setColor('#0099ff')
                    .setAuthor('QRL Bot', 'https://cdn.discordapp.com/avatars/743691445063516220/54083ff3ba6a16fd00621bbea3b29fd3.png')
                    .setTitle(`New email - Part ${i+1} of ${Math.ceil(text.length/5950)}`)
                    .setTimestamp()
                    .setDescription(textChunks.shift()+textChunks.shift())
                  )
                  if (embed[i].description.substr(embed[i].description.length-9) == "undefined") embed[i].setDescription(embed[i].description.substr(0,embed[i].description.length-9));
                  if (textSplits >= 4) {
                    for (j=0;j<3;j++) {
                      embed[i].addField("‎",textChunks.shift(),false);
                    }
                    embed[i].setFooter('Email exceeds Discord character limit. Continue reading below, or download the full email using the link at the top of this message.');
                    textSplits = textSplits - 4;
                  }
                  else {
                    for (j=0;j<textChunks.length;j++) {
                      embed[i].addField("‎",textChunks.shift(),false);
                    }
                  }
                }
                embed[embed.length-1].setFooter('End of message');

                if (encodedAttachments.length > 0) {
                  for (i = 0; i < encodedAttachments.length; i++) {
                    gmail.users.messages.attachments.get({auth: auth, userId: 'me', 'messageId': message_id, 'id':encodedAttachments[i]}, function(err, response) {
                      if (err) {
                        console.log('Error getting attachment: ' + err);
                        return;
                      }
                      attachments.push(response['data'].data);
                    });
                  }
                }

                try {
                  if (checkMail) messageToEdit.delete();
                  channelToSendTo[ihatenodejs].send(`<@&`+mailNotificationRole+`>`);
                } catch {
                  console.log("Couldn't mention mail notification role.")
                }
                setTimeout(() => {
                  for (i=0;i<embed.length;i++) channelToSendTo[ihatenodejs].send(embed[i]);
                  setTimeout(() => {
                    for (i = 0; i < attachments.length; i++) {
                      var attachmentString = attachments[i];
                      attachmentString = attachmentString.replace(/-/g,'+');
                      attachmentString = attachmentString.replace(/_/g,'/');
                      attachmentString = "data:image/" + attachmentTypes[i] + ";base64," + attachmentString;
                      base64ToImage(attachmentString,'./attachments/',{'fileName': attachmentNames[i]});
                      channelToSendTo[ihatenodejs].send({files:[{attachment:"./attachments/"+attachmentNames[i]}]});
                    }
                  },2000);
                },2100);
                gmail.users.messages.modify({auth: auth, userId: 'me', 'id': message_id, "removeLabelIds": ["UNREAD"]}, function(err) {
                  if (err) {
                    console.log("Error removing unread label: " + err);
                  }
                });
              },2000);
            });
          }
        }
      });
    },500);
  }
}

function checkForMail(channel) {
  emailsToSendTo = [];
  fs.readFile('channels.json', (err, content) => {
    if (err) return console.log('Error loading channels file:', err);
    var data = JSON.parse(content);
    for (i = 0; i < data.length; i++) {
      if (data[i].channelId == channel.toString()) {
        mailChecked = true;
        emailsToSendTo.push({id: data[i].channelId, email: data[i].email});
      }
    }
  });
  setTimeout(() => {
    if (mailChecked) {
      allowGetRecentEmail(emailsToSendTo);
      mailChecked = false;
    }
    else {
      channel.send("I haven't been asked to send mail to this channel yet. Please type !mail <email> to get started.");
    }
  },500);
}

function allowGetRecentEmail(channels) {
  // channelCount = channels.length;
  channelCount = 1;
  channelToSendTo = [];
  email = [];
  for (i = 0; i < channelCount; i++) {
    channelToSendTo.push(client.channels.cache.find(ch => ch.id === channels[i].id));
    email.push(channels[i].email);
    var today = new Date();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds() + " on " + today.getDate()+'/'+(today.getMonth()+1)+'/'+today.getFullYear();
    console.log("Checking mail from " + email[i] + " at " + time);
  }
  fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
      authorize(JSON.parse(content), getRecentEmail);
  });
}

client.on("message", message => {
  if (message.content == "Checking for mail..." && message.author.id == client.user.id) messageToEdit = message;

  function setName(name, user) {
    console.log("Setting name and role for user "+user+": "+name);
    user.setNickname(name,"Setting name");
    user.roles.add(roleToAdd,"Setting role");
    user.roles.remove(defaultRole,"Removing default role");
  };

  if (message.content.startsWith(call+"name ") && newMembers.indexOf(message.member) != -1) {
    person = message.member;
    nameWithCommand = message.content;
    newName = nameWithCommand.substr(6);
    setName(newName, person);
    newMembers.splice(newMembers.indexOf(message.member),1);
  }

  if (!message.member.roles.cache.has(managerRole)) return; 

  if (message.content.startsWith(call+"rolereact ")) {
    try {
      reactMessageId = message.content.split(" ")[1];
      reactMessageChannelId = message.channel.id;
      reactMessageRole = message.content.split(" ")[2];
      if (!reactMessageRole.startsWith("<")) {
        message.reply(reactMessageRole+" is not a valid role!");
        return;
      }
      reactMessageRole = reactMessageRole.replace(/\D/g,'');
      rolesToAdd.push(reactMessageRole);
      roleReactCreate(reactMessageChannelId,reactMessageId,reactMessageRole);
    } catch (error) {
      message.channel.send("Error creating the reaction. Please check for a space between the ID and role.");
      console.log("There was an error creating the role react message: "+error);
    }
    message.delete({reason:"Role react created"});
  }
  else if (message.content.startsWith(call+"rolereact")) {
    message.reply("Please specify the message ID.\n`!rolereact <MESSAGE ID> <ROLE>`");
  }

  if (message.content.startsWith(call+"mail ") && message.content.length > 6) {
    fs.readFile('channels.json', (err, content) => {
      if (err) return console.log('Error loading emails file:', err);
      var obj = JSON.parse(content);
      obj.push({channelId: message.channel.id, email: message.content.substr(6)});
      fs.writeFile(CHANNEL_PATH, JSON.stringify(obj), (err) => {
      if (err) {
        console.error(err);
        message.reply("There was an error: "+err);
        return;
      }
      console.log("Sending mail to "+message.channel.name+" from "+message.content.substr(6)+" in "+message.channel.guild.name);
      message.reply("I will now send mail here.");
    });
    });
  }
  else if (message.content.startsWith(call+"mail")) {
    message.reply("Please specify the email you want to check.");
  }

  if (message.content.startsWith(call+"checkmail")) {
    message.channel.send("Checking for mail...");
    checkMail = true;
    checkForMail(message.channel.id);
  }
});

function readChannelsFile() {
  fs.readFile('channels.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    var data = JSON.parse(content);
    checkMail = false;
    for (i = 0; i < data.length; i++) {
      checkForMail(data[i].channelId);
    }
  });
}

client.once("ready", () => {
  cacheMessages();
  console.log("---BOT ONLINE---");
  setInterval(function(){readChannelsFile();}, 30 * 60 * 1000);
});