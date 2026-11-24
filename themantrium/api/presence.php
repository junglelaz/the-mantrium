<?php
// The current hall bubble and a short movement trail share the anonymous presence lease.
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo '{"error":"POST required"}'; exit; }
$origin = parse_url($_SERVER['HTTP_ORIGIN'] ?? '', PHP_URL_HOST);
if (!$origin || strtolower($origin) !== strtolower($_SERVER['HTTP_HOST'] ?? '')) { http_response_code(403); echo '{"error":"Origin denied"}'; exit; }
if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 4096) { http_response_code(413); exit; }
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
// Each sender timestamps its own trail. Only differences within one trail matter.
$tick=$input['tick']??null;
$live=is_int($tick)&&$tick>0&&$tick<9007199254740991;
$trail=[];
$speech=null;
if($live && $zone==='hall'){
 $last=$tick-4100;
 $points=$input['trail']??[];
 if(is_array($points))foreach(array_slice($points,-26) as $point){
  if(!is_array($point)||count($point)!==4||!isset($point[0],$point[1],$point[2],$point[3]))continue;
  [$t,$px,$py,$pz]=$point;
  if(!is_int($t)||$t<=$last||$t>=$tick)continue;
  foreach([$px,$py,$pz] as $v)if(!is_numeric($v)||!is_finite((float)$v))continue 2;
  $trail[]=[$t,round(max(-70,min(70,(float)$px)),3),round(max(-65,min(12,(float)$py)),3),round(max(-70,min(70,(float)$pz)),3)];
  $last=$t;
 }
 $text=$input['speech']??null;
 if(is_string($text)&&strlen($text)<=960&&preg_match('/^.{0,240}\z/su',$text)){
  $speech=preg_replace('/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/u','',$text);
 }
}
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
$opening=$same?($old['opening']??null):null;
$announced=$same && !empty($old['announced']);
if($visit!=='' && !$announced && $mask===15 && ($input['opened']??false)===true){
 foreach($state as $key=>&$recipient) if($key!==$id && !empty($recipient['visit'])) { $recipient['shared']=true; $recipient['opening']=$visit; }
 unset($recipient);
 $announced=true;
}
$pulse=$old['pulse']??0;
if(!empty($input['pulse'])&&$now-$pulse>6)$pulse=$now;
$state[$id]=['id'=>$id,'x'=>$x,'y'=>$y,'z'=>$z,'zone'=>$zone,'pigments'=>$mask,'seen'=>$now,'tick'=>$live?$tick:(int)round($now*1000),'trail'=>$trail,'speech'=>$speech,'pulse'=>$pulse,'visit'=>$visit,'opening'=>$opening,'shared'=>$shared,'announced'=>$announced];
$peers=[];foreach($state as $key=>$peer)if($key!==$id&&$peer['zone']===$zone){$d=hypot($peer['x']-$x,$peer['z']-$z);if($d<35){$peer['distance']=$d;
 if(!$live||$zone!=='hall'){unset($peer['trail'],$peer['tick'],$peer['speech']);}
 elseif($now-$peer['seen']>6){$peer['speech']=null;}
 unset($peer['seen'],$peer['opening'],$peer['visit'],$peer['shared'],$peer['announced']);$peers[]=$peer;}}
usort($peers,function($a,$b){return $a['distance']<=>$b['distance'];});
ftruncate($handle,0);rewind($handle);fwrite($handle,json_encode($state));fflush($handle);flock($handle,LOCK_UN);fclose($handle);
echo json_encode(['id'=>$id,'peers'=>array_slice($peers,0,8),'time'=>$now,'opening'=>$opening,'shared'=>$shared,'announced'=>$announced]);
