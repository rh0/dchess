<div data-ng-controller="ChessCtrl">
  <h3 class="game-status">Game Status: {{gameStatus}}</h3>
  <h3 class="game-turn">Turn: {{turn}}</h3>
  <input type="button" value="rotate" ng-click="rotateBoard()" />
  <div id="board_content">
    <table id="chess_board">
    <tr data-ng-repeat="boardRow in board">
      <td data-ng-repeat="boardCol in boardRow" class="{{boardCol.col + boardCol.row}} {{boardCol.selected}}">
        <span data-ng-click="clickCapture($event)">{{boardCol.piece}}</span>
      </td>
    </tr>
  </table>
  </div>
</div>
