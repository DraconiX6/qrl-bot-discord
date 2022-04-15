//GOOGLE CODE

const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/gmail.modify'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
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
    // if (labels.length) {
    //   console.log('Labels:');
    //   labels.forEach((label) => {
    //     console.log(`- ${label.name}`);
    //   });
    // } else {
    //   console.log('No labels found.');
    // }
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

const call = "!";
const managerRole = "492250278784139264";
const secretChannel = "801951035161444442";

defaultRoleId = "753543665053335552";
roleToAddId = "492242981726978058";
newMembersChannelId = "492677607327006720";
mailNotificationRole = "763538056997109761";

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
  // reactMessageId = message.id;
  // reactMessageChannelId = message.channel.id;
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
    // console.log(reaction.message.guild.members.fetch(user.id));
    // .then(guildmember => guildmember.roles.add(reactionRoleToAdd));
    // reaction.message.guild.member(user.id).roles.add(reactionRoleToAdd);
  }
    // roleId = rolesToAdd[messageIds.indexOf(reaction.message.id)];
    // funnyRole = reaction.message.guild.roles.fetch(roleId).then(console.log);
    // userToAddRole = reaction.users.fetch()
    // .then(users => users.sweep(user => user.))
    // .then(user => {
      // userToGuildMember = reaction.users.fetch()
      // .then(console.log);
      // .then(users => users.sweep(user => reaction.message.guild.member(user).roles.cache.has(roleId)));
      // setTimeout(() => {
      //   console.log(userToGuildMember);
        // userToGuildMember.sweep(user => user.roles.cache.has(roleId));
      //   for (i=0;i<2;i++) {
      //     console.log(userToGuildMember);
      //     userToGuildMember.first().roles.add(roleId);
      //   }
      // },2000)
    // });
  // };
    // .then(user => reaction.message.guild.member(user.first()).roles.add(reactionRoleToAdd));
    //console.log(user.first)
    // reaction.message.guild.member(user.last).roles.add(mailNotificationRole)
    // .then(user => reaction.message.guild.member(user.first()).roles.add(mailNotificationRole)) //user => reaction.message.guild.member(user).roles.add(mailNotificationRole) // user => reaction.message.guild.member(user.array[0]).roles.add(mailNotificationRole)
    // .then(console.log("Role given to "+reaction.message.guild.member(userToAddRole.first()).name));
    // userToAddRole = userToAddRole.array()[0]
    // .then(user => console.log(reaction.message.guild.member(user)));
    // userToAddRole = reaction.message.guild.members.fetch(userToAddRole.id)
    // setTimeout(() => {
    //   console.log(userToAddRole);
    //   console.log(userToAddRole.roles);
    //   userToAddRole.roles.add(mailNotificationRole);
    // },5000);
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

// function editOrSendMessage(message,i) {
//   if (checkMail) messageToEdit.edit(message);
//   else channelToSendTo[i-1].send(message);
// }

