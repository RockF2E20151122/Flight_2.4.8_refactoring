;define(['cModel', 'cBase', 'mapping', 'cAjax'], function(AbstractModel, cBase, Mapping, cAjax) {
    //业务Model,此类作用是重写url指向
    var BusinessModel = new cBase.Class(AbstractModel, {
        __propertys__ : function() {

        },
        initialize : function($super, options) {
        },
         
        /**
         *	取model数据
         *	@param {Function} onComplete 取完的回调函
         *	传入的第一个参数为model的数第二个数据为元数据，元数据为ajax下发时的ServerCode,Message等数
         *	@param {Function} onError 发生错误时的回调
         *	@param {Boolean} ajaxOnly 可选，默认为false当为true时只使用ajax调取数据
         *   @param {Boolean} scope 可选，设定回调函数this指向的对象
         *   @param {Function} onAbort 可选，但取消时会调用的函数
         */
        excute : function(onComplete, onError, ajaxOnly, scope, onAbort) {
            var params = _.clone(this.getParam() || {});
            var tag = this.getTag();
            var data = this.result && this.result.get(tag), params, __onCompete, __onError, url = this.buildurl(), curhead = this.head.get();
            this.isAbort = false;
            var self = this;
            //有下列情况，会直接请求ajax
            if (!data || this.ajaxOnly || ajaxOnly) {
                //当提交方式不等于get，usehead字段为真时，并且contentType不等于jsonp在请求中使用head
                if (this.method.toLowerCase() !== 'get' && this.usehead && this.contentType !== AbstractModel.CONTENT_TYPE_JSONP) {
                    params.head = this.head.get();
                }
                __onCompete = $.proxy(function(data) {
                    var head = data.head, fdata;
                    //更新head.auth

                    if (this.contentType !== AbstractModel.CONTENT_TYPE_JSONP && this.usehead && head.auth && head.auth !== curhead.auth) {
                        this.head.setAuth(head.auth);
                    }
                    if (head && head.errcode === 0) {
                        fdata = data;
                        //data映射转换
                        fdata = (function() {
                            return Mapping.translate(url, fdata);
                        })();
                        //
                        if ( typeof this.dataformat === 'function') {
                            fdata = this.dataformat(fdata);
                        }
                        //l_wang 需要数据验证点此处写入前需要执行validate验证

                        this.result && this.result.set(fdata, tag);
                        onComplete && onComplete.call(scope || this, fdata, data, true);
                    } else {
                        onError && onError.call(scope || this, data);
                    }
                }, this);
                __onError = $.proxy(function(e) {
                    if (self.isAbort) {
                        self.isAbort = false;
                        onAbort && onAbort.call(scope || this, e);
                        return;
                    }
                    onError && onError.call(scope || this, e);
                }, scope || this);
                if (this.contentType === AbstractModel.CONTENT_TYPE_JSON) {
                    this.ajax = cAjax.cros(url, this.method, params, __onCompete, __onError);
                } else if (this.contentType === AbstractModel.CONTENT_TYPE_JSONP) {
                    this.ajax = cAjax.jsonp(url, params, __onCompete, __onError);
                } else {
                    this.ajax = cAjax.post(url, params, __onCompete, __onError);
                }
            } else {
                onComplete.call(scope || this, data, null, false);
            }
        },
        getDataWithSync : function(onComplete, onError, async) {
            //只做了post请求方式，并兼容json，默认异步请求
            var url = this.buildurl(), data = _.clone(this.getParam() || {});
            data.head = this.head.get();
            $.ajax({
                url : url,
                async : !async,
                data : JSON.stringify(data),
                type : 'post',
                dataType : 'json',
                contentType : 'application/json',
                timeout : data.timeout || 200000,
                success : onComplete.bind(this),
                error : onError.bind(this)
            });
        },
        buildurl : function() {
            var baseurl = this.baseurl();
            var tempUrl = this.protocol + '://' + (baseurl.domain) + '/' + (baseurl.path) + ( typeof this.url === 'function' ? this.url() : this.url);
            return tempUrl;
        },

        baseurl : function(protocol) {
            var host = location.host;
            var domain = 'm.ctrip.com';
            var path = 'restapi';
            if (host.match(/^m\.ctrip\.com/i) || host.match(/^secure\.ctrip\.com/i)) {
                //生产环境
                domain = 'm.ctrip.com';
                path = 'restapi';
            } else if (host.match(/^(localhost|172\.16|127\.0)/i) || window.DEBUG_MODE) {
                //本地环境 data from testu
                 domain = 'ws.mobile.flight.fat36.qa.nt.ctripcorp.com';
                 path = 'FlightWirelessApi';
                // domain = 'm.ctrip.com';
                //path = 'restapi';
            } else if (host.match(/^10\.8\.2\.111/i) || host.match(/^10\.8\.5\.10/i)) {
                //堡垒环境
                //domain = 'ws.mobile.flight.ctripcorp.com';
                //path = 'FlightWirelessApi';
                domain = 'm.ctrip.com';
                path = 'restapi';
            } else if (host.match(/^m\.uat\.qa\.ctripcorp\.com/i)) {
                //测试环境 uat
                domain = 'ws.mobile.flight.uat.ctripcorp.com';
                path = 'FlightWirelessApi';
            } else if (host.match(/^m\.fat/i) || host.match(/^waptest\.ctrip|^210\.13\.100\.191/i) || host.match(/^wapsecuretest\.ctrip|^210\.13\.100\.191/i) || window.DEBUG_MODE) {
                //测试环境 fat waptest; data from testu
                domain = 'ws.mobile.flight.fat36.qa.nt.ctripcorp.com';
                path = 'FlightWirelessApi';

            } else {
                //默认生产环境
                domain = 'm.ctrip.com';
                path = 'restapi';
            }

            return {
                'domain' : domain,
                'path' : path
            };
        }
    });

    return BusinessModel;

});
