define(function() {
	function error(info) {
		try {
			if (typeof (info) == 'string') {
				sendReport({
				    type : 'unknownType',
				    msg : info
				})
			} else if (typeof (info) == 'object' && info.msg && info.type) {
				sendReport(info)
			}
		} catch (e) {
			throw e;
		}
	}
	function sendReport(info) {
		try {
			if (!window['__bfi']) {
				window['__bfi'] = [];
			}
			var bfi = window['__bfi'];
			var err = {
			    version : 7,
			    name : info.type || '',
			    message : info.msg || '',
			    line : 0,
			    column : 0,
			    file : info.file || '',
			    stack : info.stack || '',
			    category : 'Logic-error',
			    framework : 'cQuery_110421',
			    time : +new Date()
			};
			if (error.name && error.name.length) {
				bfi.push([ '_trackError', err ]);
			}
		} catch (e) {
			//
		}
	}
	return {
		error : error
	}
})
