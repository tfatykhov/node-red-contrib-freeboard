// This module is neither officially-endorsed or supported by Wink
// however, Wink publishes an API and there are lots of wonderful open source tools that allow us to build on that API!


// jshint asi: true

var wink = { indicator: {} }
var lyric = { indicator: {} }
// data, e.g., datasources["WinKData"]["light_bulb"]["Kitchen"]


var lyric_tstat_mode = function (data, value) {
    //    return value
    if (data.users_away) return 'Away mode'
    return (value == 'Cool' ? 'cool to: ' + (data.cool_set_point)+"\xB0" : value == 'Heat' ? 'heat to: ' + (data.heat_set_point)+"\xB0" : value)
}

lyric.indicator.on_text = function(data, property) {
    return lyric_on_text(data, property)
}

var lyric_on_text = function(data, property) {
    var text, value

    if (!data) return ''
    text =  {thermostats     : (data.mode)
            }[data.object_type] || 'ON'
	
    if (typeof property === 'undefined') return text
    if ((typeof data[property] === 'undefined') || (data[property] === null )) return ''
    value = data[property]
    text =  {temperature    : (value +"\xB0 "+data.units)
            ,powered	    : lyric_tstat_mode(data,value)
	}[property]
    if (text === '') text = 'OK'

    return text
}



wink.indicator.value = function(data, property) {
    var value

    if (!data) return false
    if ((typeof data.connection !== 'undefined') && (!data.connection)) return false
    if ({remotes: true, sprinklers: true }[data.object_type]) return false
    if (typeof property !== 'undefined') {
        if ((typeof data[property] === 'undefined') || (data[property] === null )) return true
        return { sensor_pods     : true
               , smoke_detectors : true
               , thermostats     : (property === 'temperature') || (property === 'humidity') || (property === 'mode')
	       , air_conditioners: (property === 'temperature')
               }[data.object_type] || (property === 'battery')
    }

    value = { buttons         : true
            , gangs           : true
            , garage_doors    : data.position > 0
            , hubs            : true
            , linked_services : true
            , light_bulbs     : data.powered
            , locks           : data.locked
            , valves          : data.opened
            , sensor_pods     : true
            , shades          : data.position > 0
            , smoke_detectors : true
            , thermostats     : data.powered
            , air_conditioners: data.mode !== 'off'
            , unknown_devices: true
            , propane_tanks: true
            , piggy_banks: true
            , cameras: true
            }[data.object_type]
    return (typeof value !== 'undefined' ? value : data.powered)
}


wink.indicator.on_text = function(data, property) {
    return on_text(data, property)
}

var on_text = function(data, property) {
    var text, value

    if (!data) return ''
    text =  { buttons         : ''
	    , piggy_banks: 'Balance: ' + dollars(data.balance) + ' / Goal: ' + dollars(data.savings_goal)
            , garage_doors    : 'OPEN'
            , hubs            : (!data.update_needed ? 'OK' : 'UPDATE NEEDED')
            , linked_services : 'OK'
            , light_bulbs     : (data.brightness == 1.0  ? ''     : pct(data.brightness))
            , locks           : 'LOCKED'
            , valves          : 'OPEN'
            , sensor_pods     : 'PROPERTY?'
            , shades          : (data.position == 1.0    ? 'OPEN' : pct(data.position))
            , smoke_detectors : 'OK'
            , thermostats     : (data.cool_active ? 'COOL' : data.heat_active ? 'HEAT' : data.aux_active ? 'AUX' : data.fan_active ? 'FAN' : data.mode)
            , air_conditioners: (data.powered ? 'COOL to ' + dual_temp(data.max_set_point) : 'IDLE')
            , propane_tanks   : 'OK'
            }[data.object_type] || 'ON'
    if (typeof property === 'undefined') return text
    if ((typeof data[property] === 'undefined') || (data[property] === null )) return ''
    value = data[property]
    text =  { co_detected     : (value ? 'CO DETECTED'     : '')
            , fault           : (value ? 'FAULT DETECTED'  : '')
            , liquid_detected : (value ? 'LEAK DETECTED'   : '')
            , locked          : (value ? 'LOCKED'          : 'UNLOCKED')
            , loudness        : (value ? 'LOUD'            : '')
            , noise           : (value ? 'NOISY'           : '')
            , motion          : (value ? 'MOTION'          : '')
            , occupied        : (value ? 'OCCUPIED'        : 'VACANT')
            , opened          : (value ? 'OPEN'            : 'CLOSED')
            , smoke_detected  : (value ? 'SMOKE DETECTED'  : '')
            , tamper_detected : (value ? 'TAMPER DETECTED' : '')
            , vibration       : (value ? 'VIBRATION'       : '')
            , presence        : (value ? 'HOME'		   : 'NO')
            , timeframe       : (value ? 'NIGHT'       : 'DAY')
            , rain            : (value ? 'RAIN'        : 'NO RAIN')
            , Playing         : (value ? 'Playing video':'Idle')
            , pressure        : value+' mBar'
            , luminance       : value+' cd/m2'
            , illuminance     : value+' lux'
            , lat             : value
            , lon             : value
            , accuracy        : value+ (value<=1 ? ' meter' :' meters')
            , lastWaypoint    : value
            , lastEvent       : value
            , distanceFromHome: value
            , trigger         : geo_trigger(value)
            , lastUpdated     : timeConverter(value)
            , uvindex         : value
            , windDirection   : value
            , windGust        : dualSpeed(value)
            , sustainedWindSpeed: dualSpeed(value)
            , rainRate        : value
            , rainDaily       : value 
            , battery         : pct(value)
            , brightness      : pct(value)
            , co_severity     : pct(value)
            , humidity        : pct(value)
            , soilMoisture    : pct(value)
            , smoke_severity  : pct(value)
            , remaining       : pct(value)
            , temperature     : dual_temp(value)
            , mode	      : tstat_mode(data,value)
            , energy      : value+' kWh'
            , power       : value+' W'

            }[property]
    if (text === '') text = 'OK'

    return text
}

