(function ($) {

var clientGame = {
  pieces: {
    'p': '&#9823;',
    'r': '&#9820;',
    'n': '&#9822;',
    'b': '&#9821;',
    'k': '&#9818;',
    'q': '&#9819;',
    'P': '&#9817;',
    'R': '&#9814;',
    'N': '&#9816;',
    'B': '&#9815;',
    'Q': '&#9813;',
    'K': '&#9812;'
  },
  canPlay: false,
  playerType: 'prohibited',
  gameOver: false,
  endState: '',
  'move': {
    'from': '',
    'to': '',
  },
  chess: new Chess(),
  renderBoard: function () {
    var fen = this.chess.fen();
    var board = fen.split(' ');
    board = board[0].split('/').reverse();

    //clear the pieces from the board
    $('.piece').remove();

    for(row=0; row<8; row++) {
      var col = 65;
      rowInstructions = board[row].split('');
      for(instruction in rowInstructions) {
        if(!$.isNumeric(rowInstructions[instruction])) {
          $('#' + String.fromCharCode(col) + (row+1)).html('<a href="#" class="piece">' + this.pieces[rowInstructions[instruction]] + '</a>');
          col++;
        } else {
          col = col+Number(rowInstructions[instruction]);
        }
      }
    }
  }
}

function nodeSend (message) {
  Drupal.Nodejs.socket.emit('message', message);
}

//recieves message from the node server
Drupal.Nodejs.callbacks.dChess = {
  callback: function(message) {
    //Got an auth message from node
    if(message.type == 'auth' && message.isauth == true) {
      //we're authenticated so tell node what game we're looking at 
      //grabbing our JSON coming from the Drupal menu callback
      if(Drupal.settings.dchess != undefined){
        nodeSend({
          type: 'initiate-game',
          gamedata: Drupal.settings.dchess
        });
      }
    }
    if(message.channel == 'global_chess_channel') {
      clientGame.chess.load(message.moveFen);
      clientGame.renderBoard();
      if(clientGame.gameOver = clientGame.chess.game_over()) {
        clientGame.endState = clientGame.chess.in_checkmate() ? 'CHECKMATE!' : clientGame.endState + '';
        clientGame.endState = clientGame.chess.in_draw() ? 'DRAW!' : clientGame.endState + '';
        clientGame.endState = clientGame.chess.in_stalemate() ? 'STALEMATE!' : clientGame.endState + '';
        alert('The Game is Over! \n' + clientGame.endState);
      }
    }
  }
};

//Pageload has occured
Drupal.behaviors.clientGame = {
  attach: function(context, settings) {

    clientGame.renderBoard();

    //Click action from this browser.
    $('#chess_board td').on('click', function(event) {
      var turn = clientGame.chess.turn();
      var square = $(this).attr('id');
      var piece = clientGame.chess.get(square.toLowerCase());
      if(clientGame.move.from == '' && piece != null && piece.color == turn && !clientGame.gameOver) {
        $(this).addClass('selected');
        clientGame.move.from = square.toLowerCase();
      } 
      else if(clientGame.move.from != '') {
        clientGame.move.to = square.toLowerCase();
        var mvRet = clientGame.chess.move(clientGame.move);
        $('#' + clientGame.move.from.toUpperCase()).removeClass('selected');
        if(mvRet != null){
          //alert(Drupal.Nodejs.socket.socket.sessionid);
          nodeSend({
            type: 'move',
            moveFen: clientGame.chess.fen()
          });
          clientGame.renderBoard();
          if(clientGame.gameOver = clientGame.chess.game_over()) {
            clientGame.endState = clientGame.chess.in_checkmate() ? 'CHECKMATE!' : clientGame.endState + '';
            clientGame.endState = clientGmae.chess.in_draw() ? 'DRAW!' : clientGame.endState + '';
            clientGame.endState = clientGame.chess.in_stalemate() ? 'STALEMATE!' : clientGame.endState + '';
            alert('The Game is Over! \n' + clientGame.endState);
          }
          clientGame.move.from = clientGame.move.to = '';
        }
      }
      return false;
    });
  }
}

})(jQuery);
