define(['libs', 'c', 'CommonStore', 'FlightStore', 'FlightModel', 'cMultipleDate', buildViewTemplatesPath('transit.html'), 'cWidgetFactory' ],
function (libs, c, CommonStore, FlightStore, FlightModels, cMultipleDate, html, WidgetFactory) {
    var cui = c.ui,
        cBase = c.base,
        salesStore = CommonStore.SalesObjectStore.getInstance();
    var userStore = CommonStore.UserStore.getInstance();
    var isBackIndex = false; //是否返回查询

    var View = c.view.extend({
        pageid: '',
        tpl: html,

        flightStore: FlightStore.FlightSearchStore.getInstance(), //搜索参数

        flightCityListStore: FlightStore.FlightCityListStore.getInstance(), //国内机场城市

        flightInterCityListStore: FlightStore.FlightInterCityListStore.getInstance(), //国际机场城市

        flightFilterStore: FlightStore.FlightFilterStore.getInstance(),

        openApp: function () {

            var self = this;

            //---------------------------------------------------//
            var appUrl = "";
            var h5Url = "";
            var appProtocol = "ctrip://wireless";
            var sourceid = "";
            if (window.localStorage && window.localStorage.getItem('SALES') != null && window.localStorage.getItem('SALES') != "") {
                var SALES = JSON.parse(window.localStorage.getItem('SALES'));
                if (SALES["data"] != null) {
                    sourceid = SALES["data"]["sourceid"];
                }
            }


            var dcity = self.flightStore.getSearchDetails(0, 'dkey');
            var acity = self.flightStore.getSearchDetails(0, 'akey');
            var datestr = self.flightStore.getSearchDetails(0, 'date'),
                date = cBase.Date.parse(datestr, true);
            date = cBase.Date.format(date, 'Y/m/d');
            datestr = (date).replace(/\//g, "");
            var tabType = self.flightStore.getAttr('tabtype') || 1;
            var mode = (self.flightStore.getAttr('amode') - 2 == 0 || self.flightStore.getAttr('dmode') - 2 == 0) ? 2 : 1;





            var pageName = self.getQuery("page");




            switch (pageName) {
                case "index": //查询页
                    if (tabType == 1) {
                        appUrl =
                         "/flight_inquire?" +
                         "c1=" + tabType + //单程还是往返（必需）
                         "&c2=" + dcity + //出发城市id（必需）
                         "&c3=" + acity + //到达城市id（必需）
                         "&c4=" + datestr + //出发时间（yyyymmdd）（必需）
                         "&extendSourceID=" + sourceid;

                    } else {

                        var adatestr = self.flightStore.getSearchDetails(1, 'date');
                        var ddate = cBase.Date.parse(adatestr, true);
                        ddate = cBase.Date.format(ddate, 'Y/m/d');
                        adatestr = (ddate).replace(/\//g, "");

                        appUrl =
                         "/flight_inquire?" +
                         "c1=" + tabType + //单程还是往返（必需）
                         "&c2=" + dcity + //出发城市id（必需）
                         "&c3=" + acity + //到达城市id（必需）
                         "&c4=" + datestr + //出发时间（yyyymmdd）（必需）
                         "&c5=" + adatestr + //返程出发时间（yyyymmdd）（单程不传，返程必需） 
                        "&extendSourceID=" + sourceid;
                    }
                    h5Url = "/webapp/flight/#index";
                    break;
                case "list": //列表页
                    var singlelist = (mode - 2 == 0) ? "/flight_int_singlelist?" : "/flight_inland_singlelist?";
                    var tolist = (mode - 2 == 0) ? "/flight_int_tolist?" : "/flight_inland_tolist?";
                    h5Url = (mode - 2 == 0) ? "/webapp/fltintl/#flightlist" : "/webapp/flight/#list";


                    if (tabType == 1) {
                        appUrl = singlelist +
                         "c1=" + tabType + //单程还是往返（必需）
                         "&c2=" + dcity + //出发城市id（必需）
                         "&c3=" + acity + //到达城市id（必需）
                         "&c4=" + datestr + //出发时间（yyyymmdd）（必需）
                        "&extendSourceID=" + sourceid;
                    } else {

                        var adatestr = self.flightStore.getSearchDetails(1, 'date');
                        var ddate = cBase.Date.parse(adatestr, true);
                        ddate = cBase.Date.format(ddate, 'Y/m/d');
                        adatestr = (ddate).replace(/\//g, "");

                        appUrl = tolist +
                         "c1=" + tabType + //单程还是往返（必需）
                         "&c2=" + dcity + //出发城市id（必需）
                         "&c3=" + acity + //到达城市id（必需）
                         "&c4=" + datestr + //出发时间（yyyymmdd）（必需）
                         "&c5=" + adatestr + //返程出发时间（yyyymmdd）（单程不传，返程必需） 
                        "&extendSourceID=" + sourceid;
                    }

                    if (mode - 2 == 0) {
                        self.flightStore.saveToFltintlSearch();
                    }



                    break;

                case "order": //国内详情
                    var oid = self.getQuery("oid");
                    var uid = "";
                    if (self.getQuery("uid")) {
                        uid = "&UserID=" + self.getQuery("uid");
                    }
                    if (userStore && userStore.getUser()) {
                        uid = "&UserID=" + userStore.getUser().LoginName;
                    }


                    if (oid == "" || oid == null || uid == "" || uid == null) {
                        isBackIndex = true;
                    }

                    appUrl = "/InlandFlightOrder?orderId=" + oid + uid + "&extendSourceID=" + sourceid;
                    h5Url = "/webapp/flight/#flightorderdetail?oid=" + oid;
                    break;

                case "intlorder": //国际详情
                    var oid = self.getQuery("oid");
                    var uid = "";
                    if (self.getQuery("uid")) {
                        uid = "&UserID=" + self.getQuery("uid");
                    }
                    if (userStore && userStore.getUser()) {
                        uid = "&UserID=" + userStore.getUser().LoginName;
                    }
                    if (oid == "" || oid == null || uid == "" || uid == null) {
                        isBackIndex = true;
                    }


                    appUrl = "/InternationalFlightOrder?orderId=" + oid + uid + "&extendSourceID=" + sourceid; ;
                    h5Url = "/webapp/fltintl/#fltintlorderdetail?oid=" + oid;

                    break;

                case "refund": //国内退票
                    var oid = self.getQuery("oid");
                    var uid = "";
                    if (self.getQuery("uid")) {
                        uid = "&UserID=" + self.getQuery("uid");
                    }
                    if (userStore && userStore.getUser()) {
                        uid = "&UserID=" + userStore.getUser().LoginName;
                    }
                    if (oid == "" || oid == null || uid == "" || uid == null) {
                        isBackIndex = true;
                    }

                    appUrl = "/flight_inland_refund?c1=" + oid + uid + "&extendSourceID=" + sourceid;
                    h5Url = "/webapp/flight/#ticketrefund?oid=" + oid;
                    break;

                case "intlrefund": //国际退票
                    var oid = self.getQuery("oid");
                    var uid = "";
                    if (self.getQuery("uid")) {
                        uid = "&UserID=" + self.getQuery("uid");
                    }
                    if (userStore && userStore.getUser()) {
                        uid = "&UserID=" + userStore.getUser().LoginName;
                    }
                    if (oid == "" || oid == null || uid == "" || uid == null) {

                        isBackIndex = true;
                    }

                    appUrl = "/flight_int_refund?c1=" + oid + uid + "&extendSourceID=" + sourceid;
                    h5Url = "/webapp/fltintl/#fltintlrefundticket?oid=" + oid;

                    break;

                case "change": //改签
                    var oid = self.getQuery("oid");
                    var uid = "";
                    if (self.getQuery("uid")) {
                        uid = "&UserID=" + self.getQuery("uid");
                    }
                    if (userStore && userStore.getUser()) {
                        uid = "&UserID=" + userStore.getUser().LoginName;
                    }
                    if (oid == "" || oid == null || uid == "" || uid == null) {
                        isBackIndex = true;
                    }

                    appUrl = "/flight_inland_change?c1=" + oid + uid + "&extendSourceID=" + sourceid;
                    h5Url = "/webapp/flight/#flightordermodify?oid=" + oid;
                    break;

                case "bdindex"://航班动态查询
                    //flight_board_inquire ? c1=20140130&c2=SHA&c3=PEK 
                    var dport = self.getQuery("dport") || "SHA";
                    var aport = self.getQuery("aport") || "PEK";
                    var qdate = self.getQuery("qdate") ||  cBase.Date.format(new Date, 'Y/m/d');
                    appUrl = "/flight_board_inquire?c1=" + qdate + "&c2=" + dport + "&c3=" + aport + "&extendSourceID=" + sourceid;
                    h5Url = "/html5/flight/schedule/index.html";
                    break;

                case "board": //航班动态详情
                    var fltno = self.getQuery("fltno") || "";
                    var dport = self.getQuery("dport") || "";
                    var aport = self.getQuery("aport") || "";
                    var qdate = self.getQuery("qdate") || "";

                    fltno = fltno.toUpperCase();
                    dport = dport.toUpperCase();
                    aport = aport.toUpperCase();

                    if (fltno != ""  && dport != "" && aport != "" && qdate != "") {

                        appUrl = "/flight_board_detail?c1=" + qdate + "&c2=" + fltno + "&c3=" + dport + "&c4=" + aport + "&extendSourceID=" + sourceid;
                        h5Url = "/html5/flight/schedule/" + fltno + ".html?ddate=" + qdate;

                    } else {
                        //isBackIndex = true;
                        appUrl = "/flight_board_inquire?c1=" + qdate +  "&c2=" + dport + "&c3=" + aport + "&extendSourceID=" + sourceid;
                        h5Url = "/html5/flight/schedule/index.html";
                    }

                    break;


                default: ""

            }


            if (isBackIndex == true) {

                if (tabType == 1) {
                    appUrl =
                         "/flight_inquire?" +
                         "c1=" + tabType + //单程还是往返（必需）
                         "&c2=" + dcity + //出发城市id（必需）
                         "&c3=" + acity + //到达城市id（必需）
                         "&c4=" + datestr + //出发时间（yyyymmdd）（必需）
                         "&extendSourceID=" + sourceid;

                } else {

                    var adatestr = self.flightStore.getSearchDetails(1, 'date');

                    var ddate = cBase.Date.parse(adatestr, true);
                    ddate = cBase.Date.format(ddate, 'Y/m/d');
                    adatestr = (ddate).replace(/\//g, "");

                    appUrl =
                         "/flight_inquire?" +
                         "c1=" + tabType + //单程还是往返（必需）
                         "&c2=" + dcity + //出发城市id（必需）
                         "&c3=" + acity + //到达城市id（必需）
                         "&c4=" + datestr + //出发时间（yyyymmdd）（必需）
                         "&c5=" + adatestr + //返程出发时间（yyyymmdd）（单程不传，返程必需） 
                        "&extendSourceID=" + sourceid;
                }
                h5Url = "/webapp/flight/#index";
            }



            appUrl = appProtocol + appUrl;

            //console.log(appUrl + "\n" + h5Url);

             
            var urlObj = {
                "appUrl": appUrl,
                "h5Url": h5Url
            }

            //--------------------------------------------------//

            var appUrl = urlObj["appUrl"];
            var h5Url = urlObj["h5Url"];
            
            var u = navigator.userAgent ? navigator.userAgent.toLocaleLowerCase() : '';
            //判断设备类型
            var isMac = (u.indexOf("mac", 0) != -1) || (navigator.userAgent.indexOf("ios", 0) != -1) ? 1 : 0; //ios设备
            var isAndroid = (u.indexOf("android", 0) != -1) || (u.indexOf("adr", 0) != -1) ? 1 : 0; //android 设备
            var isChrome = isAndroid && u.indexOf("chrome", 0) != -1 && u.indexOf("nexus", 0) == -1;//chrome

            var isSafari = navigator.userAgent.indexOf("Safari") > -1 && navigator.userAgent.indexOf("Chrome") < 1; //判断是否Safari


          //  if (appUrl && appUrl.length > 0) { 
                if (isAndroid) {
                    //window.location = appUrl; 
                   
                    if (isChrome) {
                         
                         window.location.href = appUrl;
                         
                         setTimeout(function () {
                             window.location.href = h5Url;
                         }, 1);
                        
                         
                    } else {
                        var ifr = $('<iframe style="display: none;"></iframe>');
                        ifr.attr('src', appUrl);
                        $('body').append(ifr);

                        setTimeout(function () {
                            window.location.href = h5Url;
                        }, 3 * 1000);
                    }

                } else if (isMac) {
                    function applink() {
                        return (function(){
                            window.location = appUrl;
                            
                            if (isSafari) {
                                var clickedAt = +new Date;
                                // During tests on 3g/3gs this timeout fires immediately if less than 500ms.  
                                setTimeout(function () {
                                    // To avoid failing on return to MobileSafari, ensure freshness!  
                                    //if (+new Date - clickedAt < 1000) {
                                        window.location = "itms-apps://itunes.apple.com/cn/app/id379395415?mt=8";
                                   // }
                                }, 1);
                            }
                        })();
                    }
                    applink();

                    setTimeout(function () {
                        window.location.href = h5Url;
                    }, 3 * 1000);

                } else {
                    window.location = appUrl;
                    setTimeout(function () {
                        window.location.href = h5Url;
                    }, 3 * 1000);
                }


            //  }
             
           
          
               
              
        },

        getQueryStringByName: function (name) {//获取
            var result = location.search.match(new RegExp("[\?\&]" + name + "=([^\&]+)", "i"));
            if (result == null || result.length < 1) {
                return "";
            }
            return result[1];
        },

        render: function () {
            this.viewdata.req = this.request;
            this.$el.html(this.tpl);
            this.els = {

            };
        },


        renderPage: function (cur, dcity, acity, ctys1, ctys2) {
            var self = this;
            var isIntFlag = false;

            if (ctys1 != null && ctys2 != null) {
                var aCtyCode = '', aCityName = '', aCityId = '',
                    dCtyCode = '', dCityName = '', dCityId = '';
                //国内
                if (ctys1 && ctys1.length > 0) {
                    for (var i = 0, len = ctys1.length; i < len; i++) {
                        if (acity && acity != "") {
                            if (ctys1[i].code.toLowerCase() == acity.toLowerCase() || ctys1[i].name == decodeURI(acity) || ctys1[i].id == acity) {
                                aCityName = ctys1[i].name;
                                aCtyCode = ctys1[i].code;
                                aCityId = ctys1[i].id;
                                self.flightStore.setAttr("amode", "1");
                                //  console.log("1amode" + self.flightStore.getAttr("amode"));
                            }
                        }
                        if (dcity && dcity != "") {
                            if (ctys1[i].code.toLowerCase() == dcity.toLowerCase() || ctys1[i].name == decodeURI(dcity) || ctys1[i].id == dcity) {
                                dCityName = ctys1[i].name;
                                dCtyCode = ctys1[i].code;
                                dCityId = ctys1[i].id;
                                self.flightStore.setAttr("dmode", "1");
                                //  console.log("1dmode" + self.flightStore.getAttr("dmode"));
                            }
                        }
                    }
                }
                //国际
                if (ctys2 && ctys2.length > 0) {
                    for (var i = 0, len = ctys2.length; i < len; i++) {
                        if (acity && acity != "") {
                            if (ctys2[i].code.toLowerCase() == acity.toLowerCase() || ctys2[i].name == decodeURI(acity) || ctys2[i].id == acity) {
                                aCityName = ctys2[i].name;
                                aCtyCode = ctys2[i].code;
                                aCityId = ctys2[i].id;
                                isIntFlag = true;
                                self.flightStore.setAttr("amode", "2");
                                // console.log("2amode"+ self.flightStore.getAttr("amode"));
                            }
                        }
                        if (dcity && dcity != "") {
                            if (ctys2[i].code.toLowerCase() == dcity.toLowerCase() || ctys2[i].name == decodeURI(dcity) || ctys2[i].id == dcity) {
                                dCityName = ctys2[i].name;
                                dCtyCode = ctys2[i].code;
                                dCityId = ctys2[i].id;
                                isIntFlag = true;
                                self.flightStore.setAttr("dmode", "2");
                                // console.log("2dmode" + self.flightStore.getAttr("dmode"));
                            }
                        }
                    }
                    if (isIntFlag == true) {//是国际机票
                        self.flightStore.setAttr("tofltintl", "0");
                    }
                }
                //--------------------------------------------------------------------------//
                if (aCityId == '' || aCityName == '') {//默认上海到北京
                    //                    aCtyCode = self.flightStore.getSearchDetails(0, 'aCtyCode') || 'SHA';
                    //                    aCityId = self.flightStore.getSearchDetails(0, 'akey') || 2;
                    //                    aCityName = self.flightStore.getSearchDetails(0, 'acityName') || '上海';

                    aCtyCode = 'BJS';
                    aCityId = 1;
                    aCityName = '北京';

                }
                if (dCityId == '' || dCityName == '') {
                    //                    dCtyCode = self.flightStore.getSearchDetails(0, 'dCtyCode') || 'BJS';
                    //                    dCityId = self.flightStore.getSearchDetails(0, 'dkey') || 2;
                    //                    dCityName = self.flightStore.getSearchDetails(0, 'dcityName') || '北京';

                    dCtyCode = 'SHA';
                    dCityId = 2;
                    dCityName = '上海';
                }



                if (cur - 2 == 0) {
                    self.flightStore.setSearchDetails(0, 'dCtyCode', dCtyCode);
                    self.flightStore.setSearchDetails(0, 'dcityName', dCityName);
                    self.flightStore.setSearchDetails(0, 'dkey', dCityId);
                    self.flightStore.setSearchDetails(0, 'aCtyCode', aCtyCode);
                    self.flightStore.setSearchDetails(0, 'acityName', aCityName);
                    self.flightStore.setSearchDetails(0, 'akey', aCityId);
                    self.flightStore.setSearchDetails(1, 'aCtyCode', dCtyCode);
                    self.flightStore.setSearchDetails(1, 'acityName', dCityName);
                    self.flightStore.setSearchDetails(1, 'akey', dCityId);
                    self.flightStore.setSearchDetails(1, 'dCtyCode', aCtyCode);
                    self.flightStore.setSearchDetails(1, 'dcityName', aCityName);
                    self.flightStore.setSearchDetails(1, 'dkey', aCityId);
                } else {
                    self.flightStore.setSearchDetails(0, 'dCtyCode', dCtyCode);
                    self.flightStore.setSearchDetails(0, 'dcityName', dCityName);
                    self.flightStore.setSearchDetails(0, 'dkey', dCityId);
                    self.flightStore.setSearchDetails(0, 'aCtyCode', aCtyCode);
                    self.flightStore.setSearchDetails(0, 'acityName', aCityName);
                    self.flightStore.setSearchDetails(0, 'akey', aCityId);
                    self.flightStore.removeSearchDetails(1);
                }


                self.flightStore.setAttr('ticketIssueCty', dCtyCode); //出票城市
                self.flightStore.setCurSearchDetails([0]);

                //-------------------------------------------------------------------------//
                self.openApp();
                //-------------------------------------------------------------------------//
            }
        },
        updatePage: function () {
            var self = this;
            var pageName = self.getQuery("page");
            var trip = (self.getQuery('SearchType') != "" && self.getQuery('SearchType') != null) ?
            self.getQuery('SearchType') :
            (self.getQuery('flighttype') != "" && self.getQuery('flighttype') != null) ?
            self.getQuery('flighttype') :
            (self.getQuery('trip') != "" && self.getQuery('trip') != null) ?
            self.getQuery('trip') : "";
            trip = trip.toLowerCase();
            if (trip == "d") {
                trip = 2;
            } else if (trip == "s") {
                trip = 1;
            } else if (trip == "") {
                if (pageName == "list") {
                    isBackIndex = true;
                }
            }


            var cur = self.flightStore.getAttr('tabtype') || 1;
            trip = trip || 1;

            if (trip != "") {
                self.flightStore.setAttr('tabtype', trip);
                self.flightStore.setAttr('__tripType', trip);
                self.flightStore.setAttr('tripType', trip);
                cur = trip;
            }


            //-------------------------------------------------------------------------------------//
            var dtime =
            (self.getQuery('ddate1') != "" && self.getQuery('ddate1') != null) ?
             self.getQuery('ddate1') :
            (self.getQuery('dtime') != "" && self.getQuery('dtime') != null) ?
             self.getQuery('dtime') : "";
            if ((dtime == "" || self.IsDate(dtime) == false)) {
                if (pageName == "list") {
                    isBackIndex = true;
                }
            } else {
                dtime = cBase.Date.parse(dtime, true);
                dtime = cBase.Date.format(dtime, 'Y/m/d');
                self.flightStore.setSearchDetails(0, 'date', dtime); //go 
            }

            var atime =
            (self.getQuery('ddate2') != "" && self.getQuery('ddate2') != null) ?
             self.getQuery('ddate2') :
            (self.getQuery('atime') != "" && self.getQuery('atime') != null) ?
             self.getQuery('atime') : "";

            if (cur - 2 == 0) {
                if ((atime == "" || self.IsDate(atime) == false)) {
                    if (pageName == "list") {
                        isBackIndex = true;
                    }
                } else {
                    atime = cBase.Date.parse(atime, true);
                    atime = cBase.Date.format(atime, 'Y/m/d');


                    self.flightStore.setSearchDetails(1, 'date', atime); //back 
                }
            }


            if (dtime == "" && atime == "") {
                var dday = (self.getQuery('dday') != "" && self.getQuery('dday') != null) ?
                parseInt(self.getQuery('dday')) :
                (self.getQuery('dayoffset') != "" && self.getQuery('dayoffset') != null) ?
                parseInt(self.getQuery('dayoffset')) : "";

                if (isNaN(dday) == false && dday > 0) {
                    var dateStr = new cBase.Date(cBase.getServerDate()).addDay(dday).format('Y/m/d');
                    var dateStr2 = new cBase.Date(cBase.getServerDate()).addDay(dday + 1).format('Y/m/d');
                    if (cur - 2 == 0) {
                        self.flightStore.setSearchDetails(0, 'date', dateStr); //start
                        self.flightStore.setSearchDetails(1, 'date', dateStr2); //back
                    } else {
                        self.flightStore.setSearchDetails(0, 'date', dateStr);
                    }
                } else {
                    var dateStr = new cBase.Date(cBase.getServerDate()).addDay(1).format('Y/m/d');
                    var dateStr2 = new cBase.Date(cBase.getServerDate()).addDay(2).format('Y/m/d');
                    if (cur - 2 == 0) {
                        self.flightStore.setSearchDetails(0, 'date', dateStr); //start
                        self.flightStore.setSearchDetails(1, 'date', dateStr2); //back
                    } else {
                        self.flightStore.setSearchDetails(0, 'date', dateStr);
                    }
                }
            }
            //-------------------------------------------------------------------------------------//




            var dcity = (self.getQuery('dcity') != "" && self.getQuery('dcity') != null) ?
            self.getQuery('dcity') :
            (self.getQuery('_dcity') != "" && self.getQuery('_dcity') != null) ?
            self.getQuery('_dcity') :
            (self.getQuery('departure') != "" && self.getQuery('departure') != null) ?
            self.getQuery('departure') : "";

            var acity = (self.getQuery('acity') != "" && self.getQuery('acity') != null) ?
            self.getQuery('acity') :
            (self.getQuery('_acity') != "" && self.getQuery('_acity') != null) ?
            self.getQuery('_acity') :
            (self.getQuery('arrival') != "" && self.getQuery('arrival') != null) ?
            self.getQuery('arrival') : "";

            if (dcity == "" || acity == "") {
                if (pageName == "list") {
                    isBackIndex = true;
                    if (dcity == "") {//默认上海到北京
                        dcity = "sha";
                    }
                    if (acity == "") {
                        acity = "bjs";
                    }
                }
                if (pageName == "index") {

                    if (dcity == "") {//默认上海到北京
                        dcity = "sha";
                    }
                    if (acity == "") {
                        acity = "bjs";
                    }
                }

            }


            if (dcity != "" || acity != "") {

                var cityFlight = null;
                var cityIntlFlt = null;
                if (self.flightCityListStore.get() != null && self.flightInterCityListStore.get() != null) {
                    cityFlight = self.flightCityListStore.get();
                    cityIntlFlt = self.flightInterCityListStore.get();
                    self.renderPage(cur, dcity, acity, cityFlight.cities, cityIntlFlt.cities);

                } else {
                    // self.showLoading();
                    //加载基础数据
                    self.baseDataModel.excute(function (data) {
                        //  self.hideLoading();
                        self.renderPage(cur, dcity, acity, data.flightCityList.cities, data.flightInterCityList.cities);

                    }, function (e) {
                        //  self.hideLoading();
                    }, self, self);
                }
            } else {//出发，到达 都空
                if (pageName == "list") {
                    isBackIndex = true;
                }
                //-------------------------------------------------------------------------//
                self.openApp();
                //-------------------------------------------------------------------------//

            }

            self.turning();
        },

        IsDate: function (mystring) {
            var r = /^(?:(?!0000)[0-9]{4}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)-02-29)$/;
            if (!r.exec(mystring)) {
                return false;
            }
            else {
                return true;
            }
        },

        onCreate: function () {
            this.render();
            this.baseDataModel = new cMultipleDate({
                models: {
                    'flightCityList': FlightModels.FlightCityListModel.getInstance(),
                    'flightInterCityList': FlightModels.FlightInterCityListModel.getInstance()
                }
            });
        },

        onLoad: function () {
            var self = this;

            self.updatePage();

        },

        onShow: function () {
            this.setTitle('携程机票');
        },

        onHide: function () {
            // this.hideLoading();
        }


        /*
        //解决UC浏览器不能写localstorage的问题
        checkUcStore: function () {
        if (navigator.userAgent.indexOf(' UCBrowser') > -1) {
        this.flightStore.setAttr('rcsay', 'imbad');
        var r2 = this.flightStore.getAttr('rcsay');
        if ('imbad' != r2) {
        window.location.reload();
        }
        }
        }
        */
    });
    return View;
});
