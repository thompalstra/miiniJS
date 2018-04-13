<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$url = "https://api.imgur.com/3/gallery/hot/viral/0.json";
$url = str_replace("{page}", $_GET['page'], $url );

$options = array(
  CURLOPT_RETURNTRANSFER => true,   // return web page
  CURLOPT_HEADER         => false,  // don't return headers
  CURLOPT_FOLLOWLOCATION => true,   // follow redirects
  CURLOPT_MAXREDIRS      => 10,     // stop after 10 redirects
  CURLOPT_ENCODING       => "",     // handle compressed
  CURLOPT_USERAGENT      => "test", // name of client
  CURLOPT_AUTOREFERER    => true,   // set referrer on redirect
  CURLOPT_CONNECTTIMEOUT => 120,    // time-out on connect
  CURLOPT_TIMEOUT        => 120,    // time-out on response
  CURLOPT_FAILONERROR    => true,
  CURLOPT_SSL_VERIFYPEER => false,
  CURLOPT_HTTPHEADER    => array(
    'Authentication' => 'd6da9628856f6ae'
  )
);

$ch = curl_init($url);
curl_setopt_array($ch, $options);

$content  = curl_exec($ch);


$items = [];
$message = '';

if( !curl_error($ch) ){
  foreach( json_decode( $content )->data as $post ){
    if( property_exists( $post, 'images_count' ) && $post->images_count > 0 ){

      $height = $post->images[0]->height;
      $width = $post->images[0]->width;

      $target = 300;

      if( ( $height > $width ) || ( $height == $width ) ){
        $ratio = $target / $height;
        $width = $width * $ratio;
        $height = $target;
      } else if( $width > $height ){
        $ratio = $target / $width;
        $height = $height * $ratio;
        $width = $target;
      }

      $items[] = [
        'id' => $post->images[0]->id,
        'title' => $post->title,
        'image' => [
          'small' => [
            'width' => "{$width}px",
            'height' => "{$height}px",
            'url' => "https://i.imgur.com/" . $post->images[0]->id . "." . explode( '/', $post->images[0]->type )[1]
          ]
        ]
      ];
    }
  }
} else {
  $message = curl_error($ch);
}
curl_close($ch);
echo json_encode( [
  'success' => count( $items ) > 0,
  'items' => $items,
  'message' => $message
] ); exit();
?>
