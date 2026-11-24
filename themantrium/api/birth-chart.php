<?php
require_once __DIR__.'/sky-data.php';
// Accept only bounded numeric chart data. Never forward arbitrary chart prose to the model.
function mantrium_birth_context($chart,$now){
 $missing=['available'=>false,'reason'=>'No valid calculated birth chart. Invite the visitor to start a personal reading in chat; never invent placements.'];
 if(!is_array($chart)||!is_array($chart['positions']??null)||!is_array($chart['motion']??null)||($chart['method']??'')!=='lahiri-whole-sign-v1'||!is_int($chart['year']??null)||$chart['year']<1900||$chart['year']>(int)gmdate('Y',$now))return $missing;
 $p=[];foreach(['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Rahu','Ketu'] as $name){$v=$chart['positions'][$name]??null;if(!is_numeric($v)||!is_finite((float)$v)||$v<0||$v>=360)return $missing;$p[$name]=(float)$v;}
 if(abs(abs(mantrium_delta($p['Rahu'],$p['Ketu']))-180)>.01)return $missing;
 $asc=$chart['ascendant']??null;if($asc!==null&&(!is_numeric($asc)||!is_finite((float)$asc)||$asc<0||$asc>=360))return $missing;
 $signs=['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
 $entry=function($v)use($signs){return ['sign'=>$signs[(int)floor($v/30)],'degrees'=>round(fmod($v,30),3),'nearSignBoundary'=>min(fmod($v,30),30-fmod($v,30))<.15];};
 $natal=[];foreach($p as $name=>$v){$natal[$name]=$entry($v);$natal[$name]['house']=$asc===null?null:((int)floor($v/30)-(int)floor($asc/30)+12)%12+1;$m=$chart['motion'][$name]??null;if(in_array($m,['direct','retrograde'],true))$natal[$name]['motion']=$m;}
 $transits=[];$current=mantrium_positions($now);if($current)foreach($current as $name=>$v){$transits[$name]=$entry($v);$transits[$name]['houseFromLagna']=$asc===null?null:((int)floor($v/30)-(int)floor($asc/30)+12)%12+1;$transits[$name]['houseFromNatalMoon']=((int)floor($v/30)-(int)floor($p['Moon']/30)+12)%12+1;}
 $pan=mantrium_panchanga($p);
 return ['available'=>true,'source'=>'Browser-calculated Astronomy Engine 2.1.19, approximate Lahiri ayanamsa, mean nodes, whole-sign houses; historical IANA timezone conversion. City-centre location.','ascendant'=>$asc===null?null:$entry($asc),'natal'=>$natal,'moonNakshatra'=>$pan['nakshatra'],'moonPada'=>$pan['pada'],'nearLunarBoundary'=>$pan['nearTransition'],'currentTransits'=>$transits,'asOfUTC'=>gmdate('c',$now),'limitations'=>['No dashas or divisional charts calculated.','No ascendant/houses for latitudes at or beyond 66.5 degrees.','Birth-time accuracy and historical timezone rules can affect angles; pre-1970 timezone records can be uncertain.','Astronomical positions are calculated, interpretations are symbolic, not verified future events.']];
}
