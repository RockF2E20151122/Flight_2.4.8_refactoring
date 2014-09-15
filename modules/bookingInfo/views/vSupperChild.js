
"use strict";
define('vSupperChild', [ 'c', 'flight/utility/utility' ],
function ( c, Futility ) {
    
    var SupperChild = new c.base.Class({
        __propertys__: function(){
            this.viewPort = null;
            this.parentView = null;
            this.stores = null;
            this.models = null;
            this.Futility = Futility;
        },
        EVENTS:{ },
        changeOpts: function(opts){
            this.opts = $.extend(true, {}, opts);
            this.parentView = this.opts.parentView;
            this.viewPort = this.parentView.$el;
            this.stores = this.parentView.stores;
            this.models = this.parentView.models;
            this._addOpts_ && this._addOpts_(opts);                         //extended interfaces
        },
        initialize: function(argus){
            this.changeOpts(argus);
            //automatic binded interfaces
            this._init_ && this._init_();                                   //extended interfaces
            this._setBoxes_ &&this._setBoxes_();                            //extended interfaces
            this._setTemplate_ &&this._setTemplate_();                      //extended interfaces
            this._listeningMessages_ && this._listeningMessages_();         //extended interfaces
            this._fireEvents_ &&this._fireEvents_();                        //extended interfaces
            
        },
        /**
        * @Summary  航班详情信息响应后的处理函数
        * @param    psgersData  渲染乘机人模板数据（引用传递）
        * @param    response    请求返回的航班详情信息数据
        * @return   void
        */
        exampleFunction: function (psgersData, response ) { },
        /**
         * 
 * @param {Object} obj: original inheritance
 * @param {Object} aDependences: the Array of Dependence, the interface Class must be the first.
 * @param {Object} fnCallback
         */
        _loadDependences_: function( obj, aDependences, fnCallback){
            if(obj[aDependences[0]]){
                fnCallback();
                return obj;
            }else{
                require( aDependences, function( vConstructor ){
                    obj = c.base.implement(obj, vConstructor );
                    obj[aDependences[0]] = true;
                    fnCallback();
                });
                return obj;
            }
        }
    });
    return SupperChild;
});
