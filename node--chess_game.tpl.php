<?php
?>
<div id="node-<?php print $node->nid; ?>" class="<?php print $classes; ?>"<?php print $attributes; ?> data-ng-app="dChess">

  <?php print render($title_prefix); ?>
  <?php if (!$page): ?>
    <h2<?php print $title_attributes; ?>><a href="<?php print $node_url; ?>"><?php print $title; ?></a></h2>
  <?php endif; ?>
  <?php print render($title_suffix); ?>

  <div class="content clearfix"<?php print $content_attributes; ?> data-ng-controller="ChessCtrl">
    <div class="chess-info">
      <div class="field game-status">
        <div class="field-label">Game Status: </div>
        <span>{{gameStatus}}</span>
      </div>
      <div class="field game-turn">
        <div class="field-label">Turn: </div>
        <span>{{turn}}</span>
      </div>
      <?php print render($content['field_opponent']); ?>
      <input type="button" value="rotate" data-ng-click="rotateBoard()" />
    </div>

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

  <div class="clearfix">
    <?php if (!empty($content['links'])): ?>
      <div class="links"><?php print render($content['links']); ?></div>
    <?php endif; ?>

    <?php print render($content['comments']); ?>
  </div>

</div>
