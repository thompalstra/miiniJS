<?php

$count = 0;
$items = [];

while( $count < 50 ){
  $count++;
  $items[] = htmlentities("<div class='block cw-xs-100'>
    <div class='content'>

    </div>
  </div>");
}

echo json_encode( $data = [
  'success' => $success,
  'items' => $items,
] ); exit();

?>
