(function (angular, Drupal, window, undefined) {

angular.module('dChess.controllers', []).
  controller('ChessCtrl', function($scope, gameBoard) {
    $scope.board = gameBoard.board;
    $scope.gameStatus = gameBoard.gameStatus;
    $scope.turn = gameBoard.chessJs.turn();

    $scope.rotateBoard = function() {
      gameBoard.rotate = !gameBoard.rotate;
      gameBoard.generate();
    }

    $scope.clickCapture = function($event) {
      if(gameBoard.isGameOver() === false && gameBoard.chessJs.turn() === gameBoard.clientColor) {
        var clickedSquare = $event.target.parentNode.className.trim();
        if(gameBoard.selected === '') {
          var isPiece = gameBoard.chessJs.get(clickedSquare);
          if(isPiece && isPiece.color === gameBoard.chessJs.turn()) {
            gameBoard.selected = clickedSquare;
          }
        }
        else {
          moveObj = { from: gameBoard.selected, to: clickedSquare };
          gameBoard.makeMove(moveObj);
          gameBoard.sendMove(moveObj);
          gameBoard.selected = '';
        }
        gameBoard.generate();
      }
      $scope.turn = gameBoard.chessJs.turn();
      $scope.gameStatus = gameBoard.gameStatus;
    }

    Drupal.Nodejs.callbacks.dChess = {
      callback: function (message) {
        $scope.$apply(function() { 
          gameBoard.makeMove(message.move)
          gameBoard.isGameOver();
          $scope.board = gameBoard.board;
          $scope.gameStatus = gameBoard.gameStatus;
          $scope.turn = gameBoard.chessJs.turn();
        });
      }
    };

    gameBoard.generate();
  });

}(angular, Drupal, this))
