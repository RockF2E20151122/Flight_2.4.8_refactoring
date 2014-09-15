var DEBUG_MODE = 0;
try {
	if (localStorage.getItem('__DEBUG__') == 1) {
		DEBUG_MODE = 1;
	}
	var a = location.search.split('&');
	var flag_debug = false, flag_noDebug;
	for (var i = 0; i < a.length; i++) {
		var o = a[i];
		if (o == '?debug' || o == 'debug') {
			flag_debug = true;
			break;
		}
		if (o == '?nodebug' || o == 'nodebug') {
			flag_noDebug = true;
			break;
		}
	}
	if (flag_debug) {
		DEBUG_MODE = 1;
		localStorage.setItem('__DEBUG__', '1');
	} else if (flag_noDebug) {
		DEBUG_MODE = 0;
		localStorage.setItem('__DEBUG__', '0');
	}
} catch (e) {

}
if (!DEBUG_MODE) {// 线上模式
    document.write('<script type="text/javascript" charset="utf-8" src="./dest/main.js?v=2.4.8-201409011100"></script>')
} else {
    document.write('<script type="text/javascript" charset="utf-8" src="main.js?v=2.4.8-201409011100"></script>')
} 