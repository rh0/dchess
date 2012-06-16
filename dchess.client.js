(function ($) {

var pieces = {
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
};

var chess = new Chess();

//Take the curent game state, and render on a blank board.
function renderBoard() {
  var fen = chess.fen();
  var board = fen.split(' ');
  board = board[0].split('/').reverse();

  //clear the pieces from the board
  $('.piece').remove();

  for(row=0; row<8; row++) {
    var col = 65;
    rowInstructions = board[row].split('');
    for(instruction in rowInstructions) {
      if(!$.isNumeric(rowInstructions[instruction])) {
        $('#' + String.fromCharCode(col) + (row+1)).html('<a href="#" class="piece">' + pieces[rowInstructions[instruction]] + '</a>');
        col++;
      } else {
        col = col+Number(rowInstructions[instruction]);
      }
    }
  }
}


Drupal.behaviors.clientGame = {
  attach: function(context, settings) {
    renderBoard();
    game = new Object();
    game.gameOver = false;
    game.endState = '';
    game.move = new Object();
    game.move.from='';
    game.move.to='';

    //Click action from this browser.
    $('#chess_board td').on('click', function(event) {
      var turn = chess.turn();
      var square = $(this).attr('id');
      var piece = chess.get(square.toLowerCase());
      if(game.move.from == '' && piece != null && piece.color == turn && !game.gameOver) {
        $(this).addClass('selected');
        game.move.from = square.toLowerCase();
    //    alert(square + ' has ' + piece.type);  
      } 
      else if(game.move.from != '') {
        game.move.to = square.toLowerCase();
        var mvRet = chess.move(game.move);
        $('#' + game.move.from.toUpperCase()).removeClass('selected');
        game.move.from = game.move.to = '';
        if(mvRet != null){
          //ss.rpc('movePub.sendMove', chess.fen());
          renderBoard();
          if(game.gameOver = chess.game_over()) {
            game.endState = chess.in_checkmate() ? 'CHECKMATE!' : game.endState + '';
            game.endState = chess.in_draw() ? 'DRAW!' : game.endState + '';
            game.endState = chess.in_stalemate() ? 'STALEMATE!' : game.endState + '';
            game.endState
            alert('The Game is Over! \n' + game.endState);
          }
        }
      }
      return false;
    });

    //Move event coming from the server.
/*    ss.event.on('moveFen', function(fen){
      chess.load(fen);
      renderBoard();
      if(game.gameOver = chess.game_over()) {
        game.endState = chess.in_checkmate() ? 'CHECKMATE!' : game.endState + '';
        game.endState = chess.in_draw() ? 'DRAW!' : game.endState + '';
        game.endState = chess.in_stalemate() ? 'STALEMATE!' : game.endState + '';
        game.endState
        alert('The Game is Over! \n' + game.endState);
      }
    });*/
  }
}

})(jQuery);
