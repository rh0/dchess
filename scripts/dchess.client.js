(function (angular, window, undefined) {

angular.module('dChess', ['dChess.service', 'dChess.controllers']).
  run(function(gameBoard) {
    gameBoard.initialize();
    gameBoard.generate();
  });

}(angular, this));
