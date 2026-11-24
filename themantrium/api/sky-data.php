<?php
// Self-hosted, read-only sky data. No network calls, credentials or visitor storage.
function mantrium_angle($x){return fmod(fmod($x,360.0)+360.0,360.0);}
function mantrium_delta($a,$b){return mantrium_angle($b-$a+180.0)-180.0;}
function mantrium_positions($stamp){
    static $tables=[];
    if($stamp<1767225600||$stamp>=2114380800)return null; // 2026 through 2036; fail closed afterwards.
    $year=gmdate('Y',$stamp);
    if(!array_key_exists($year,$tables)){
        $file=__DIR__.'/../public/astronomy/'.$year.'.json';
        $tables[$year]=is_file($file)?json_decode(file_get_contents($file),true):null;
    }
    $data=$tables[$year];
    if(!is_array($data)||($data['version']??0)!==1||($data['step']??0)!==10800||count($data['bodies']??[])!==7)return null;
    $index=($stamp-$data['start'])/$data['step'];$i=(int)floor($index);$f=$index-$i;
    $a=$data['rows'][$i]??null;$b=$data['rows'][$i+1]??null;
    if(!is_array($a)||!is_array($b)||count($a)!==7||count($b)!==7)return null;
    // Lahiri polynomial adapted from MIT-licensed Grahan (notice in public/astronomy).
    // True-ecliptic longitudes minus mean ayanamsa: approximate, not ritual timing precision.
    $t=(($stamp/86400.0+2440587.5)-2451545.0)/36525.0;
    $ayan=23.857092340656987+1.3968881881553707*$t+0.00030694937343626763*$t*$t-3.986271419308174e-7*$t*$t*$t;
    $positions=[];
    foreach($data['bodies'] as $j=>$name){if(!is_numeric($a[$j])||!is_numeric($b[$j]))return null;$positions[$name]=mantrium_angle($a[$j]+mantrium_delta($a[$j],$b[$j])*$f-$ayan);}
    // Mean lunar nodes, explicitly distinguished from physical planets / true nodes.
    $positions['Rahu']=mantrium_angle(125.04452-1934.136261*$t+0.0020708*$t*$t+$t*$t*$t/450000-$ayan);
    $positions['Ketu']=mantrium_angle($positions['Rahu']+180);
    return $positions;
}
function mantrium_panchanga($p){
    $tithis=['Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami','Shashthi','Saptami','Ashtami','Navami','Dashami','Ekadashi','Dwadashi','Trayodashi','Chaturdashi'];
    $nakshatras=['Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha','Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati'];
    $yogas=['Vishkambha','Priti','Ayushman','Saubhagya','Shobhana','Atiganda','Sukarma','Dhriti','Shula','Ganda','Vriddhi','Dhruva','Vyaghata','Harshana','Vajra','Siddhi','Vyatipata','Variyana','Parigha','Shiva','Siddha','Sadhya','Shubha','Shukla','Brahma','Indra','Vaidhriti'];
    $elongation=mantrium_angle($p['Moon']-$p['Sun']);$ti=(int)floor($elongation/12);$ki=(int)floor($elongation/6);$ni=(int)floor($p['Moon']/(40/3));$yi=(int)floor(mantrium_angle($p['Moon']+$p['Sun'])/(40/3));
    $karanas=['Bava','Balava','Kaulava','Taitila','Garaja','Vanija','Vishti'];
    $karana=$ki===0?'Kimstughna':($ki>=57?['Shakuni','Chatushpada','Naga'][$ki-57]:$karanas[($ki-1)%7]);
    $near=false;foreach([[$elongation,6],[$p['Moon'],40/3],[mantrium_angle($p['Moon']+$p['Sun']),40/3]] as $v){$remainder=fmod($v[0],$v[1]);if(min($remainder,$v[1]-$remainder)<0.04)$near=true;}
    return ['tithi'=>['number'=>$ti+1,'name'=>$ti===14?'Purnima':($ti===29?'Amavasya':$tithis[$ti%15]),'paksha'=>$ti<15?'Shukla (waxing)':'Krishna (waning)'],'nakshatra'=>$nakshatras[$ni],'pada'=>(int)floor(fmod($p['Moon'],40/3)/(10/3))+1,'yoga'=>$yogas[$yi],'karana'=>$karana,'nearTransition'=>$near];
}
function mantrium_sky($stamp,$context=[]){
    $p=mantrium_positions($stamp);if(!$p)return ['available'=>false,'reason'=>'Ephemeris unavailable or outside its verified date range. Do not invent current transits.'];
    $before=mantrium_positions($stamp-3600);$after=mantrium_positions($stamp+3600);$future=mantrium_positions($stamp+7*86400);
    $signs=['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];$planets=[];$week=[];
    foreach($p as $name=>$longitude){$speed=$before&&$after?mantrium_delta($before[$name],$after[$name])*12:null;$sign=$signs[(int)floor($longitude/30)];$planets[$name]=['sign'=>$sign,'degrees'=>round(fmod($longitude,30),2),'motion'=>$speed===null?'unknown':(abs($speed)<0.01?'near-stationary':($speed<0?'retrograde':'direct'))];if($future&&$name!=='Moon'&&$sign!==$signs[(int)floor($future[$name]/30)])$week[]=['body'=>$name,'currentSign'=>$sign,'signInSevenDays'=>$signs[(int)floor($future[$name]/30)]];}
    $pairs=[];$names=array_keys($p);foreach($names as $i=>$a)foreach(array_slice($names,$i+1) as $b){if(in_array($a,['Rahu','Ketu'])||in_array($b,['Rahu','Ketu']))continue;$distance=abs(mantrium_delta($p[$a],$p[$b]));if($distance<=6)$pairs[]=['bodies'=>[$a,$b],'separationDegrees'=>round($distance,2)];}
    $pan=mantrium_panchanga($p);$pan['vara']=null;$local=['basis'=>'No reliable local sunrise context; do not claim a local Panchanga weekday.'];
    // Approximate IP-derived coordinates only, used for sunrise; never sent to the model.
    $geo=$context['skyLocation']??null;
    if(($context['personalise']??false)===true&&is_array($geo)&&is_numeric($geo['latitude']??null)&&is_numeric($geo['longitude']??null)&&is_string($geo['timezone']??null)&&in_array($geo['timezone'],DateTimeZone::listIdentifiers(),true)){
        $lat=(float)$geo['latitude'];$lon=(float)$geo['longitude'];
        if(is_finite($lat)&&is_finite($lon)&&abs($lat)<=90&&abs($lon)<=180){
            $lat=round($lat*2)/2;$lon=round($lon*2)/2;$tz=new DateTimeZone($geo['timezone']);$dt=(new DateTimeImmutable('@'.$stamp))->setTimezone($tz);$date=$dt->format('Y-m-d');
            $sunrise=null;
            // Find the most recent sunrise, including before dawn and extreme timezones.
            for($offset=-2;$offset<=1;$offset++){
                $anchor=strtotime($date.' 12:00:00 UTC')+$offset*86400;$sun=@date_sun_info($anchor,$lat,$lon);$rise=$sun['sunrise']??null;
                if(is_int($rise)&&$rise<=$stamp&&($sunrise===null||$rise>$sunrise))$sunrise=$rise;
            }
            $local=['date'=>$date,'timezone'=>$geo['timezone'],'basis'=>'Approximate city-level sunrise, not exact ritual or muhurta timing.'];
            if($sunrise!==null&&$stamp-$sunrise<36*3600){$riseDate=(new DateTimeImmutable('@'.$sunrise))->setTimezone($tz);$pan['vara']=['Ravivara (Sunday)','Somavara (Monday)','Mangalavara (Tuesday)','Budhavara (Wednesday)','Guruvara (Thursday)','Shukravara (Friday)','Shanivara (Saturday)'][(int)$riseDate->format('w')];$local['sunrise']=$riseDate->format(DateTimeInterface::ATOM);$risePositions=mantrium_positions($sunrise);if($risePositions)$local['panchangaAtSunrise']=mantrium_panchanga($risePositions);}
            else $local['basis']='No recent local sunrise (possibly polar day/night); vara unavailable.';
        }
    }
    return ['available'=>true,'asOfUTC'=>gmdate('Y-m-d\TH:i:s\Z',$stamp),'source'=>'Self-hosted Astronomy Engine 2.1.19 (MIT), Grahan Lahiri polynomial (MIT)','convention'=>'Approximate Lahiri sidereal; apparent geocentric positions; mean Rahu/Ketu. Current instant, not a birth chart.','panchangaNow'=>$pan,'local'=>$local,'planets'=>$planets,'closeConjunctions'=>$pairs,'sevenDaySignChanges'=>$week,'interpretation'=>'Astronomical positions are calculated; Jyotisha meanings are traditional symbolic interpretations, not evidence of future events. Near boundaries, avoid definitive element/sign claims.'];
}
