define(["libs","cBase","adLayer"],function(a,b,c){var d="",e={},f={prefix:"cui-"},g={};return g["class"]=f.prefix+"loading",g.onCreate=function(){},g.onHide=function(){0,""!=d&&(clearTimeout(d),d="")},g.onShow=function(){0,this.contentDom.html('<div   class="cui-breaking-load flight-loading" ><div class="cui-i cui-w-loading" style="top:-20px;"></div><div class="cui-i cui-m-logo"  style="top:-20px;" ></div><div id="js_loadFrame" style="position:absolute;top:30px; left:-45px;"><div class="jsFlightCanvas"  ><div class="js_MY_loadText" style="text-align:center;color:#099fde;width:140px;height:20px;" ></div></div></div></div>'),this.reposition();var a=["100%价格保证","一站式售后保障","7x24小时热线服务"],b=4,c=0,e=function(){c>2&&(c=0);var f=a[c];$(".js_MY_loadText").html(f),c++,d=setTimeout(e,1e3*b)};e()},e.__propertys__=function(){this.contentDom,this.loadHtml=""},e.initialize=function($super){$super(g)},e.setHtml=function(a){this.loadHtml=a},new b.Class(c,e)});