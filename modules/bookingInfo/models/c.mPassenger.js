define(function(require){
    
    var mPassenger = function(options){
        this.opts = $.extend(true, {},options);
        this.p$el = this.opts.$el;
        this.flightBox = this.p$el.find('#flightBox');
        
        this.init();
    };
    mPassenger.prototype = {
        init: function(){
            
        }
        ,
    };
    
    
    var BusinessModel = require('BusinessModel');
    var cBase = require('cBase');
    
    var mPassenger = new cBase.Class(BusinessModel, {
        __propertys__: function () {
            this.url = '';
            this.method = 'POST';
            this.param = {
            };
        },
        initialize: function ($super, options) {
            $super(options);
        },
        formatParam: function (store) {
            var p = {};
            this.param = p;
        }
    });
    return mPassenger;
});
