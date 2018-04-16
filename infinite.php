<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$url = "https://api.imgur.com/3/gallery/hot/viral/0.json";




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
  // CURLOPT_HTTPHEADER    => array(
  //   'Authentication' => 'd6da9628856f6ae'
  // )
);
$url = $url . '?' . http_build_query([
  'page' => ++$_GET['page'],
  'perPage' => $_GET['per-page'],
  'client_id' => 'd6da9628856f6ae',
  'client_secret' => '08999076c1dd0af4e102f975f29aaa6a94a23a54'
]);
$ch = curl_init($url);
curl_setopt_array($ch, $options);

$content  = curl_exec($ch);
$items = [];
$message = '';

if( !curl_error($ch) ){
  foreach( json_decode( $content )->data as $post ){
    if( property_exists( $post, 'images_count' ) && $post->images_count > 0 && count( $post->images ) > 0 ){

      $height = $post->images[0]->height;
      $width = $post->images[0]->width;

      $target = 300;

      $bottom = 100;

      if( $height >= $target || $width >= $target ){
        if( $height == $width ){
          $bottom = 100;
        } else {
          if( $height < $width ){
            $bottom = ( $height / $width ) * 100;
          } else if( $width > $height ){
            $bottom = ( $width / $height ) * 100;
          }
        }
      }
      $id = $post->images[0]->id;
      $mimeType = $post->images[0]->type;
      $mime = explode( '/', $post->images[0]->type );
      $mediaType = $mime[0];
      $mediaExt = $mime[1];

      $type = ( $mediaType == 'video' ? 'video' : 'div' );

      $mediaUrl = "https://i.imgur.com/" . $id . "." . $mediaExt;

      if( $type == 'video' ){
          $content =
          "<video class='content' poster='//i.imgur.com/$id.jpg' control preload='auto' autoplay='autoplay' muted='muted' loop='loop' webkit-playsinline='' style='height: 100%'>
                <source src='//i.imgur.com/$id.mp4' type='video/mp4'>
          </video>";
      } else {
          $content = "<div class='content' style='background-image:url($mediaUrl)'>";
      }

      $items[] = [
        'id' => $post->images[0]->id,
        'title' => $post->title,
        'description' => $post->description,
        'link' => $post->link,
        'mediaType' => $mediaType,
        'content' => $content,
        'image' => [
          'small' => [
            'bottom' => "{$bottom}%",
            'url' => $mediaUrl,
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