var timeConverter = function (UNIX_timestamp){
  var a = new Date(UNIX_timestamp * 1000);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + (min<10 ? '0'+min : min);
  return time;
}

var getUvIndex = function(val){
    var value;
    var txt;
    value=parseInt(val);
    if (value <=2)
        txt='Minimal';
    else if (value <=4)
        txt='Low';
    else if (value <=6)
        txt='Moderate';
    else if (value <=9)
        txt='High';
    else 
        txt='Very High!';
    
    return value+' '+txt;
}

var geo_trigger = function(value){
    var text;
    text='';
    text={
        p : 'ping',
        c : 'gps geofence',
        b : 'beacon geofence',
        r : 'remote request',
        u : 'manual publish',
        t : 'moving publish',
        a : 'auto update',
        none: 'auto update'
    }[value]
    return (text === '' ? 'auto update' : text);
}

var dualSpeed = function(value) {
    return (typeof value === 'number' ? (value+ ' km/h / '+ (value * 0.62).toFixed(2)+' mph') : '')
}

var pct = function(value) {
    return ((value > 1.0 ? value : value * 100).toFixed(0) + '%')
}
var dual_temp = function (value) {
    return (typeof value === 'number' ? (value.toFixed(1) + 'C / ' + ((value * 1.8) + 32).toFixed(1) + 'F') : '')
}


var dollars = function (value) {
    return (typeof value === 'number' ? (value / 100).toFixed(2) : '')
}

var tstat_mode = function (data, value) {
    //    return value
    if (data.users_away) return 'Away mode'
    return (value == 'cool_only' ? 'cool to: ' + dual_temp(data.max_set_point) : value == 'heat_only' ? 'heat to: ' + dual_temp(data.min_set_point) : 'auto: ' + dual_temp(data.min_set_point) + ' - ' + dual_temp(data.max_set_point))
}


wink.indicator.off_text = function(data, property) {
    return off_text(data, property)
}

var off_text = function(data, property) {
    if (!data) return ''
    if ((typeof data.connection !== 'undefined') && (!data.connection)) return 'ERR'
    if (typeof property !== 'undefined') return ''

    return { buttons          : 'IDLE'
           , garage_doors     : (data.position !== null ? 'CLOSED' : 'UNKNOWN' )
           , locks            : 'UNLOCKED'
           , valves           : 'CLOSED'
           , shades           : (data.position !== null ? 'CLOSED' : 'UNKNOWN' )
           }[data.object_type] || 'OFF'
}


freeboard.addStyle('.wink-indicator-circle', "border-radius:50%;width:22px;height:22px;border:2px solid #3d3d3d;margin-top:5px;float:left;margin-right:10px;");
freeboard.addStyle('.wink-indicator-triangle', "border-radius:50%;width:0;height:0;border-left:15px solid transparent;border-right:15px solid transparent;margin-top:5px;float:left;margin-right:10px;");

