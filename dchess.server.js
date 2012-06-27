/**
 * Example server extension for nodejs
 *
 * With this extension loaded, a message is written to the console when a client
 * connects, is authenticated, sends a message, or disconnects.
 *
 * If you have the nodejs_notify module enabled, users are also shown a message
 * when they connect, are authenticated, or send a message.
 */

var publishMessageToClient,
    publishMessageToChannel,
    gameChannel = 'global_chess_channel',
    gameCount = 0,
    redis = require("redis"),
    gameBank = redis.createClient();

gameBank.on("error", function (err) {
  console.log("Redis Error! " + err);
});

gameBank.hmset("game", "channel", gameChannel);

exports.setup = function (config) {
  publishMessageToClient = config.publishMessageToClient;
  publishMessageToChannel = config.publishMessageToChannel;

  process.on('client-connection', function (sessionId) {
    console.log('Got connection event for session ' + sessionId);
    //publishMessageToClient(sessionId, {data: {subject: 'Example extension', body: 'Hello, you just connected.'}});
  })
  .on('client-authenticated', function (sessionId, authData) {
    console.log('Got authenticated event for session ' + sessionId + ' (user ' + authData.uid + ')');
    //publishMessageToClient(sessionId, {data: {subject: 'Example extension', body: 'Welcome, you are authenticated.'}});
    config.addClientToChannel(sessionId, gameChannel);
    console.log(gameBank.ping());
    gameBank.hvals("game", function(err, reply) {
      console.log(reply);
    });
    gameBank.hset("game", "player1", authData.uid);
    gameBank.hvals("game", function(err, reply) {
      console.log(reply);
    });
  })
  .on('client-message', function (sessionId, message) {
    console.log('Got message event for session ' + sessionId + ': Fen -> ' + message.moveFen);
    handleMessage(sessionId, message);
//    publishMessageToClient(sessionId, {data: {subject: 'Example extension', body: 'You sent the message: ' + require('util').inspect(message)}});
  })
  .on('client-disconnect', function (sessionId) {
    console.log('Got disconnect event for session ' + sessionId);
  });
};

function handleMessage(sessionId, message) {
  if(message.type == 'move') {
    message.channel = gameChannel;
    publishMessageToChannel(message);
  }
}
