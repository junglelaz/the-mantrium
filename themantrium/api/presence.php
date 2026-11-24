<?php
// Ephemeral anonymous presence. No IP addresses, messages or permanent profiles stored.
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo '{"error":"POST required"}'; exit; }
$origin = parse_url($_SERVER['HTTP_ORIGIN'] ?? '', PHP_URL_HOST);
if (!$origin || strtolower($origin) !== strtolower($_SERVER['HTTP_HOST'] ?? '')) { http_response_code(403); echo '{"error":"Origin denied"}'; exit; }
if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 2048) { http_response_code(413); exit; }
session_name('mantrium_presence');
session_set_cookie_params(['lifetime'=>0,'path'=>'/themantrium/','secure'=>true,'httponly'=>true,'samesite'=>'Strict']);
session_start();
if (empty($_SESSION['orb'])) $_SESSION['orb'] = bin2hex(random_bytes(12));
$id = $_SESSION['orb'];
$now = microtime(true);
if ($now - ($_SESSION['lastPresence'] ?? 0) < .7) { session_write_close(); http_response_code(429); echo '{"peers":[]}'; exit; }
$_SESSION['lastPresence'] = $now;
session_write_close();
$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) { http_response_code(400); exit; }
foreach (['x','y','z'] as $key) if (!isset($input[$key]) || !is_numeric($input[$key]) || !is_finite((float)$input[$key])) { http_response_code(400); exit; }
$x=max(-70,min(70,(float)$input['x']));$y=max(-65,min(12,(float)$input['y']));$z=max(-70,min(70,(float)$input['z']));
$zone = in_array($input['zone'] ?? '', ['hall','creation','knowledge','intelligence','origin','secret'], true) ? $input['zone'] : 'hall';
$mask = max(0,min(15,(int)($input['pigments'] ?? 0)));
$file = sys_get_temp_dir().'/mantrium-presence-'.hash('sha256',__DIR__).'.json';
$handle = @fopen($file,'c+');
if (!$handle || !flock($handle,LOCK_EX)) { http_response_code(503); echo '{"peers":[]}'; exit; }
@chmod($file,0600);
$state = json_decode(stream_get_contents($handle),true) ?: [];
foreach ($state as $key=>$peer) if ($now-($peer['seen']??0)>15) unset($state[$key]);
if(count($state)>=200 && !isset($state[$id])) {flock($handle,LOCK_UN);fclose($handle);http_response_code(503);echo '{"peers":[]}';exit;}
$old=$state[$id]??[];
$visit=$input['visit']??'';
if(!is_string($visit)||!preg_match('/^[a-f0-9-]{36}$/D',$visit)) $visit='';
$same=$visit!=='' && ($old['visit']??'')===$visit;
$shared=$same && !empty($old['shared']);
$announced=$same && !empty($old['announced']);
if($visit!=='' && !$announced && $mask===15 && ($input['opened']??false)===true){
 foreach($state as $key=>&$recipient) if($key!==$id && !empty($recipient['visit'])) $recipient['shared']=true;
 unset($recipient);
 $announced=true;
}
$pulse=$old['pulse']??0;
if(!empty($input['pulse'])&&$now-$pulse>6)$pulse=$now;
$state[$id]=['id'=>$id,'x'=>$x,'y'=>$y,'z'=>$z,'zone'=>$zone,'pigments'=>$mask,'seen'=>$now,'pulse'=>$pulse,'visit'=>$visit,'shared'=>$shared,'announced'=>$announced];
$peers=[];foreach($state as $key=>$peer)if($key!==$id&&$peer['zone']===$zone){$d=hypot($peer['x']-$x,$peer['z']-$z);if($d<35){$peer['distance']=$d;unset($peer['seen'],$peer['visit'],$peer['shared'],$peer['announced']);$peers[]=$peer;}}
usort($peers,function($a,$b){return $a['distance']<=>$b['distance'];});
ftruncate($handle,0);rewind($handle);fwrite($handle,json_encode($state));fflush($handle);flock($handle,LOCK_UN);fclose($handle);
echo json_encode(['id'=>$id,'peers'=>array_slice($peers,0,8),'time'=>$now,'shared'=>$shared,'announced'=>$announced]);
