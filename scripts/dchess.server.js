/**
 * Example server extension for nodejs
 *
 * With this extension loaded, a message is written to the console when a client
 * connects, is authenticated, sends a message, or disconnects.
 *
 * If you have the nodejs_notify module enabled, users are also shown a message
 * when they connect, are authenticated, or send a message.
 */

// Consider reworking this var into a module, and including our functions below.
// This is likely better practice, and at least will allow for some experience.

exports.setup = function (config) {
  process.on('client-message', function (sessionId, message) {
    if(config.settings.debug) {
      console.log("Recieved a message: \n");
      console.log(message);
    }
    handleMessage(sessionId, message, config);
  });
};

function handleMessage(sessionId, message, config) {
  switch(message.type) {
    case "move":
      message.messageType = message.type;
      config.sendMessageToBackend(message, function(error, responce, body) {
        if(error) {
          console.log("Error sending message to backend: ", error);
          return;
        }
        sendMessageToTokenChannel(message, config);
        if(config.settings.debug) {
          console.log("Derpal responce: ", body);
        }
      });
      break;
  }
}

function sendMessageToTokenChannel(message, config) {
  if (!message.hasOwnProperty('channel')) {
    console.log('publishMessageToContentChannel: An invalid message object was provided.');
    //response.send({error: 'Invalid message'});
    return;
  }
  if (!config.tokenChannels.hasOwnProperty(message.channel)) {
    console.log('publishMessageToContentChannel: The channel "' + message.channel + '" doesn\'t exist.');
    //response.send({error: 'Invalid message'});
    return;
  }

  for (var socketId in config.tokenChannels[message.channel].sockets) {
    config.publishMessageToClient(socketId, message);
  }
  //response.send({sent: 'sent'});
}
