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
    redis = require("redis"),
    redisDB = redis.createClient();

redisDB.on("error", function (err) {
  console.log("Redis Error! " + err);
});

redisDB.del("userbank");

exports.setup = function (config) {
  publishMessageToClient = config.publishMessageToClient;
  publishMessageToChannel = config.publishMessageToChannel;

  process.on('client-connection', function (sessionId) {
    //console.log('Got connection event for session ' + sessionId);
    //publishMessageToClient(sessionId, {data: {subject: 'Example extension', body: 'Hello, you just connected.'}});
  })
  .on('client-authenticated', function (sessionId, authData) {
    console.log('Got authenticated event for session ' + sessionId + ' (user ' + authData.uid + ')');
    publishMessageToClient(sessionId, {type: 'auth', isauth: true});
    //adding user to the userbank to track sessions
    redisDB.hmset("userbank", sessionId, authData.uid);
    redisDB.hgetall("userbank", function(err, reply) {
      console.log(reply);
    });
  })
  .on('client-message', function (sessionId, message) {
    handleMessage(sessionId, message, config);
  })
  .on('client-disconnect', function (sessionId) {
    console.log('Got disconnect event for session ' + sessionId);
    redisDB.hdel("userbank", sessionId);
    redisDB.hgetall("userbank", function(err, reply) {
      console.log(reply);
    });
  });
};

function handleMessage(sessionId, message, config) {
  switch(message.type) {
    case "initiate-game":
      var gameFromDrupal = JSON.parse(message.gamedata),
          gameChannelId = gameChannel + gameFromDrupal.game_id,
          drupalUid = null;
          
      if(gameFromDrupal != null) {
        config.addClientToChannel(sessionId, gameChannelId);
        console.log("gameId: " + gameChannelId);
        console.log(gameFromDrupal);
        redisDB.exists(gameChannelId, function(err, reply){
          if(reply == 0) {
            redisDB.hmset(gameChannelId, 
                          "w", gameFromDrupal.w, 
                          "b", gameFromDrupal.b,
                          "turn", gameFromDrupal.turn);
          }
        });

        redisDB.hget("userbank", sessionId, function(err, reply) {
          if(err == null) { 
            drupalUid = reply;
            if(drupalUid == gameFromDrupal.w){
              publishMessageToClient(sessionId, {type: 'config',
                                                 channel: gameChannelId,
                                                 playerType: 'w'
                                                 });
              console.log('User: ' + drupalUid + ' is playing white!');
            }
            else if(drupalUid == gameFromDrupal.b) {
              publishMessageToClient(sessionId, {type: 'config',
                                                 channel: gameChannelId,
                                                 playerType: 'b'
                                                 });
              console.log('User: ' + drupalUid + ' is playing black!');
            }
            else {
              publishMessageToClient(sessionId, {type: 'config',
                                                 channel: gameChannelId,
                                                 playerType: 'observer'
                                                 });
            }

            redisDB.hgetall(gameChannelId, function(err, reply){
              console.log(reply);
            });
          }
        });
      }
      break;
    case "move":
      // We need to do some light server validation.  Make sure that the move is
      // coming from the session and for the color we expect.
      redisDB.hget("userbank", sessionId, function(err, reply) {
        if(err == null) {
          // Grab our drupal UID for this session.
          drupalUid = reply;
          // Load the game for this channel.
          redisDB.hgetall(message.channel, function (err, gameObj) {
            // Is it this users turn to play?
            if(gameObj[gameObj.turn] == drupalUid) {
              // Update 'turn' in our game store, and send the move out to the channel.
              redisDB.hmset(message.channel, 'turn', message.turn);
              config.publishMessageToChannel(message);
              console.log(gameObj.turn + ' made a valid move ' + message.moveFen);
            }
          });
        }
      });
      break;
  }
}
