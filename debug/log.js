define(function() {
	//
	/**
	 * 给日期原型加上toString
	 */
	Date.prototype.toString = function() {
		var args = {
		    "d" : 'getDate',
		    "h" : 'getHours',
		    "m" : 'getMinutes',
		    "s" : 'getSeconds'
		}, rDate = /(yy|M|d|h|m|s)\1?/g, toString = Date.prototype.toString;

		return function(format) {
			var me = this;

			if (!format)
				return toString.call(me);

			return format.replace(rDate, function replace(key, reg) {
				var l = key != reg, t;
				switch (reg) {
				case 'yy':
					t = me.getFullYear();
					return l && t || (t % 100);
				case 'M':
					t = me.getMonth() + 1;
					break;
				default:
					t = me[args[reg]]();
				}
				return l && t <= 9 && ("0" + t) || t;
			});
		}
	}();
	/**
	 * 当前时间
	 * @private
	 */
	function currentTime() {
		return new Date().toString('yyyy-MM-dd hh:mm:ss');
	}
	//
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