wink.indicator.style_element = function(data, property) {
    var params = style_element(data, property)

    if (params === '') return params

    if (params.shape == 'triangle') {
        return ('<div class="wink-indicator-' + params.shape + '" style="border-top: 20px solid ' + params.color + ';"></div>')
    }
    return ('<div class="wink-indicator-'     + params.shape + '" style="background-color:'  + params.color + ';"></div>')
}


DynCol =function (hex, lum) {

	// validate hex string
	hex = String(hex).replace(/[^0-9a-f]/gi, '');
	if (hex.length < 6) {
		hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
	}
	lum = lum || 0;

	// convert to decimal and change luminosity
	var rgb = "#", c, i;
	for (i = 0; i < 3; i++) {
		c = parseInt(hex.substr(i*2,2), 16);
		c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
		rgb += ("00"+c).substr(c.length);
	}
	return rgb;
}

var style_element = function(data, property) {
    var color, value
      , black  = '#000000'
      , blue   = '#00b8f1'
      , green  = '#00ff00'
      , red    = '#ff0000'
      , shape  = 'circle'
      , white  = '#ffffff'
      , yellow = '#eed202'
      , day = '#FFBF00'
      , rain = '#81DAF5'
      , normal = '#40FF00'
      , moderate = '#FFFF00'
      , warning = '#FF8000'
      , danger = '#FF0000'
      , cool = '#3232FF'
      , heat = '#F7553A'
      , off = '#000000'
    
    if (!data) return ''
    if ((typeof data.connection !== 'undefined') && (!data.connection)) return { color: red, shape: 'triangle' }

    color = { binary_switches : (data.powered          ? white  : black)
	    , cameras	      : (data.capturing_video ? green : data.connection ? blue : black)
            , outlet          : (data.powered ? white : black)
            , buttons         : (!data.pressed         ? blue  : green)
            , garage_doors    : (data.position === 0.0 ? blue  : yellow)
            , hubs            : (!data.update_needed   ? blue  : yellow)
            , light_bulbs     : (data.powered          ? ('hexColor' in data ? data.hexColor : DynCol("#905030",data.brightness*5)) : black)
            , locks           : (data.locked           ? blue  : yellow)
            , valves          : (data.opened           ? blue :  yellow)
            , shades          : (data.position === 0.0 ? blue  : data.position === null ? yellow : green)
            , thermostats     : ({ cool_only: blue, heat_only: red, Cool: cool, Heat: heat, Off: off}[data.mode] || green)
            , air_conditioners: (data.powered ? blue : green)
            , propane_tanks   : (data.remaining == 0 ? red : data.remaining == 1 ? blue : data.remaining > 0.66 ? green : data.remaining > 0.33 ? yellow : red)
            , piggy_banks     : '#'+data.nose_color
            }[data.object_type] || blue

    if (typeof property === 'undefined') return { color: color, shape: shape }
    if ((typeof data[property] === 'undefined') || (data[property] === null )) return ''

    value = data[property]    
    color = { co_detected     : value && red
            , fault           : value && red
            , liquid_detected : value && red
            , locked          : (!value) && red
            , loudness        : value && yellow
            , noise           : value && yellow
            , motion          : value && yellow
            , occupied        : value && yellow
            , opened          : value && yellow
            , presence        : value && yellow
            , smoke_detected  : value && red
            , tamper_detected : value && red
            , vibration       : value && yellow
            , rain            : value && rain
            , Playing         : (value ? green : blue)
            , timeframe       : (value ? black : day)
            , illuminance     : (value <=10 ? black : value <=50 ? yellow : white)
            , uvindex         : (parseInt(value) <=4 ? normal : parseInt(value) <=7 ? moderate : parseInt(value) <= 9 ? warning : danger)
            , lat             : blue
            , lon             : blue
            , accuracy        : blue
            , distanceFromHome: blue
            , lastWaypoint    : blue
            , lastEvent       : (value=='enter' ? yellow : blue)             
            , battery         : (value ==  1.0 ? blue : value > 0.66 ? green : value > 0.33 ? yellow : red)
            , brightness      : false
            , co_severity     : (value > 0) && red
            , humidity        : false
            , soilMoisture    : false
            , smoke_severity  : (value > 0) && red
	    , mode	      : (value == 'cool_only' ? blue : value == 'heat_only' ? red : value == 'Cool' ? cool : value == 'Heat' ? heat : off)
	    , powered	      : (value == 'Cool' ? cool : value == 'Heat' ? heat : off)
            , temperature     : false
            }[property] || blue
//    if ((color != blue) && (color != green)) shape = 'triangle'

    return { color: color, shape: shape }
}

