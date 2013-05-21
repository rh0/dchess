(function (angular, Drupal, window, undefined) {

angular.module('dChess', ['dChess.service', 'dChess.controllers']).
  run(function(gameBoard) {
    var initDrupal = angular.fromJson(Drupal.settings.dchess);
    gameBoard.clientColor = initDrupal.color;
    if(gameBoard.clientColor === 'b') {
      gameBoard.rotate = true;
    }

    gameBoard.initialize();
    gameBoard.generate();
  });

}(angular, Drupal, this));
