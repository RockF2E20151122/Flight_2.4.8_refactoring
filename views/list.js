
define([
    'cSales',
    'libs',
    'c',
    'CommonStore',
    'FlightModel',
    'FlightStore',
    'flight/utility/utility',
    'cMultipleDate',
    'adLoad',
    buildViewTemplatesPath('list.html')

], function (
    cSales,
    libs, c, CommonStore, FlightModel, FlightStore, Futility, cMultipleDate,
    MyLoad,
    html) {



    /* 统计埋点开始 */
    try {
        window['h5.flt.searchresult.speed'] = window['h5.flt.searchresult.speed'] || {};
        window['h5.flt.searchresult.speed'].begin = Date.now();
    } catch (e) {

    }
    /* 统计埋点结束 */
    var UBTKey = "h5.flt.searchresult";
    var mdStore = FlightStore.MdListStore.getInstance();
    var mdTransStore = FlightStore.MdTransStore.getInstance();
    require(['cHolidayPriceCalendar'], function () {
        /* 统计埋点开始 */
        try {
            window['h5.flt.searchresult.speed'].loadCalendarEnd = Date.now();
        } catch (e) {

        }
        /* 统计埋点结束 */
    });



    var cui = c.ui,
        cBase = c.base,
        salesStore = CommonStore.SalesObjectStore.getInstance();
    var lowestPriceJson = {};  //90低价日历返回的数据
    var lowestPriceDay = {};    //存放每天的低价，key为day，格式2014/02/22
    //建行
    var flightCCBStore = FlightStore.FlightCCBStore.getInstance();

    var hasBindEvent = false;
    var distHeight = 0;

    var lastY = 0;
    var myload = new MyLoad();

    //--------------------------------------------------------------------------//




    //-----------------------------------------------------------------------------//
    var View = c.view.extend({
        pageid: '212004',
        hasAd: false, //预订页面隐藏页面底部广告 add by zhengkw 2014-7-28
        tpl: html,
        flightSearchSubjoin: FlightStore.FlightSearchSubjoinStore.getInstance(),
        flightSearchStore: FlightStore.FlightSearchStore.getInstance(),
        flightFilterStore: FlightStore.FlightFilterStore.getInstance(),
        flightList: FlightModel.FlightListModel.getInstance(),

        flightCityListStore: FlightStore.FlightCityListStore.getInstance(), //国内机场城市
        flightInterCityListStore: FlightStore.FlightInterCityListStore.getInstance(), //国际机场城市

        lowestPrice: FlightModel.LowestPriceSearchModel.getInstance(),
        lowestPriceStore: FlightStore.LowestPriceSearchStore.getInstance(),
        flightSelectedStore: FlightStore.FlightSelectedInfo.getInstance(),
        flightOrderStore: FlightStore.FlightOrderInfoStore.getInstance(),
        flightDeliveryStore: FlightStore.FlightPickTicketSelectStore.getInstance(), //航班订单配送信息Storage
        flightListStore: FlightStore.FlightListStore.getInstance(),
        baseDataModel: null,
        basedata: null,
        cityType: null,
        sdatalist: '[]',
        IsDate: function (mystring) {
            var r = /^(?:(?!0000)[0-9]{4}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)-02-29)$/;
            if (!r.exec(mystring)) {
                return false;
            }
            else {
                return true;
            }
        },
        getAppUrl: function () {
            console.log("list  getAppUrl start!!");
            var sourceid = "";
            if (window.localStorage && window.localStorage.getItem('SALES') != null && window.localStorage.getItem('SALES') != "") {
                var SALES = JSON.parse(window.localStorage.getItem('SALES'));
                if (SALES["data"] != null) {
                    sourceid = parseInt(SALES["data"]["sourceid"]);
                }
            }
            var datestr = (this.flightSearchStore.getSearchDetails(0, 'date')).replace(/\//g, "");
            var dcity = this.flightSearchStore.getSearchDetails(0, 'dCtyId');
            var acity = this.flightSearchStore.getSearchDetails(0, 'aCtyId');

            var tabType = this.flightSearchStore.getAttr('tabtype') || 1;


            var appUrl = "";
            if (tabType == 1) {
                appUrl =
             "/flight_inland_singlelist?" +
             "c1=" + tabType + //单程还是往返（必需）
             "&c2=" + dcity + //出发城市id（必需）
             "&c3=" + acity + //到达城市id（必需）
             "&c4=" + datestr + //出发时间（yyyymmdd）（必需）
            "&extendSourceID=" + sourceid;
            } else {

                var adatestr = (this.flightSearchStore.getSearchDetails(1, 'date') || "").replace(/\//g, "")
                appUrl =
             "/flight_inland_tolist?" +
             "c1=" + tabType + //单程还是往返（必需）
             "&c2=" + dcity + //出发城市id（必需）
             "&c3=" + acity + //到达城市id（必需）
             "&c4=" + datestr + //出发时间（yyyymmdd）（必需）
             "&c5=" + adatestr + //返程出发时间（yyyymmdd）（单程不传，返程必需）
            "&extendSourceID=" + sourceid;
            }


            return appUrl;
        },

        getSdateList: function () {
            return JSON.parse(this.sdatalist);
        },
        renderPage: function (cur, dcity, acity, ctys1, callback) {
            var self = this;
            //更新页面
            if (ctys1 != null) {
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
                                self.flightSearchStore.setAttr("amode", "1");
                            }
                        }
                        if (dcity && dcity != "") {
                            if (ctys1[i].code.toLowerCase() == dcity.toLowerCase() || ctys1[i].name == decodeURI(dcity) || ctys1[i].id == dcity) {
                                dCityName = ctys1[i].name;
                                dCtyCode = ctys1[i].code;
                                dCityId = ctys1[i].id;
                                self.flightSearchStore.setAttr("dmode", "1");
                            }
                        }
                    }
                }

                //--------------------------------------------------------------------------//
                if (aCityId == '' || aCityName == '') {//默认上海到北京
                    aCtyCode = self.flightSearchStore.getSearchDetails(0, 'aCtyCode') || 'SHA';
                    aCityId = self.flightSearchStore.getSearchDetails(0, 'akey') || 2;
                    aCityName = self.flightSearchStore.getSearchDetails(0, 'acityName') || '上海';
                }
                if (dCityId == '' || dCityName == '') {
                    dCtyCode = self.flightSearchStore.getSearchDetails(0, 'dCtyCode') || 'BJS';
                    dCityId = self.flightSearchStore.getSearchDetails(0, 'dkey') || 2;
                    dCityName = self.flightSearchStore.getSearchDetails(0, 'dcityName') || '北京';
                }

                if (cur - 2 == 0) {
                    self.flightSearchStore.setSearchDetails(0, 'dCtyCode', dCtyCode);
                    self.flightSearchStore.setSearchDetails(0, 'dcityName', dCityName);
                    self.flightSearchStore.setSearchDetails(0, 'dkey', dCityId);
                    self.flightSearchStore.setSearchDetails(0, 'aCtyCode', aCtyCode);
                    self.flightSearchStore.setSearchDetails(0, 'acityName', aCityName);
                    self.flightSearchStore.setSearchDetails(0, 'akey', aCityId);
                    self.flightSearchStore.setSearchDetails(1, 'aCtyCode', dCtyCode);
                    self.flightSearchStore.setSearchDetails(1, 'acityName', dCityName);
                    self.flightSearchStore.setSearchDetails(1, 'akey', dCityId);
                    self.flightSearchStore.setSearchDetails(1, 'dCtyCode', aCtyCode);
                    self.flightSearchStore.setSearchDetails(1, 'dcityName', aCityName);
                    self.flightSearchStore.setSearchDetails(1, 'dkey', aCityId);
                } else {
                    self.flightSearchStore.setSearchDetails(0, 'dCtyCode', dCtyCode);
                    self.flightSearchStore.setSearchDetails(0, 'dcityName', dCityName);
                    self.flightSearchStore.setSearchDetails(0, 'dkey', dCityId);
                    self.flightSearchStore.setSearchDetails(0, 'aCtyCode', aCtyCode);
                    self.flightSearchStore.setSearchDetails(0, 'acityName', aCityName);
                    self.flightSearchStore.setSearchDetails(0, 'akey', aCityId);
                    self.flightSearchStore.removeSearchDetails(1);
                }

                self.flightSearchStore.setAttr('ticketIssueCty', dCtyCode); //出票城市
                self.flightSearchStore.setCurSearchDetails([0]);

                //-------------------------------//
                self.updatePageDate();
                //-------------------------------//


                //-------------------------------------------------------------------------//

                self.reloadData(callback);

                //------------------------------------------------------------------------//
            }
        },
        getSemParam: function (callback) {

            var self = this;

            var today = this.getServerDate();


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
            }

            var cur = self.flightSearchStore.getAttr('tabtype') || 1;
            if (trip != "") {
                self.flightSearchStore.setAttr('tabtype', trip);
                self.flightSearchStore.setAttr('__tripType', trip);
                self.flightSearchStore.setAttr('tripType', trip);
                cur = trip;
            }

            var dday = (self.getQuery('dday') != "" && self.getQuery('dday') != null) ?
                parseInt(self.getQuery('dday')) :
                (self.getQuery('dayoffset') != "" && self.getQuery('dayoffset') != null) ?
                parseInt(self.getQuery('dayoffset')) : "";


            if (isNaN(dday) == false && dday > 0) {

                var dateStr = new cBase.Date(today).addDay(dday).format('Y/m/d');

                var dateStr2 = new cBase.Date(today).addDay(dday + 1).format('Y/m/d');

                if (cur - 2 == 0) {
                    self.flightSearchStore.setSearchDetails(0, 'date', dateStr); //start
                    self.flightSearchStore.setSearchDetails(1, 'date', dateStr2); //back
                    mdStore.setAttr('DTime', dateStr);   //埋点DTime
                    mdStore.setAttr('ATime', dateStr2);  //埋点ATime
                } else {
                    self.flightSearchStore.setSearchDetails(0, 'date', dateStr);
                    mdStore.setAttr('DTime', dateStr);   //埋点DTime
                }

            }
            /*
            var dtime = (self.getQuery('ddate1') != "" && self.getQuery('ddate1') != null) ?
                        parseInt(self.getQuery('ddate1')) :
                        (self.getQuery('dtime') != "" && self.getQuery('dtime') != null) ?
                        parseInt(self.getQuery('dtime')) : "";

               if (dtime == "" || self.IsDate(dtime) == false) {// 出发时间 当空值时则 为明天
                   dtime = cBase.Date.format(cBase.Date.parse(cBase.Date.format(today, 'Y/m/d')).addDay(1), 'Y/m/d');
               }

            var rtime = (self.getQuery('ddate2') != "" && this.getQuery('ddate2') != null) ?
                        self.getQuery('ddate2') :
                        (self.getQuery('rtime') != "" && self.getQuery('rtime') != null) ?
                        self.getQuery('rtime') : "";

              if (rtime == "" || self.IsDate(rtime) == false) {// 出发时间 当空值时则 为明天
                   rtime = cBase.Date.format(cBase.Date.parse(cBase.Date.format(today, 'Y/m/d')).addDay(1), 'Y/m/d');
               }else{
                  if (cBase.Date.parse(dtime).getTime() > cBase.Date.parse(rtime).getTime()){
                       rtime = cBase.Date.format(cBase.Date.parse(dtime).addDay(1), 'Y/m/d');
                 }
              }
              */



            //---------------------------------------------------------------------------------//

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


            if (dcity != "" && acity != "") {

                var cityFlight = null;
                var cityIntlFlt = null;
                if (self.flightCityListStore.get() != null) {
                    cityFlight = self.flightCityListStore.get();
                    cityIntlFlt = self.flightInterCityListStore.get();
                    self.renderPage(cur, dcity, acity, cityFlight.cities, callback);
                } else {
                    //self.showLoading();
                    //加载基础数据
                    /* 统计埋点开始 */
                    try {
                        window['h5.flt.searchresult.speed'].loadBaseDataBegin = Date.now();
                    } catch (e) {

                    }
                    /* 统计埋点结束 */
                    self.baseDataModel.excute(function (data, originData, isAjax) {
                        /* 统计埋点开始 */
                        try {
                            if (isAjax) {
                                window['h5.flt.searchresult.speed'].loadBaseDataEnd = Date.now();
                            }
                        } catch (e) {

                        }
                        /* 统计埋点结束 */
                        self.renderPage(cur, dcity, acity, data.flightCityList.cities, callback);
                    }, function (e) {
                        //self.hideLoading();
                        myload.hide();

                    }, self, self);
                }
            } else {
                //-------------------------------//
                self.updatePageDate();
                //-------------------------------//
                this.reloadData(callback);
            }


        },
        datalist: [],
        isEmpty: false,
        isRedirect: false,
        getQueryStringByName: function (name) {//获取
            var result = location.search.match(new RegExp("[\?\&]" + name + "=([^\&]+)", "i"));
            if (result == null || result.length < 1) {
                return "";
            }
            return result[1];
        },
        render: function () {
            this.viewdata.req = this.request;
            /* 统计埋点开始 */
            try {
                window['h5.flt.searchresult.speed'].renderTplBegin = Date.now();
            } catch (e) {

            }
            this.$el.html(this.tpl);
            /* 统计埋点开始 */
            try {
                window['h5.flt.searchresult.speed'].renderTplEnd = Date.now();
            } catch (e) {

            }
            /* 统计埋点结束 */
            this.els = {
                elf_list: this.$el.find('.f_list'),
                elflightlisttpl: this.$el.find('#flightlisttpl'),
                elt1: this.$el.find('.tab_time .t1'),
                elt2: this.$el.find('.tab_time .t2'),
                elt3: this.$el.find('.tab_time .t3'),
                elt4: this.$el.find('.tab_time .t4'),
                eltabby: this.$el.find('.tab_by li'),
                eltabtime: this.$el.find('li[data-type="time"]'),
                eltabfilter: this.$el.find('li[data-type="filter"]'),
                eltabprice: this.$el.find('li[data-type="price"]'),
                elflightTotal: this.$el.find('#flightTotal'),
                eltitle: this.$el.find('#title'),
                elemptylisttpl: this.$el.find('#emptylisttpl')

            };
            this.flightListTplFun = _.template(this.els.elflightlisttpl.html());
            //标识是否允许点击日历
            this.isShowData = true;
        },
        events: {

            'click #js_return': 'backAction',
            'click #js_home': 'homeAction',
            'click .tab_time li': 'switchDate',
            'click .js_subswitch': 'switchsubListAction',
            'click .js_flight_item': 'tapFlightitemAction',
            'click .js_flight_seat': 'tapFlightSeatAction',
            'click .tab_by li': 'tapSortAction'
        },

        tapSortAction: function (e) {
            var cur = $(e.currentTarget),
                type = cur.attr('data-type'),
                sort;
            switch (type) {
                case 'time':
                    if (this.isEmpty) return;
                    mdStore.addOpValue('SortWay', 'Time'); //埋点SortWay
                    this.flightSearchSubjoin.setAttr('depart-sorttype', 'time');
                    sort = this.flightSearchSubjoin.getAttr('depart-orderby') || 'asc';
                    //如果从价格点击时间排序，默认排序不变
                    if (!cur.hasClass('hover')) {
                        if (sort == 'asc') {
                            sort = 'desc';
                        } else {
                            sort = 'asc';
                        }
                    }
                    switch (sort) {
                        case 'desc':
                            this.flightSearchSubjoin.setAttr('depart-orderby', 'asc');
                            this.renderList();
                            break;
                        case 'asc':
                            this.flightSearchSubjoin.setAttr('depart-orderby', 'desc');
                            this.renderList();
                            break;
                    }
                    break;
                case 'filter':
                    mdStore.setAttr('IsFilter', true); //埋点IsFilter
                    this.forward('flightlistfilter');
                    break;
                case 'price':
                    if (this.isEmpty) return;
                    mdStore.addOpValue('SortWay', 'Price'); //埋点SortWay
                    //如果当前不是以价格进行排序，点击价格时候默认升序  fixbug by mmx
                    if (this.flightSearchSubjoin.getAttr('depart-sorttype') !== "price") {
                        this.flightSearchSubjoin.setAttr('depart-sorttype', 'price');
                        //                        this.flightSearchSubjoin.setAttr('depart-orderby', 'asc');
                        this.renderList();

                    } else {
                        sort = this.flightSearchSubjoin.getAttr('depart-orderby') || 'desc';
                        switch (sort) {
                            case 'desc':
                                this.flightSearchSubjoin.setAttr('depart-orderby', 'asc');
                                this.renderList();
                                break;
                            case 'asc':
                                this.flightSearchSubjoin.setAttr('depart-orderby', 'desc');
                                this.renderList();
                                break;
                        }
                    }

                    break;
            }
        },
        //排序方法
        sortHandler: {
            time_Asc: function (a, b) {
                var atime = cBase.Date.parse(a.dTime).valueOf(), btime = cBase.Date.parse(b.dTime).valueOf();
                return atime - btime;
            },
            time_Desc: function (a, b) {
                var atime = cBase.Date.parse(a.dTime).valueOf(), btime = cBase.Date.parse(b.dTime).valueOf();
                return btime - atime;
            },
            price_Asc: function (a, b) {
                var aprice = a.cabins && a.cabins[0] && a.cabins[0].price || 0, bprice = b.cabins && b.cabins[0] && b.cabins[0].price || 0;
                return aprice - bprice;
            },
            price_Desc: function (a, b) {
                var aprice = a.cabins && a.cabins[0] && a.cabins[0].price || 0, bprice = b.cabins && b.cabins[0] && b.cabins[0].price || 0;
                return bprice - aprice;
            }
        },
        homeAction: function () {
            var salesInfo = salesStore.get();

            if (salesInfo && salesInfo.sid && +salesInfo.sid == 1896) {
                window.location = "map://leftClick()";
            } else if (flightCCBStore.getAttr("isCCB")) {
                this.jump('/webapp/mkt/ccb/');
            } else {
                this.jump('/html5/');
            }
        },
        backAction: function () {

            mdStore.setAttr('IsReturn', true); //埋点IsReturn
            try {
                this.mdSubmit();
            } catch (e) {
                console.log('埋点提交', 'backAction()');
            }
            console.log("list 回退！");
            this.back('index');
        },
        tapFlightitemAction: function (e) {
            var self = this;

            var cur = $(e.currentTarget);
            var target = $(e.target);
            if (target.is('.js_subswitch')) return;
            var key = cur.attr('data-key');
            var ckey = cur.attr('data-ckey');

            var flight = this.datalist[key];
            if (flight.cabins.length > ckey) {
                var cabin = flight.cabins[ckey];
                if (!cabin) {
                    this.showToast('对不起，由于您长时间未操作，请重新查询');
                    return;
                }
                this.flightSelectedStore.setAttr('depart', {
                    flight: flight,
                    cabin: cabin
                });
                this.toNextPage(flight, cabin);

            }

        },
        tapFlightSeatAction: function (e) {
            var cur = $(e.currentTarget),
                key = cur.attr('data-key'),
                parentkey = cur.attr('data-parent-key');
            var flight = this.datalist[parentkey];
            var cabin = flight.cabins && flight.cabins[key];

            if (!cabin) {
                this.showToast('对不起，由于您长时间未操作，请重新查询');
                return;
            }
            try {
                var clz = cabin.class == 2 ? 'C' : (cabin.class == 3 ? 'F' : 'Y');
                mdStore.setAttr('SubClass', clz); //埋点SubClass
                mdStore.setAttr('FlightNoSequence', parentkey); //埋点FlightNoSequence
                var len = cur.parent().find('li').length;
                switch (true) {
                    case +key === 0:
                        mdStore.setAttr('SubClassSequence', 1); //埋点SubClassSequence
                        break;
                    case +key === len - 1:
                        mdStore.setAttr('SubClassSequence', -1); //埋点SubClassSequence
                        break;
                    default:
                        mdStore.setAttr('SubClassSequence', 0); //埋点SubClassSequence
                        break;
                }
                if (cabin.rebateAmt > 0) {
                    mdStore.setAttr('ActiveType', 'PayBack'); //埋点ActiveType
                }
            } catch (e) {
                console.log('埋点', 'tapFlightSeatAction()');
            }
            this.flightSelectedStore.setAttr('depart', {
                flight: flight,
                cabin: cabin
            });
            this.toNextPage(flight, cabin);
        },
        toNextPage: function (flight, cabin) {
            var tabType = +(this.flightSearchStore.getAttr('tabtype') || 1);
            this.flightSelectedStore.removeAttr('arrive');
            this.flightOrderStore.setAttr('selInsure', '1');
            switch (tabType) {
                case 1:
                    this.isRedirect = true;
                    this.flightSearchStore.setAttr('fullCabin', false);
                    try {
                        this.mdSubmit();
                    } catch (e) {
                        console.log('埋点', 'toNextPage()');
                    }
                    this.forward('bookinginfo');
                    if (!window.__isRequireBookininfoSucc) { // 加载bookinginfo 失败则刷新重新加载一次
                        window.location.reload();
                    }
                    break;
                case 2:
                    var sdate = this.flightSearchStore.getSearchDetails(0, 'date') + ' ' + (flight.dTime || '').substr(10, 8);
                    this.flightSearchStore.setAttr('tripType', 2);
                    this.flightSearchStore.setCurSearchDetails([0, 1]);
                    //如果去程日期大于查询页的返程日期则自动等于去程日期+1
                    var goDate = this.flightSearchStore.getAttr('_items')[0]['date'];
                    var backDate = this.flightSearchStore.getAttr('_items')[1]['date'];
                    new Date(goDate).getTime() > new Date(backDate).getTime() ? this.flightSearchStore.setSearchDetails(1, 'date', cBase.Date.format(new cBase.Date(goDate).addDay(1), 'Y/m/d')) : '';
                    try {
                        this.mdSubmit();
                    } catch (e) {
                        console.log('埋点', 'toNextPage()');
                    }
                    console.log("goto backlist ！");
                    this.forward('backlist');
                    break;
            }
        },
        clearCurFilter: function () {
            this.flightSearchSubjoin.removeAttr('departfilter-type');
            this.flightSearchSubjoin.removeAttr('departfilter-value');
            this.flightFilterStore.removeAttr('departfilter-type');
            this.flightFilterStore.removeAttr('departfilter-value');
        },
        resetSort: function () {
            this.flightSearchSubjoin.setAttr('depart-sorttype', 'time'),
                this.flightSearchSubjoin.setAttr('depart-orderby', 'asc');
        },
        switchsubListAction: function (e) {

            var cur = $(e.currentTarget),
                parent = cur.parent(),
                sublist = parent.next('.js_sublist');

            try {
                mdStore.addOpValue('MoreClassSequence', parent.data('key')); //埋点MoreClassSequence
            } catch (e) {
                console.log('埋点', 'switchsubListAction()');
            }


            if (sublist.css('display') === 'block') {
                sublist.hide();
                cur.removeClass('flight-packup').addClass('flight-packdown');
            } else {
                sublist.show();
                cur.removeClass('flight-packdown').addClass('flight-packup');
            }
        },
        switchDate: function (e) {
            //如果为低价日历,弹出日历; 如果点击今天，则弹出日历
            var that = this;


            if (($(e.currentTarget)[0].className == 'cheap-calendar' || $(e.currentTarget)[0].className == 'today t2')) {

                //防止连续点击
                if (!this.isShowData) {
                    return;
                } else {
                    this.isShowData = false;
                }


                if (lowestPriceJson["prices"] && lowestPriceJson["prices"].length > 0) {
                    require(['cHolidayPriceCalendar'], function (HolidayPriceCalendar) {

                        //计算跨3个月还是4个月
                        var testDate = HolidayPriceCalendar.serverDate,
                            year = testDate.getFullYear(),
                            mon = testDate.getMonth(),
                            day = testDate.getDate(),
                            numNum;


                        for (var validDates = [], i = 0, s = lowestPriceJson.prices.length; s > i; i++) {
                            validDates[i] = {
                                date: lowestPriceJson.prices[i]['dDate'],
                                price: lowestPriceJson.prices[i]['price']
                            };
                        }
                        var dcity = that.flightSearchStore.getSearchDetails(0, 'dcityName'),
                            acity = that.flightSearchStore.getSearchDetails(0, 'acityName');

                        var calendar = new HolidayPriceCalendar({
                            header: {
                                title: '<span class="jPriceTitle">低价日历</span><span class="jPriceCity">' + dcity + '-' + acity + '</span>',
                                tel: '4000086666',
                                home: true,
                                homeHandler: function () {
                                    var salesInfo = salesStore.get();

                                    if (salesInfo && salesInfo.sid && +salesInfo.sid == 1896) {
                                        window.location = "map://leftClick()";
                                    } else {
                                        that.jump('/html5/', true);
                                    }

                                }
                            },

                            monthsNum: 12,
                            voidInvalid: false,//默认空的为无效
                            format: 'Y-m-d',
                            priceDate: validDates,
                            onShow: function (e) {
                                this.findMinPrice();
                                $(".cui_cldweek").css("top", "43px");
                                that.isShowData = false;
                                setTimeout(function () {
                                    that.__hide();
                                }, 500);

                                this.$el.find('.cui_cld_daycrt').removeClass('cui_cld_daycrt');
                                try {
                                    var onwardTime = that.flightSearchStore.getAttr('_items')[0]['date'];
                                    var departTime = cBase.Date.format(onwardTime, 'Y-m-d');
                                    var _theDate = this.$el.find('[data-date="' + departTime + '"]')
                                    _theDate.addClass('cui_cld_daycrt');

                                    try {
                                        var cHeight, sHeight;
                                        if (document.compatMode == "BackCompat") {
                                            cHeight = document.body.clientHeight;
                                            sHeight = document.body.scrollHeight;
                                        } else { //document.compatMode == "CSS1Compat"  
                                            cHeight = document.documentElement.clientHeight;
                                            sHeight = document.documentElement.scrollHeight;
                                        }
                                        window.scrollTo(0, parseInt(_theDate.offset().top - (cHeight / 2)));
                                    } catch (er) {

                                    }

                                    flagHightLight = 0;
                                } catch (err) {

                                }
                                this.$el[0].offsetHeight;  //读取header的高度，强制回流
                            },
                            onHide: function () {
                                that.__show();
                                $('body').data('cui-date', '');
                                this.remove();
                                that.isShowData = true;

                            },
                            callback: function (date, dateStyle, target) {
                                this.hide();
                                //要查询90天的数据
                                var d = c.utility.Date.format(date, 'Y/m/d');

                                this.$el.find('.cui_cld_daycrt').removeClass('cui_cld_daycrt');
                                target.addClass('cui_cld_daycrt');
                                that.lowestPriceClick(d);   //更新list页面
                            }
                        });
                        mdStore.setAttr('DateQuery', 'PriceCalendar'); //埋点DateQuery
                        calendar.show();
                        that.GoToView = "calendar";
                    });
                }
            }

            //如果切换了日期，则移除上一次的排序规则 2014-1-20 caof
            //            if (this.flightSearchSubjoin) { this.flightSearchSubjoin.remove(); }
            var curEl = $(e.currentTarget), date = curEl.attr('data-date'), enddate = this.flightSearchStore.getAttr('calendarendtime');
            enddate = cBase.Date.parse(enddate, true);
            try {
                var dq = curEl.hasClass('yesterday') ? 'BeforeDay' : curEl.hasClass('tomorrow') ? 'AfterDay' : '';
                mdStore.setAttr('DateQuery', dq);   //埋点DateQuery
            } catch (e) {
                console.log('埋点', 'switchDate()');
            }
            if (date && (date = cBase.Date.parse(date, true)) <= enddate) {
                //                this.clearCurFilter();
                this.flightSearchStore.setSearchDetails(0, 'date', cBase.Date.format(date, 'Y/m/d'));
                try {
                    mdStore.setAttr('DTime', cBase.Date.format(date, 'Y/m/d'));  //埋点DTime
                    this.mdSubmit();
                } catch (e) {
                    console.log('埋点', 'switchDate()');
                }
                this.flightSearchStore.setCurSearchDetails([0]);
                this.updateTopDatePanel(date);
                // this.showLoading();
                myload.show();
                this.reloadData(function () {
                    //this.hideLoading();
                    myload.hide();
                });
            }
        },
        lowestPriceClick: function (d) {
            //如果切换了日期，则移除上一次的排序规则 2014-1-20 caof
            //            if (this.flightSearchSubjoin) { this.flightSearchSubjoin.remove(); }
            var date = d, enddate = this.flightSearchStore.getAttr('calendarendtime');
            enddate = cBase.Date.parse(enddate, true);

            if (date && (date = cBase.Date.parse(date, true)) <= enddate) {
                //                this.clearCurFilter();
                this.flightSearchStore.setSearchDetails(0, 'date', cBase.Date.format(date, 'Y/m/d'));
                try {
                    mdStore.setAttr('DTime', cBase.Date.format(date, 'Y/m/d'));  //埋点DTime
                    this.mdSubmit();
                } catch (e) {
                    console.log('埋点', 'lowestPriceClick()');
                }
                this.flightSearchStore.setCurSearchDetails([0]);
                this.updateTopDatePanel(date);
                // this.showLoading();
                myload.show();
                this.reloadData(function () {
                    // this.hideLoading();
                    myload.hide();
                });
            }
        },
        buildEvent: function () { },
        disposeData: function (sdata) {

            var data = sdata;
            //筛选逻辑
            var ftype = this.flightSearchSubjoin.getAttr('departfilter-type'),
                fvalue = this.flightSearchSubjoin.getAttr('departfilter-value'),
                regtime = /^\d{4}[-\/]\d{1,2}[-\/]\d{1,2}\s+(\d{1,2}:\d{1,2}):\d{1,2}$/i;

            switch (true) {
                case (ftype === '0' && !!fvalue):
                    data = _.filter(data, function (d) {
                        var t = regtime.exec(d.dTime);
                        t = t && t[1];
                        var dtime = parseInt(t.replace(':', '')),
                            ts = fvalue.split('-'),
                            st = parseInt(ts[0].replace(':', '')),
                            dt = parseInt(ts[1].replace(':', ''));
                        return st <= dtime && dtime <= dt;
                    });
                    break;
                case (ftype === '1' && !!fvalue):
                    data || (data = []);

                    data = _.filter(data, function (k) {
                        k["cabins"] = _.filter(k["cabins"], function (n) {
                            if (fvalue == 3) {//头等舱 
                                return (n["classForDisp"] === 5 || (n["class"] == 3)) || (n["classForDisp"] === 4 || (n["class"] == 2));
                            } else if (fvalue == 0) {//经济舱 比较特殊 当 classForDisp = 6 或者 class !=2 or class !=3
                                return (n["classForDisp"] === 6 || (n["class"] != 2 && n["class"] != 3));
                            } else {
                                return false;
                            }
                        });
                        return (k["cabins"] && k["cabins"].length > 0);
                    });


                    break;
                case (ftype === '2' && !!fvalue):
                    data = _.filter(data, function (d) {
                        return fvalue === d.airlineCode;
                    });
                    break;
            }

            //排序逻辑
            var sorttype = this.flightSearchSubjoin.getAttr('depart-sorttype'),
                orderby = this.flightSearchSubjoin.getAttr('depart-orderby');
            console.log(sorttype, orderby);

            this.els.eltabby.removeClass('hover');

            switch (true) {
                case (sorttype === 'time' && orderby === 'asc'):
                    data.sort(this.sortHandler.time_Asc);
                    this.els.eltabtime.addClass('hover');
                    //this.els.eltabtime.find('em').html('↑');
                    this.els.eltabtime.find('em').removeClass('flight-icon-pxd');
                    this.els.eltabtime.find('em').addClass('flight-icon-pxu');
                    break;
                case (sorttype === 'time' && orderby === 'desc'):
                    data.sort(this.sortHandler.time_Desc);
                    this.els.eltabtime.addClass('hover');
                    //this.els.eltabtime.find('em').html('↓');
                    this.els.eltabtime.find('em').removeClass('flight-icon-pxu');
                    this.els.eltabtime.find('em').addClass('flight-icon-pxd');
                    break;
                case (sorttype === 'price' && orderby === 'asc'):
                    data.sort(this.sortHandler.price_Asc);
                    this.els.eltabprice.addClass('hover');
                    //this.els.eltabprice.find('em').html('↑');
                    this.els.eltabprice.find('em').removeClass('flight-icon-pxd');
                    this.els.eltabprice.find('em').addClass('flight-icon-pxu');
                    break;
                case (sorttype === 'price' && orderby === 'desc'):
                    data.sort(this.sortHandler.price_Desc);
                    this.els.eltabprice.addClass('hover');
                    //this.els.eltabprice.find('em').html('↓');
                    this.els.eltabprice.find('em').removeClass('flight-icon-pxu');
                    this.els.eltabprice.find('em').addClass('flight-icon-pxd');
                    break;
            }
            return data;
        },

        //追加数据
        renderList: function () {
            //埋点--start--
            var datestr = this.flightSearchStore.getSearchDetails(0, 'date'),
                adatestr = this.flightSearchStore.getSearchDetails(1, 'date'),
                dcity = this.flightSearchStore.getSearchDetails(0, 'dcityName'),
                acity = this.flightSearchStore.getSearchDetails(0, 'acityName'),
                tabType = this.flightSearchStore.getAttr('tabtype') || 1;
            try {
                mdStore.setAttr('DCity', dcity); //埋点DCity
                mdStore.setAttr('ACity', acity); //埋点ACity
                mdStore.setAttr('FlightType', tabType === 1 ? 'OW' : 'RT'); //埋点FlightType
                mdStore.setAttr('DTime', datestr); //埋点DTime
                mdStore.setAttr('ATime', adatestr ? adatestr : ''); //埋点ATime
            } catch (e) {
                console.log('埋点', 'renderList()');
            }
            //埋点--end--

            this.datalist = this.disposeData(this.getSdateList());
            var filterClass = this.flightSearchSubjoin.getAttr('departfilter-type-cabin');
            //小米黄页合作，隐藏要求的功能
            var _sales = salesStore.get();
            // console.log(this.datalist);



            function filterCabins(cbs, type, cldp, cls, num) {


                if (type == "nds") {//全价
                    var _cbs = $.grep(cbs, function (n, i) {
                        if (n["discount"] == 10) {
                            if (cls == null) {
                                if (cldp == 5) {//头等舱 全价
                                    return (n["classForDisp"] === 5 || (n["class"] == 3));
                                } else if (cldp == 6) {//经济舱 比较特殊 当 classForDisp = 6 或者 class !=2 or class !=3
                                    return (n["classForDisp"] === 6 || (n["class"] != 2 && n["class"] != 3));
                                } else if (cldp == 4) {//商务 和公务他娘的是一个东西
                                    return (n["classForDisp"] === 4 || (n["class"] == 2));
                                } else {
                                    return (n["classForDisp"] === cldp);
                                }

                            } else {
                                return (n["classForDisp"] + "" + n["class"] === cldp + "" + cls);
                            }
                        } else {
                            return false;
                        }
                    });

                    if (_cbs && _cbs.length > 0) {
                        return _cbs[0];
                    }
                }

                if (type == "min") {//最低价
                    for (var i = 0; i < cbs.length; i++) {//价格排序 小到大
                        for (var j = i; j < cbs.length; j++) {
                            if (cbs[i]["price"] - cbs[j]["price"] > 0) {
                                var temp = cbs[i];
                                cbs[i] = cbs[j];
                                cbs[j] = temp;
                            }
                        }
                    }

                    var _cbs = $.grep(cbs, function (n, i) {

                        if (cls == null) {
                            if (cldp == 6) {//经济舱 比较特殊 当 classForDisp = 6 或者 (n["class"] != 2 && n["class"]!=3)
                                return (n["classForDisp"] === 6 || (n["class"] != 2 && n["class"] != 3));
                            } else if (cldp == 5) {//头等舱
                                return (n["classForDisp"] === 5 || (n["class"] == 3));
                            } else if (cldp == 4) {//商务 和公务他娘的是一个东西
                                return (n["classForDisp"] === 4 || (n["class"] == 2));
                            } else {
                                return (n["classForDisp"] === cldp);
                            }

                        } else {
                            return (n["classForDisp"] + "" + n["class"] === cldp + "" + cls);
                        }


                    });

                    if (_cbs && _cbs.length > 0) {
                        if (num) {
                            if (_cbs.length - num > 0) {
                                return _cbs[num];
                            } else {
                                return null;
                            }
                        } else {
                            return _cbs[0];
                        }
                    }
                }
                return null;
            }
            /*
            第一行：当前最低价经济舱一条，没有不显示；    filterCabins(cbs,'min', 6  )
            第二行：次低价返现经济舱一条，没有不显示；    filterCabins(cbs,'min', 6,null,1 )
            第三行：最低价商务舱一条，没有不显示；       filterCabins(cbs,'min', 4  )
            第四行：全价商务舱一条，没有不显示；         filterCabins(cbs,'nds', 4  )
                第五行：超值头等舱最低价一条，没有不显示；     filterCabins(cbs,'min', 2,3  )
                第六行：头等舱最低价一条，没有不显示；         filterCabins(cbs,'min', 5   )
                第七行：头等舱全价一条，没有不显示；          filterCabins(cbs,'nds', 5   )
                第八行：豪华头等舱最低价一条，没有不显示      filterCabins(cbs,'min', 3,3   )
            */
            /*
             大舱位中文（显示用），1: 高端经济舱; 2: 超值头等舱; 3: 超级经济舱; 4:商务舱; 5:头等舱; 6:经济舱
            */

            function checkSameCabin(_cbs, cb) {
                for (var i = 0; i < _cbs.length; i++) {
                    if (_cbs[i]["class"] == cb["class"] && _cbs[i]["classForDisp"] == cb["classForDisp"] && _cbs[i]["price"] == cb["price"]) {
                        return true;
                    }
                }
                return false;
            }

            for (var i = 0; i < this.datalist.length; i++) {

                var _cbs = new Array();
                var cbs = this.datalist[i]["cabins"];

                var cb1 = filterCabins(cbs, 'min', 6);
                var cb2 = filterCabins(cbs, 'min', 6, null, 1);

                var cb9 = filterCabins(cbs, 'nds', 6);

                var cb3 = filterCabins(cbs, 'min', 4);
                var cb4 = filterCabins(cbs, 'nds', 4);
                var cb5 = filterCabins(cbs, 'min', 2, 3);
                var cb6 = filterCabins(cbs, 'min', 5);
                var cb7 = filterCabins(cbs, 'nds', 5);
                var cb8 = filterCabins(cbs, 'min', 3, 3);

                if (cb1 != null && !checkSameCabin(_cbs, cb1)) {
                    _cbs.push(cb1);
                }
                if (cb2 != null && !checkSameCabin(_cbs, cb2)) {
                    _cbs.push(cb2);
                }
                if (cb9 != null && !checkSameCabin(_cbs, cb9)) {
                    _cbs.push(cb9);
                }
                if (cb3 != null && !checkSameCabin(_cbs, cb3)) {
                    _cbs.push(cb3);
                }
                if (cb4 != null && !checkSameCabin(_cbs, cb4)) {
                    _cbs.push(cb4);
                }
                if (cb5 != null && !checkSameCabin(_cbs, cb5)) {
                    _cbs.push(cb5);
                }
                if (cb6 != null && !checkSameCabin(_cbs, cb6)) {
                    _cbs.push(cb6);
                }
                if (cb7 != null && !checkSameCabin(_cbs, cb7)) {
                    _cbs.push(cb7);
                }
                if (cb8 != null && !checkSameCabin(_cbs, cb8)) {
                    _cbs.push(cb8);
                }

                if (_cbs.length > 0) {
                    this.datalist[i]["cabins"] = _cbs;
                } else {
                    this.datalist[i]["cabins"] = cbs;
                }

            }
            var viewdata = {
                list: this.datalist,
                cDate: c.base.Date,
                bd: this.basedata,
                filterClass: filterClass,
                _sales: _sales,
                _viewBuildSeatTitlt: this._viewBuildSeatTitlt,
                _viewfilterfirst: this._viewfilterfirst
            };
            var html = this.flightListTplFun(viewdata);
            /* 统计埋点开始 */
            try {
                window['h5.flt.searchresult.speed'].renderListBegin = Date.now();
            } catch (e) {

            }
            /* 统计埋点结束 */
            this.els.elf_list.html(html);
            /* 统计埋点开始 */
            try {
                window['h5.flt.searchresult.speed'].renderListEnd = Date.now();
            } catch (e) {

            }
            /* 统计埋点结束 */
            // this.afterReFilter();
            var datalen = 0;
            for (var i = 0; i < this.datalist.length; i++) {
                if (this.datalist[i]["flightNo"] != null) {
                    datalen++;
                }
            }

            this.els.elflightTotal.html(datalen);

        },

        afterReFilter: function () {
            /*
            var fcabin = this.flightSearchSubjoin.getAttr('departfilter-type-cabin');

            if (fcabin) {
                var l = this.els.elf_list.find('.f_detail');
                l.each(function (k, v) {
                    var ul = $(v);

                    if (!ul.find("li[data-class='c" + fcabin + "']").length) {
                        ul.prev('ul.f_list_tab').hide();
                        ul.hide();
                    } else {
                        ul.find('li[data-class]').hide();
                        ul.find("li[data-class='c" + fcabin + "']").show();
                    }
                });
            }*/
        },
        updatePageDate: function () {
            var datestr = this.flightSearchStore.getSearchDetails(0, 'date'),
                adatestr = this.flightSearchStore.getSearchDetails(1, 'date'),
                dcity = this.flightSearchStore.getSearchDetails(0, 'dcityName'),
                acity = this.flightSearchStore.getSearchDetails(0, 'acityName'),
                tabType = this.flightSearchStore.getAttr('tabtype') || 1,
                sorttype = this.flightSearchSubjoin.getAttr('depart-sorttype'),
                orderby = this.flightSearchSubjoin.getAttr('depart-orderby'),
                date = cBase.Date.parse(datestr, true),
                adate = cBase.Date.parse(adatestr, true);

            /************fix bug 44783：由于tabType可能是字符串，需要进行转换下 update 2014-1-8 caof*************/
            if (tabType) { tabType = (+tabType); }
            /*************end**************/
            switch (tabType) {
                case 1:
                    this.els.eltitle.html(dcity + '-' + acity + '');

                    break;
                case 2:
                    if (date > adate) {
                        date = new Date(adate.valueOf());
                        this.flightSearchStore.setSearchDetails(0, 'date', cBase.Date.format(date, 'Y/m/d H:i:s'));
                    }
                    this.els.eltitle.html('去程: ' + dcity + '-' + acity + '');

                    break;
            }
            switch (true) {
                case (sorttype === 'time' && orderby === 'asc'):
                    this.els.eltabtime.addClass('hover');
                    this.els.eltabtime.find('em').html('↑');
                    break;
                case (sorttype === 'time' && orderby === 'desc'):
                    this.els.eltabtime.addClass('hover');
                    this.els.eltabtime.find('em').html('↓');
                    break;
                case (sorttype === 'price' && orderby === 'asc'):
                    this.els.eltabprice.addClass('hover');
                    this.els.eltabprice.find('em').html('↑');
                    break;
                case (sorttype === 'price' && orderby === 'desc'):
                    this.els.eltabprice.addClass('hover');
                    this.els.eltabprice.find('em').html('↓');
                    break;
            }
            // 90天低价修改，在lowestPriceList  成功后调用  by jianhua_huang
            //  this.updateTopDatePanel(date);
        },
        updateTopDatePanel: function (curDate) {
            curDate.setHours(0, 0, 0, 0);
            var t1 = new cBase.Date(curDate).addDay(-1),
                t2 = new cBase.Date(curDate),
                t3 = new cBase.Date(curDate).addDay(1),
                cur = (new cBase.Date(this.getServerDate())).setHours(0, 0, 0, 0).valueOf();
            var enddate = this.flightSearchStore.getAttr('calendarendtime');
            enddate = cBase.Date.parse(enddate, true);

            if (t1.valueOf() >= cur) {
                this.$el.find('.yesterday').removeClass('flight-listdate-disable');
                this.els.elt1.attr('data-date', t1.format('Y/m/d'));
                lowestPriceDay[t1.format('Y/m/d')] ? this.$el.find('.t1 .price').html('<dfn>&yen;</dfn>' + lowestPriceDay[t1.format('Y/m/d')]) : this.$el.find('.t1 .price').html(' ');
            } else {
                this.$el.find('.yesterday').addClass('flight-listdate-disable');
                this.$el.find('.t1 .price').html('');
                this.els.elt1.attr('data-date', '');
            }
            if (t2.valueOf() >= cur) {
                // this.$el.find('.date').html(t2.format('m-d'));
                this.$el.find('#js_CurDate').text(t2.format('Y-m-d w'));
                this.els.elt2.attr('data-date', t2.format('Y/m/d'));
                lowestPriceDay[t2.format('Y/m/d')] ? this.$el.find('.t2 .price').html('<dfn>&yen;</dfn>' + lowestPriceDay[t2.format('Y/m/d')]) : this.$el.find('.t2 .price').html('');
            } else {
                this.els.elt2.html('--');
                this.els.elt2.attr('data-date', '');
            }
            if (t3.valueOf() <= enddate) {
                this.$el.find('.tomorrow').removeClass('flight-listdate-disable');
                this.els.elt3.attr('data-date', t3.format('Y/m/d'));
                lowestPriceDay[t3.format('Y/m/d')] ? this.$el.find('.t3 .price').html('<dfn>&yen;</dfn>' + lowestPriceDay[t3.format('Y/m/d')]) : this.$el.find('.t3 .price').html('');
            } else {
                this.$el.find('.tomorrow').addClass('flight-listdate-disable');
                this.els.elt3.attr('data-date', '');
                this.$el.find('.t3 .price').html('');
            }
        },
        reloadData: function (callback) {
            var _this = this;

            this.els.elf_list.empty();

            this.flightSearchStore.setCurSearchDetails([0]);
            // 修复往返机票混乱bug shbzhang 2013/12/20
            var that = this;
            /* 统计埋点开始 */
            try {
                window['h5.flt.searchresult.speed'].loadFlightListBegin = Date.now();
            } catch (e) {

            }
            this.els.elflightTotal.html(0);

            /* 统计埋点结束 */
            this.flightList.excute(function (data, originData, isAjax) {

                // myload.hide();

                /* 统计埋点开始 */
                try {
                    if (isAjax) {
                        window['h5.flt.searchresult.speed'].loadFlightListEnd = Date.now();
                    }
                } catch (e) {

                }
                /* 统计埋点结束 */
                //当数据为空并且items也为空时
                if (!data.count && (!data.items || !data.items.length)) {
                    this.els.elf_list.html(this.els.elemptylisttpl.html());
                    this.isEmpty = true;
                } else {
                    this.sdatalist = JSON.stringify(data.items || []);
                    this.datalist = (data.items || []).sort(this.sortHandler.price_Asc);
                    //(data.items || []).sort(this.sortHandler.time_Asc);
                    //算最低价的子舱
                    var minCabinPrice = Infinity;
                    for (var ci = 0, cLen = data.items.length; ci < cLen; ci++) {
                        if (data.items[ci]['cabins'].length > 0) {
                            minCabinPrice = +data.items[ci]['cabins'][0]['price'] < minCabinPrice ? data.items[ci]['cabins'][0]['price'] : minCabinPrice;
                        }
                    }
                    this.$el.find('.t2 .price').html('<dfn>&yen;</dfn>' + minCabinPrice);

                    if (this.datalist.length) {
                        this.isEmpty = false;
                    } else {
                        this.isEmpty = true;
                    }
                    this.renderList(this.datalist || []);
                }
                callback.call(this, data);

            }, function (e) {
                //that.hideLoading();
                myload.hide();

                if (e && e.msg) {
                    setTimeout(function () {
                        _this.showToast(e.msg, 0, function () {
                            _this.back('index');
                        });
                    }, 1000);
                } else {
                    setTimeout(function () {
                        _this.showToast('数据加载失败', 0, function () {
                            _this.back('index');
                        });
                    }, 1000);
                }
                callback.call(this);
            }, this.flightSearchStore.getAttr('fullCabin'), this);  //flightSearchStore.getAttr('fullCabin')
        },
        updatePage: function (callback) {
            //强制下载渠道包
            var sourceid = this.getQuery('sourceid');
            if (sourceid && +sourceid > 0) {
                var isForceDown = 0;
                var lstSourceid = ['497', '1107', '1108', '3516', '3512', '3511', '3503', '3513', '1595', '1596', '3524', '3517', '3518', '1591', '1825', '1826', '1827', '1828', '1829', '1830', '1831'];
                for (var i = 0, len = lstSourceid.length; i < len; i++) {
                    var d = lstSourceid[i];
                    if (d == sourceid) {
                        isForceDown = 1;
                        break;
                    }
                }
                if (isForceDown) {
                    this.footer.checkForceDownload(sourceid);
                }
            }



            myload.show();



            this.getSemParam(callback);

        },
        lowestPriceList: function () {
            //模拟90天低价返回的数据
            var that = this;
            lowestPriceJson.head = { "auth": null, "errcode": 0 };
            var tempPrice = new Array();
            var data = {};
            /* 统计埋点开始 */
            try {
                window['h5.flt.searchresult.speed'].loadLowestPriceBegin = Date.now();
            } catch (e) {

            }

            this.$el.find('.t2 .price').html('');
            /* 统计埋点结束 */
            this.lowestPrice.excute(function (pricedata, originData, isAjax) {
                data = pricedata;
                // myload.hide();
                /* 统计埋点开始 */
                try {
                    if (isAjax) {
                        window['h5.flt.searchresult.speed'].loadLowestPriceEnd = Date.now();
                    }
                } catch (e) {

                }

            }, function (e) {

            }, false, this);
            /* 统计埋点结束 */
            if (data && data['prices'] && data['prices'].length > 0) {
                for (var i = 0, len = data['prices'].length; i < len; i++) {
                    data['prices'][i]['dDate'] = new Date(data['prices'][i]['dDate'].replace(/-/g, '/'));

                    lowestDayKey = cBase.Date.format(data['prices'][i]['dDate'], 'Y/m/d');
                    lowestPriceDay[lowestDayKey] = data['prices'][i]['price'];
                }
                tempPrice = data['prices'];
                lowestPriceJson.prices = tempPrice;
               
            }
            else {
                data['prices'] = [];
                var testDate = this.getServerDate();
                for (var i = 0, len = 90; i < len; i++) {
                    data['prices'].push({ dDate: cBase.Date.parse(cBase.Date.format(testDate, 'Ymd')).addDay(i).date, price: "" });
                    lowestDayKey = cBase.Date.format(data['prices'][i]['dDate'], 'Y/m/d');
                    lowestPriceDay[lowestDayKey] = data['prices'][i]['price'];
                }

                tempPrice = data['prices'];

                lowestPriceJson.prices = tempPrice;
            }

            var prices = [];
            var datestr = that.flightSearchStore.getSearchDetails(0, 'date'),
                date = cBase.Date.parse(datestr, true);
            date = cBase.Date.format(date, 'Y/m/d H:i:s');
            date = new Date(date);
            that.updateTopDatePanel(date);
        },
        //首次记载view，创建view
        onCreate: function () {
            console.log("list onCreate ");
            //页面需要的静态资源
            this.render();
            this.buildEvent();

            this.baseDataModel = new cMultipleDate({
                models: {
                    'flightCityList': FlightModel.FlightCityListModel.getInstance(),
                    'flightInterCityList': FlightModel.FlightInterCityListModel.getInstance()
                }
            });

            //-------------新背景色---------------//
            this.$el.css({ "background": "#fff" });
            //-------------新背景色---------------//



        },

        getSalesObj: function () {
            var self = this;
            var sales = self.getQuery('sales'),
                sourceid = self.getQuery('sourceid');

            var _sales = CommonStore.SalesStore.getInstance().get();
            if (_sales != null) {
                if (sourceid == null && sales == null) {
                    sourceid = _sales["sourceid"];
                }
            }
            if (sales || sourceid) {
                cSales.getSalesObject(sales || sourceid, $.proxy(function (data) {
                    cSales.replaceContent(self.$el);
                }, this));
            }

        },
        //加载数据时
        onLoad: function (refer) {

            var self = this;

            self.turning();

            /* 统计埋点开始 */
            try {
                window['h5.flt.searchresult.speed'].viewOnloadBegin = Date.now();
            } catch (e) {

            }

            //查询90天低价日历
            var airItems = this.flightSearchStore.getAttr('items')[0];

            this.lowestPriceStore.setAttr('aCty', airItems['aCtyCode']);
            this.lowestPriceStore.setAttr('dCty', airItems['dCtyCode']);
            this.lowestPriceList();

            if (!this.__assert()) {
                return;
            }

            this.refer = refer || "";

            //如果是填写页或QTE为false，则不刷新页面，跳转原来的位置
            if (this.refer === 'bookinginfo' && this.isRedirect && this.flightListStore.get() && !this.flightSearchStore.getAttr('fullCabin')) {
                this.turning();
            } else {

                this.isRedirect = false;
                // window.scrollTo(0, 0);
                // this.showLoading();


                this.flightSearchStore.setAttr('__tripType', 1);
                this.updatePage(function () {
                    //  this.turning();
                    // this.hideLoading();
                    myload.hide();

                    /* 统计埋点开始 */
                    try {
                        window['h5.flt.searchresult.speed'].end = Date.now();
                        //上报tracelog
                        if (typeof window['__bfi'] == 'undefined') window['__bfi'] = [];
                        var report = {
                            renderListTime: window['h5.flt.searchresult.speed'].renderListEnd - window['h5.flt.searchresult.speed'].renderListBegin,
                            renderTplTime: window['h5.flt.searchresult.speed'].renderTplEnd - window['h5.flt.searchresult.speed'].renderTplBegin,
                            onloadTime: window['h5.flt.searchresult.speed'].end - window['h5.flt.searchresult.speed'].viewOnloadBegin,
                        };
                        if (window['h5.flt.searchresult.speed'].loadCalendarTime) {
                            report.loadCalendarTime = window['h5.flt.searchresult.speed'].loadCalendarEnd - window['h5.flt.searchresult.speed'].begin;
                        }
                        if (window['h5.flt.searchresult.speed'].loadFlightListEnd) {
                            report.listAPI = window['h5.flt.searchresult.speed'].loadFlightListEnd - window['h5.flt.searchresult.speed'].loadFlightListBegin;
                        }
                        if (window['h5.flt.searchresult.speed'].loadLowestPriceEnd) {
                            report.priceAPI = window['h5.flt.searchresult.speed'].loadLowestPriceEnd - window['h5.flt.searchresult.speed'].loadLowestPriceBegin;
                        }

                        window.__bfi.push(['_tracklog', 'h5.flt.searchresult.speed', JSON.stringify(report)]);
                    } catch (e) {

                    }
                    /* 统计埋点结束 */
                })
                //
            }


            //小米黄页合作，隐藏要求的功能
            var _sales = salesStore.get();
            var sourceid = this.getQuery('sourceid');
            if ((sourceid && (+sourceid == 1575 || +sourceid == 1867)) || (_sales && _sales.sid && (+_sales.sid == 1575 || +_sales.sid == 1867))) {
                this.$el.find('#js_home').hide();
                this.$el.find('#footer').hide();
                if (this.footer)
                    this.footer.hide();
                this.hasAd = false;
            }

            //更新电话号码
            this.getSalesObj();
        },
        //调用turning方法时触发
        onShow: function () {
            console.log("list onShow ");
            this.setTitle('机票列表页');
            //埋点
            var datestr = this.flightSearchStore.getSearchDetails(0, 'date'),
                adatestr = this.flightSearchStore.getSearchDetails(1, 'date'),
                dcity = this.flightSearchStore.getSearchDetails(0, 'dcityName'),
                acity = this.flightSearchStore.getSearchDetails(0, 'acityName'),
                tabType = this.flightSearchStore.getAttr('tabtype') || 1;
            //埋点--start--
            try {
                mdStore.setAttr('DCity', dcity); //埋点DCity
                mdStore.setAttr('ACity', acity); //埋点ACity
                mdStore.setAttr('FlightType', tabType === 1 ? 'OW' : 'RT'); //埋点FlightType
                mdStore.setAttr('DTime', datestr); //埋点DTime
                mdStore.setAttr('ATime', adatestr ? adatestr : ''); //埋点ATime
            } catch (e) {
                console.log('埋点', 'onShow()');
            }
            //埋点--end--
            if (this.refer === 'bookinginfo' && this.isRedirect) {
                this.restoreScrollPos();
            }


        },
        onHide: function (toViewName) {
            console.log("list onHide " + toViewName);
            if (toViewName === 'index' || toViewName === '') {
                this.clearCurFilter();
                this.resetSort();
            }

            var self = this;

            if (toViewName != "bookinginfo" && this.GoToView != "calendar") {
                this.els.elf_list.empty();
            }

            myload.hide();

        },
        /** 页面中调用方法 **/
        _viewBuildSeatTitlt: function (classForDisp, classDis) {

            var title;
            var s = (+classDis == 3) ? '头等舱' : (+classDis == 2) ? '公务舱' : '经济舱';
            if (classForDisp === 1) {
                title = '<i class="clr-ff9a14">高端' + s + '</i>'; /*  class jGao 旧样式*/
            } else if (classForDisp === 2) {
                title = '<i class="clr-ff9a14">超值' + s + '</i>';
            } else if (classForDisp === 3) {
                title = '<i class="clr-ff9a14">豪华' + s + '</i>';
            } else if (classForDisp === 4) {
                title = '商务舱';
            } else if (classForDisp === 5) {
                title = '头等舱';
            } else if (classForDisp === 6) {
                title = '经济舱';
            } else if (classForDisp === 7) {
                title = '<i class="clr-ff9a14">空中' + s + '</i>';
            } else {
                title = s;
            }
            return title;
        },
        _viewfilterfirst: function (list, Cls) {
            if (list && list.length > 0) {
                var p = 0;
                var c = null;
                for (var i = 0; i < list.length; i++) {
                    if (i == 0) {
                        p = list[0]["price"];
                        c = list[0];
                        c["ckey"] = 0;
                    } else {
                        if (p - list[i]["price"] > 0) {
                            p = list[i]["price"];
                            c = list[i];
                            c["ckey"] = i;
                        }
                    }
                }
                return c;
            }

        },
        __assert: function () {
            /*
             var dcity = this.flightSearchStore.getSearchDetails(0, 'dcityName'),
            acity = this.flightSearchStore.getSearchDetails(0, 'acityName');
            if (!dcity || !acity) {
            this.back('list');
            return false;
            }

            */
            return true;
        },
        /**
         * 发送埋点信息，删除mdStore
         */
        mdSubmit: function () {
            var fns = mdStore.getAttr('FlightNoSequence'),
                scs = mdStore.getAttr('SubClassSequence'),
                at = mdStore.getAttr('ActiveType');
            mdTransStore.setAttr('dObj', {
                fns: fns,
                scs: scs,
                at: at
            });
            Futility.sendUbt(UBTKey, mdStore.get());
            mdStore.remove();
        }
    });
    return View;
});


