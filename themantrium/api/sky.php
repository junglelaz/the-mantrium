<?php
// Public, non-personal diagnostic snapshot. User-specific sunrise stays inside npc.php.
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=60');
header('X-Content-Type-Options: nosniff');
if(($_SERVER['REQUEST_METHOD']??'')!=='GET'){http_response_code(405);exit;}
require_once __DIR__.'/sky-data.php';
$data=mantrium_sky(time());if(!$data['available'])http_response_code(503);
echo json_encode($data,JSON_UNESCAPED_SLASHES);
