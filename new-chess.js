angular.module('dChess.service', []).
  value('gameBoard', {
    board: [],
    rotate: false,
    chessJs: new Chess(),
    pieces: {
      'p': '\u265F',
      'r': '\u265C',
      'n': '\u265E',
      'b': '\u265D',
      'k': '\u265A',
      'q': '\u265B',
      'P': '\u2659',
      'R': '\u2656',
      'N': '\u2658',
      'B': '\u2657',
      'Q': '\u2655',
      'K': '\u2654'
    },
    selected: '',
    initialize: function() {
      this.board = new Array(8);
      for(var i=0; i<this.board.length; i++) {
        this.board[i] = new Array(8);
      }
    },
    renderGame: function() {
      var fenBoard = this.chessJs.fen().split(' ');
      fenBoard = fenBoard[0].split('/');
      if(this.rotate) { fenBoard.reverse(); }
      for(var r=0; r<8; r++) {
        var c=0;
        var rowInstructions = fenBoard[r].split('');
        if(this.rotate) { rowInstructions.reverse(); }
        for(squareInstructions in rowInstructions) {
          if(isNaN(rowInstructions[ squareInstructions ])) {
            this.board[r][c].piece = this.pieces[rowInstructions[squareInstructions]];
            if(this.selected.indexOf(this.board[r][c].col + this.board[r][c].row) != -1) {
              this.board[r][c].selected = 'selected';
            }
            c++;
          }
          else {
            c = c+(Number(rowInstructions[squareInstructions]));
          }
        }
      }
    },
    generate: function() {
      for(var iRow=0; iRow<8; iRow++) {
        for(var iCol=0; iCol<8; iCol++) {
          this.board[iRow][iCol] = {
            piece: '',
            selected: '',
            row: this.rotate ? iRow + 1 : (7 - iRow)+1,
            col: String.fromCharCode(this.rotate ? (7 - iCol)+97 : iCol+97)
          };
        }
      }
      this.renderGame();
    },
    makeMove: function(moveObj) {
      this.chessJs.move(moveObj);
      this.renderGame();
    }

});

angular.module('dChess', ['dChess.service']).
  run(function(gameBoard) {
    gameBoard.initialize();
    gameBoard.generate();
  });

var ChessCtrl = function($scope, gameBoard) {
  $scope.board = gameBoard.board;

  $scope.rotateBoard = function() {
    gameBoard.rotate = !gameBoard.rotate;
    gameBoard.generate();
  }

  $scope.clickCapture = function($event) {
    var clickedSquare = $event.target.parentNode.className.toLowerCase().trim();
    if(gameBoard.selected === '') {
      var isPiece = gameBoard.chessJs.get(clickedSquare);
      if(isPiece && isPiece.color === gameBoard.chessJs.turn()) {
        gameBoard.selected = clickedSquare;
      }
    }
    else {
      gameBoard.makeMove({ from: gameBoard.selected, to: clickedSquare });
      gameBoard.selected = '';
    }
    gameBoard.generate();
  }

  gameBoard.generate();
};
