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
    config.addClientToChannel(sessionId, gameChannel);
    //adding user to the userbank to track sessions
    redisDB.hmset("userbank", sessionId, authData.uid);
    redisDB.hgetall("userbank", function(err, reply) {
      console.log(reply);
    });
  })
  .on('client-message', function (sessionId, message) {
    handleMessage(sessionId, message);
  })
  .on('client-disconnect', function (sessionId) {
    console.log('Got disconnect event for session ' + sessionId);
    redisDB.hdel("userbank", sessionId);
    redisDB.hgetall("userbank", function(err, reply) {
      console.log(reply);
    });
  });
};

function handleMessage(sessionId, message) {
  switch(message.type) {
    case "initiate-game":
      var gameFromDrupal = JSON.parse(message.gamedata),
          gameId = "game" + gameFromDrupal.game_id,
          drupalUid = null;
          
      if(gameFromDrupal != null) {
        //console.log("gameId: " + gameId);
        redisDB.exists(gameId, function(err, reply){
          if(reply == 0) {
            redisDB.hmset(gameId, 
                          "white", gameFromDrupal.white, 
                          "black", gameFromDrupal.black,
                          "turn", gameFromDrupal.turn);
          }
        });

        redisDB.hget("userbank", sessionId, function(err, reply) {
          if(err == null) {
            drupalUid = reply;
            if(drupalUid == gameFromDrupal.white){
              redisDB.hmset(gameId, "whiteSess", sessionId);
              console.log('User: ' + drupalUid + ' is playing white!');
            }
            if(drupalUid == gameFromDrupal.black) {
              redisDB.hmset(gameId, "blackSess", sessionId);
              console.log('User: ' + drupalUid + ' is playing black!');
            }

            redisDB.hgetall(gameId, function(err, reply){
              console.log(reply);
            });

          }
        });
      }

      break;
    case "move":
      message.channel = gameChannel;
      publishMessageToChannel(message);
      console.log('Got message event for session ' + sessionId + ': Fen -> ' + message.moveFen);
      break;
  }
}
