<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
function failContact($message,$code=400){http_response_code($code);echo json_encode(['error'=>$message]);exit;}
if($_SERVER['REQUEST_METHOD']!=='POST')failContact('Method not allowed.',405);
$origin=parse_url($_SERVER['HTTP_ORIGIN']??'',PHP_URL_HOST);
if(!$origin||!in_array($origin,['www.mantrium.io','mantrium.io'],true))failContact('Please send from the Mantrium website.',403);
if((int)($_SERVER['CONTENT_LENGTH']??0)>24000)failContact('Message too long.',413);
$data=json_decode(file_get_contents('php://input'),true);
if(!is_array($data))failContact('Please complete the form.');
foreach(['name','email','message','website'] as $key){if(isset($data[$key])&&!is_string($data[$key]))failContact('Invalid form.');}
if(($data['budget']??null)!=='confirmed')failContact('Please confirm your budget before sending.');
$name=trim($data['name']??'');$email=trim($data['email']??'');$message=trim($data['message']??'');
if(!empty($data['website']))failContact('Unable to send this message.');
if(!$name||strlen($name)>400||!filter_var($email,FILTER_VALIDATE_EMAIL)||strlen($email)>254||preg_match('/[\r\n]/',$email)||strlen($message)<1||strlen($message)>20000)failContact('Please enter your name, a valid email and a message.');
$limit=sys_get_temp_dir().'/mantrium-contact-'.hash('sha256',$_SERVER['REMOTE_ADDR']??'unknown');
$lock=fopen($limit,'c+');if(!$lock||!flock($lock,LOCK_EX))failContact('Please try again shortly.',503);
$last=(int)stream_get_contents($lock);if(time()-$last<60)failContact('Please wait a minute before sending another message.',429);
ftruncate($lock,0);rewind($lock);fwrite($lock,(string)time());flock($lock,LOCK_UN);fclose($lock);
$body="Budget: At least $25,000 USD (confirmed)\nName: ".$name."\nEmail: ".$email."\n\n".$message;
$sent=mail('ascend@mantrium.io','New enquiry from The Mantrium',$body,['From'=>'Mantrium website <ascend@mantrium.io>','Reply-To'=>$email,'Content-Type'=>'text/plain; charset=UTF-8']);
if(!$sent)failContact('Unable to send right now. Please use the direct email link below.',503);
echo json_encode(['ok'=>true]);
