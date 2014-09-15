 
define(['libs', 'cBase', 'adLayer'], function (libs, cBase, adLayer) {
    var myAutoRun = "";
    var options = {};
    var _config = {
        prefix: 'cui-'
    };

    var style = "width: 150px; height: 75px;  border-radius: 5px; background: rgba(0,0,0,0.7);  margin: auto; position: relative; z-index: 9999;";
    var _attributes = {};
    _attributes['class'] = _config.prefix + 'loading';
    _attributes.onCreate = function () { };
    _attributes.onHide = function () {
        console.log("myload hide!!!!!!!!!");
        
        if (myAutoRun != '') {
            clearTimeout(myAutoRun);
            myAutoRun = '';
            
        }
    };
    _attributes.onShow = function () {
        console.log("myload show!!!!!!!!!");
        this.contentDom.html(
            '<div   class="cui-breaking-load flight-loading" >' +
             '<div class="cui-i cui-w-loading" style="top:-20px;">' + '</div>' +
             '<div class="cui-i cui-m-logo"  style="top:-20px;" ></div>' +
             '<div id="js_loadFrame" style="position:absolute;top:30px; left:-45px;">'+
              '<div class="jsFlightCanvas"  ><div class="js_MY_loadText" style="text-align:center;color:#099fde;width:140px;height:20px;" >' +
              '</div></div>' +
            '</div>' +
            '</div>'
            );
        this.reposition();

        var texts = ['100%价格保证', '一站式售后保障', '7x24小时热线服务'];
        var autoLayout = 4;

        var idx = 0;
        var autoFun = function () {
           // console.log("我想要怒放的生命");
            if (idx > 2) idx = 0;
            var txt = texts[idx];
             
            $(".js_MY_loadText").html(txt);
             
            idx++;
            myAutoRun = setTimeout(autoFun, autoLayout * 1000);
        };
        autoFun();

    };
    options.__propertys__ = function () {
        
        this.contentDom;
        this.loadHtml = '';
    };
    options.initialize = function ($super) {
        $super(_attributes);
    };
    options.setHtml = function (html) {
        this.loadHtml = html;
    };

    return new cBase.Class(adLayer, options);
});