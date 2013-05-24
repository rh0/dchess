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
var publishMessageToClient,
    publishMessageToChannel,
    gameChannel = 'chessChannel',
    gameCount = 0;

exports.setup = function (config) {
  publishMessageToClient = config.publishMessageToClient;
  publishMessageToChannel = config.publishMessageToChannel;

  process.on('client-connection', function (sessionId) {
    console.log('Got connection event for session ' + sessionId);
    //publishMessageToClient(sessionId, {data: {subject: 'Example extension', body: 'Hello, you just connected.'}});
  })
  .on('client-authenticated', function (sessionId, authData) {
    console.log('Got authenticated event for session ' + sessionId + ' (user ' + authData.uid + ')');
    console.log(authData);
    //publishMessageToClient(sessionId, {type: 'auth', isauth: true});
  })
  .on('client-message', function (sessionId, message) {
    console.log("Recieved a message: \n");
    console.log(message);
    handleMessage(sessionId, message, config);
  })
  .on('client-disconnect', function (sessionId) {
    console.log('Got disconnect event for session ' + sessionId);
  });
};

function handleMessage(sessionId, message) {
  switch(message.type) {
    case "move":
      publishMessageToChannel(message);
      break;
  }
}