function getRecentEmail(auth) {
  for (i = 0; i < channelCount; i++) {
    var ihatenodejs = i;
    // OLD gmail.users.messages.list({auth: auth, userId: 'me', 'q': "is:unread from:"+email[ihatenodejs]}, function(err, response) {
      // REAL, MAKE SURE TO CHANGE gmail.users.messages.list({auth: auth, userId: 'me', 'q': "is:unread {from:(verena@questionable.co.nz) from:(kevin@questionable.co.nz)}"}, function(err, response) {
        gmail.users.messages.list({auth: auth, userId: 'me', 'q': "is:unread {from:(verena@questionable.co.nz) from:(kevin@questionable.co.nz)}"}, function(err, response) {
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
          // if (channelToSendTo[ihatenodejs].guild.roles.cache.has(role => role.name === "Mail notifications")) editOrSendMessage(response['data'].resultSizeEstimate + ` new emails from ` + email[ihatenodejs] + ` ${mailNotificationRole}!`,i);
          // else editOrSendMessage(response['data'].resultSizeEstimate + ` new emails from ` + email[ihatenodejs] + `!`,i);
          for (i = 0; i < response['data'].resultSizeEstimate; i++) {
            var message_id = response['data']['messages'][i]['id'];
            gmail.users.messages.get({auth: auth, userId: 'me', 'id': message_id}, function(err, response) {
              if (err) {
                  console.log('Error getting messages: ' + err);
                  return;
              }
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
                else { // if (responseParts[0]['mimeType'] == 'text/html') {
                  console.log("Error: Email suck, or there was another error. Send with a better client next time dummy");
                  channelToSendTo[ihatenodejs].send("Error: Got message but it was probably sent with some scuffed client. Try again with less scuffed client like gmail or smth");
                  return;
                }
              } catch {
                console.log("lol");
                return;
              }

              function decodeBodyData(bodyData) {
                buff = Buffer.from(bodyData, 'base64');
                return buff.toString();
              }

                if (responseParts[0].mimeType == 'multipart/alternative') responseParts = responseParts[0]['parts'];
                if (responseParts[1].mimeType == 'text/html') {
                  fullMessage = decodeBodyData(responseParts[1].body.data);
                  dateAndTimeSent = today.getYear().toString()+today.getMonth().toString()+today.getDate().toString()+today.getHours().toString()+today.getMinutes().toString()+today.getSeconds().toString();
                  // OLD fullMessageName = "./fullMessages/"+email+" sent on "+dateAndTimeSent+".html";
                  fullMessageName = "./fullMessages/email sent on "+dateAndTimeSent+".html";
                  fs.writeFile(fullMessageName,fullMessage, (err) => {
                    if (err) return console.error(err);
                  });
                  client.channels.cache.find(ch => ch.id === secretChannel).send({files:[{attachment:fullMessageName}]});
                  setTimeout(() => {fullMessageUrl = client.channels.cache.find(ch => ch.id === secretChannel).lastMessage.attachments.first().url;},2000);

                  insert = function insert(main_string, ins_string, pos) {
                    if(typeof(pos) == "undefined") {
                     pos = 0;
                    }
                    if(typeof(ins_string) == "undefined") {
                     ins_string = '';
                    }
                    return main_string.slice(0, pos) + ins_string + main_string.slice(pos);
                  }

                  text = decodeBodyData(message_raw)
                  .replace(/\*/g,'').replace(/\r?\n|\r/g," ");

                  // lineBreaks = [];
                  // fullMessageForLineBreaks = fullMessage.split("p dir");
                  // for (i=0;i<fullMessageForLineBreaks.length-1;i++) {
                  //   // console.log(fullMessageForLineBreaks[i+1].split("pre-wrap")[1].substr(2).split('span')[0]);
                  //   //try { 
                  //     lineBreaks.push(fullMessageForLineBreaks[i+1].split("pre-wrap")[1].substr(2).split('span')[0]);
                  //     lineBreaks[i] = lineBreaks[i].substr(0,lineBreaks[i].length-2);
                  //     // console.log(lineBreaks[i].replace(/&lt;b\1&gt;/g,'').split("<")[0]);
                  //     text = insert(text,"\n",text.search(lineBreaks[i].replace(/&lt;b\1&gt;/g,'').split("<")[0]));
                  //   //} catch {console.log("couldn't fix the linebreaks unlucky");}
                  // }

                  // links = fullMessage.split('href=');
                  // linkText = [];
                  // for (i=0;i<links.length-1;i++) {
                  //   linkText.push(links[i].split('pre-wrap')[1].substr(2).split('span')[0]);
                  //   linkText[i] = linkText[i].substr(0,linkText[i].length-2);
                  //   links[i] = links[i].split(' ')[0];
                  //   links[i] = links[i].substr(1,links[i].length-2);
                  // }
                }
              setTimeout(() => {
                // for (i=0;i<linkText.length;i++) {
                //   textToReplace = linkText[i] + " <" + links[i] + ">";
                //   text = text.split(textToReplace).join(`[${linkText[i]}](${links[i]})`);
                // }
                textChunks = chunk(text,1023);
                textSplits = Math.ceil(text.substr(2047).length / 1024);
                embed = [];
                for (i=0;i<Math.ceil(text.length/5900);i++) {
                  embed.push(new MessageEmbed()
                    .setColor('#0099ff')
                    .setAuthor('Click to download this message', 'https://cdn.discordapp.com/avatars/743691445063516220/54083ff3ba6a16fd00621bbea3b29fd3.png', fullMessageUrl)
                    // .setTitle(`Email from ${email[ihatenodejs]} - Part ${i+1} of ${Math.ceil(text.length/5950)}`)
                    .setTitle(`New email - Part ${i+1} of ${Math.ceil(text.length/5950)}`)
                    // .setDescription(text.substr(0,2047))
                    .setTimestamp()
                    .setDescription(textChunks.shift()+textChunks.shift())
                  )
                  // console.log(embed[i].description.substr(embed[i].description.length-9));
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
                // textSplits = text.substr(2047).length / 1024;
                // if (textSplits > 3.7) {
                //   for (i = 0; i < 3; i++) {
                //     embed.addField("‎",text.substr(2047+i*1023,1023),false);
                //   }
                //   embed.addField("‎",text.substr(2047+textSplits*1023,1023),false);
                //   embed.setFooter('Email exceeds Discord character limit. Please download the full email using the link at the top of this message.');
                // }
                // else {
                //   for (i = 0; i < textSplits; i++) {
                //     embed.addField("‎",text.substr(2047+i*1023,1023),false);
                //   }
                //   embed.setFooter('End of message');
                // }

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
                  // mailNotificationRole = channelToSendTo[ihatenodejs].guild.roles.cache.find(role => role.id == mailNotificationRole);
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
                      // embed.attachFiles(['./attachments/'+attachmentNames[i]])
                      // .setImage('attachment://'+attachmentNames[i]);
                      // fs.unlinkSync('./attachments/'+attachmentNames[i]);
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
  // checkForEmail(channel.id.toString());
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

  // if (message.content == reactMessage && message.author == client.user) roleReactCreate(message);

  function setName(name, user) {
    console.log("Setting name and role for user "+user+": "+name);
    user.setNickname(name,"Setting name");
    user.roles.add(roleToAdd,"Setting role");
    user.roles.remove(defaultRole,"Removing default role");
  };

  // for (i = 0; i < newMembers.length; i++) {
  //   try {
  //     if (message.content.startsWith(call+"name ") && newMembers[i] == message.member) {
  //       person = message.member;
  //       nameWithCommand = message.content;
  //       name = nameWithCommand.substr(6);
  //       setName(name, person);
  //     }
  //   }
  //     catch (error) {
  //       console.log("Error: Message sent in channel without new person!");
  //   }
  // }

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
      // message.channel.send(reactMessage);
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

// function checkForEmail(channel) {
//   checkMail = true;
//   emailsToSendTo = [];
//   fs.readFile('channels.json', (err, content) => {
//     if (err) return console.log('Error loading channels file:', err);
//     var data = JSON.parse(content);
//     for (i = 0; i < data.length; i++) {
//       if (data[i].channelId == channel) {
//         mailChecked = true;
//         emailsToSendTo.push({id: data[i].channelId, email: data[i].email});
//       }
//     }
//   });
// }

client.once("ready", () => {
  cacheMessages();
  console.log("---BOT ONLINE---");
  setInterval(function(){readChannelsFile();}, 30 * 60 * 1000);
});