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
    buildViewTemplatesPath('backlist.html') 
   
], function (cSales, libs, c, CommonStore, FlightModel, FlightStore, Futility, cMultipleDate, MyLoad, html) {
    require(['cHolidayPriceCalendar']);

    var lastY = 0;
    var myload = new MyLoad();
    var cui = c.ui, cBase = c.base, salesStore = CommonStore.SalesObjectStore.getInstance();
    var calFirst; //是否第一次创建日历
    var lowestPriceJson = {};  //90低价日历返回的数据
    var lowestPriceDay = {};    //存放每天的低价，key为day，格式2014/02/22
    var UBTKey = "h5.flt.searchresult";
    var mdBackStore = FlightStore.MdListStore.getInstance();
    var mdTransStore = FlightStore.MdTransStore.getInstance();
    //建行
    var flightCCBStore = FlightStore.FlightCCBStore.getInstance();
    //--------------------------------------------------------------------------//



    //--------------------------------------------------------------------------//
    var View = c.view.extend({
        pageid: '212009',
        tpl: html,
        hasAd: false,
        flightSearchSubjoin: FlightStore.FlightSearchSubjoinStore.getInstance(),
        flightSearchStore: FlightStore.FlightSearchStore.getInstance(),
        flightFilterStore: FlightStore.FlightFilterStore.getInstance(),
        flightList: FlightModel.FlightListModel.getInstance(),
        flightSelectedStore: FlightStore.FlightSelectedInfo.getInstance(),
        lowestPrice: FlightModel.LowestPriceSearchModel.getInstance(),
        lowestPriceStore: FlightStore.LowestPriceSearchStore.getInstance(),
        flightOrderStore: FlightStore.FlightOrderInfoStore.getInstance(),
        flightListStore: FlightStore.FlightListStore.getInstance(),
        baseDataModel: null,
        basedata: null,
        cityType: null,
        sdatalist: [],
        datalist: [],
        isEmpty: false,
        isRedirect: false,
        render: function () {
            this.viewdata.req = this.request;
            this.$el.html(this.tpl);
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
            var cur = $(e.currentTarget), type = cur.attr('data-type'), sort;
            switch (type) {
                case 'time':
                    if (this.isEmpty) return;
                    mdBackStore.addOpValue('SortWay', 'Time'); //埋点SortWay
                    this.flightSearchSubjoin.setAttr('arrive-sorttype', 'time');
                    sort = this.flightSearchSubjoin.getAttr('arrive-orderby') || 'asc';
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
                            this.flightSearchSubjoin.setAttr('arrive-orderby', 'asc');
                            this.renderList();
                            break;
                        case 'asc':
                            this.flightSearchSubjoin.setAttr('arrive-orderby', 'desc');
                            this.renderList();
                            break;
                    }
                    break;
                case 'filter':
                    mdBackStore.setAttr('IsFilter', true); //埋点IsFilter
                    this.forward('flightlistfilter');
                    break;
                case 'price':
                    if (this.isEmpty) return;
                    mdBackStore.addOpValue('SortWay', 'Price'); //埋点SortWay
                    //如果当前不是以价格进行排序，点击价格时候默认升序  fixbug by mmx
                    if (this.flightSearchSubjoin.getAttr('arrive-sorttype') !== "price") {
                        this.flightSearchSubjoin.setAttr('arrive-sorttype', 'price');
                        this.renderList();

                    } else {
                        sort = this.flightSearchSubjoin.getAttr('arrive-orderby') || 'desc';
                        switch (sort) {
                            case 'desc':
                                this.flightSearchSubjoin.setAttr('arrive-orderby', 'asc');
                                this.renderList();
                                break;
                            case 'asc':
                                this.flightSearchSubjoin.setAttr('arrive-orderby', 'desc');
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
        backAction: function () {
            mdBackStore.setAttr('IsReturn', true); //埋点IsReturn
            try {
                this.mdSubmit();
            } catch (e) {
                console.log('埋点提交', 'backAction()');
            }
            console.log("backlist 回退！");
            this.back('list');
        },
        homeAction: function () {
            var salesInfo = salesStore.get();

            if (salesInfo && salesInfo.sid && +salesInfo.sid == 1896) {
                window.location = "map://leftClick()";
            } else if (salesInfo && salesInfo.sid && +salesInfo.sid == 449843) {
                this.jump('/webapp/mkt/ccb/');
            } else {
                this.jump('/html5/');
            }
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
                var citys = this.basedata.FlightCityList.cities2 || {};
                this.flightSelectedStore.setAttr('arrive', {
                    flight: flight,
                    cabin: cabin,
                    aircraft: this.basedata.FlightAircraft[flight.planeType],
                    dportinfo: citys[flight.dPortCode],
                    aportinfo: citys[flight.aPortCode],
                    airline: this.basedata.FlightAirline[flight.airlineCode]
                });
                this.toNextPage(flight, cabin);
            }  
        },
        tapFlightSeatAction: function (e) {
            var cur = $(e.currentTarget), key = cur.attr('data-key'), parentkey = cur.attr('data-parent-key');
            var flight = this.datalist[parentkey], cabin = flight.cabins && flight.cabins[key];
            if (!cabin) return;
            try {
                var clz = cabin.class == 2 ? 'C' : (cabin.class == 3 ? 'F' : 'Y');
                mdBackStore.setAttr('SubClass', clz); //埋点SubClass
                mdBackStore.setAttr('FlightNoSequence', parentkey); //FlightNoSequence
                var len = cur.parent().find('li').length;
                switch (true) {
                    case +key === 0:
                        mdBackStore.setAttr('SubClassSequence', 1); //埋点SubClassSequence
                        break;
                    case +key === len - 1:
                        mdBackStore.setAttr('SubClassSequence', -1); //埋点SubClassSequence
                        break;
                    default:
                        mdBackStore.setAttr('SubClassSequence', 0); //埋点SubClassSequence
                        break;
                }
                if (cabin.rebateAmt > 0) {
                    mdBackStore.setAttr('ActiveType', 'PayBack'); //埋点ActiveType
                }
            } catch (e) {
                console.log('埋点', 'tapFlightSeatAction()');
            }
            var citys = this.basedata.FlightCityList.cities2 || {};
            this.flightSelectedStore.setAttr('arrive', {
                flight: flight,
                cabin: cabin,
                aircraft: this.basedata.FlightAircraft[flight.planeType],
                dportinfo: citys[flight.dPortCode],
                aportinfo: citys[flight.aPortCode],
                airline: this.basedata.FlightAirline[flight.airlineCode]
            });
            this.toNextPage(flight, cabin);
        },
        toNextPage: function (flight, cabin) {
            this.flightOrderStore.setAttr('selInsure', '1');
            this.flightOrderStore.setAttr('fullCabin', false);
            this.isRedirect = true;
            try {
                this.mdSubmit();
            } catch (e) {
                console.log('埋点', 'toNextPage()');
            }
            this.forward('bookinginfo');
        },
        clearCurFilter: function () {
            this.flightSearchSubjoin.removeAttr('arrivefilter-type');
            this.flightSearchSubjoin.removeAttr('arrivefilter-value');
            this.flightFilterStore.removeAttr('arrivefilter-type');
            this.flightFilterStore.removeAttr('arrivefilter-value');
        },
        resetSort: function () {
            this.flightSearchSubjoin.setAttr('arrive-sorttype', 'time'),
            this.flightSearchSubjoin.setAttr('arrive-orderby', 'asc');
        },
        switchsubListAction: function (e) {

            var cur = $(e.currentTarget),
                parent = cur.parent(),
                sublist = parent.next('.js_sublist');
            try {
                mdBackStore.addOpValue('MoreClassSequence', parent.data('key')); //埋点MoreClassSequence
            } catch (e) {
                console.log('埋点', 'switchsubListAction()');
            }
            if (sublist.css('display') == 'none') {
                sublist.show();
                cur.removeClass('flight-packdown').addClass('flight-packup');
            } else {
                sublist.hide();
                cur.removeClass('flight-packup').addClass('flight-packdown');
            }

        },
        switchDate: function (e) {
            //如果为低价日历,弹出日历
            var that = this;
           
            if ($(e.currentTarget)[0].className == 'cheap-calendar' || $(e.currentTarget)[0].className == 'today t2') {
                //防止连续点击
                if (!this.isShowData) {
                    return;
                } else {
                    this.isShowData = false;
                }

                if (lowestPriceJson.prices && lowestPriceJson.prices.length > 0) {
                    require(['cHolidayPriceCalendar'], function (HolidayPriceCalendar) {

                        //模拟90天低价返回的数据
                        var onwardTime = that.flightSelectedStore.getAttr('depart')['flight']['aTime'].replace(/-/g, '/');
                        onwardTime = new cBase.Date(onwardTime).addDay(1);
                        var departTime = cBase.Date.format(onwardTime, 'Y/m/d');

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

                        var calFirst = new HolidayPriceCalendar({
                            header: {
                                title: '<span class="jPriceTitle">低价日历</span><span class="jPriceCity">' + acity + '-' + dcity + '</span>',
                                tel: '4000086666',
                                home: true,
                                homeHandler: function () {
                                    //                            $('#js_home').click();
                                    //返回H5首页
                                    var salesInfo = salesStore.get();

                                    if (salesInfo && salesInfo.sid && +salesInfo.sid == 1896) {
                                        window.location = "map://leftClick()";
                                    } else if (flightCCBStore.getAttr("isCCB")) {
                                        this.jump('/webapp/mkt/ccb/');
                                    } else {
                                        that.jump('/html5/', true);
                                    }
                                }
                            },
                            startPriceTime: new Date(departTime),
                            monthsNum: 12,
                            voidInvalid: false,//默认空的为无效
                            format: 'Y-m-d',
                            priceDate: validDates,
                            callback: function (date, dateStyle, target) {
                                //要查询90天的数据
                                var d = c.utility.Date.format(date, 'Y/m/d');
                                that.lowestPriceClick(d);
                                this.hide();
                                $('body').data('cui-date', dateStyle.value);
                                this.$el.find('.cui_cld_daycrt').removeClass('cui_cld_daycrt');
                                target.addClass('cui_cld_daycrt');

                                flagHightLight = 0;
                            },
                            onShow: function () {
                                var current = $('body').data('cui-date');
                                that.isShowData = false;
                                if (current) {
                                    this.$el.find('[data-date="' + current + '"]').addClass('cui_cld_daycrt');
                                }
                                setTimeout(function () {
                                    that.__hide();
                                }, 500);
                                $(".cui_cldweek").css("top", "43px");
                                this.findMinPrice();

                                this.$el.find('.cui_cld_daycrt').removeClass('cui_cld_daycrt');
                                try {
                                    var onwardTime = that.flightSearchStore.getAttr('_items')[1]['date'];
                                    var departTime = cBase.Date.format(onwardTime, 'Y-m-d');
                                    this.$el.find('[data-date="' + departTime + '"]').addClass('cui_cld_daycrt');
                                    flagHightLight = 0;
                                } catch (err) {

                                }
                               this.$el[0].offsetHeight;  //读取header的高度，强制回流
                            },
                            onHide: function () {
                                that.__show();
                                this.remove();
                                that.isShowData = true;
                            }
                        });
                        mdBackStore.setAttr('DateQuery', 'PriceCalendar'); //埋点DateQuery
                        calFirst.show();
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
                mdBackStore.setAttr('DateQuery', dq);   //埋点DateQuery
            } catch (e) {
                console.log('埋点', 'switchDate()');
            }
            if (date && (date = cBase.Date.parse(date, true)) <= enddate) {
                //                this.clearCurFilter();
                this.flightSearchStore.setSearchDetails(1, 'date', cBase.Date.format(date, 'Y/m/d'));
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
                this.flightSearchStore.setSearchDetails(1, 'date', cBase.Date.format(date, 'Y/m/d'));
                try {
                    mdStore.setAttr('DTime', cBase.Date.format(date, 'Y/m/d'));  //埋点DTime
                    this.mdSubmit();
                } catch (e) {
                    console.log('埋点', 'lowestPriceClick()');
                }
                this.flightSearchStore.setCurSearchDetails([0]);
                this.updateTopDatePanel(date);
                //this.showLoading();
                myload.show();
                this.reloadData(function () {
                    // this.hideLoading();
                    myload.hide();
                });
            }
        },
        buildEvent: function () { },
        disposeData: function (sdata) {
            var data = sdata.slice(0);
            //筛选逻辑
            var ftype = this.flightSearchSubjoin.getAttr('arrivefilter-type'),
                fvalue = this.flightSearchSubjoin.getAttr('arrivefilter-value'),
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
                            }   else {
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
            var sorttype = this.flightSearchSubjoin.getAttr('arrive-sorttype'),
                orderby = this.flightSearchSubjoin.getAttr('arrive-orderby');
            this.els.eltabby.removeClass('hover');
            switch (true) {
                case (sorttype === 'time' && orderby === 'asc'):
                    data.sort(this.sortHandler.time_Asc);
                    this.els.eltabtime.addClass('hover');
                    //                    this.els.eltabtime.find('em').html('↑');
                    this.els.eltabtime.find('em').removeClass('flight-icon-pxd');
                    this.els.eltabtime.find('em').addClass('flight-icon-pxu');
                    break;
                case (sorttype === 'time' && orderby === 'desc'):
                    data.sort(this.sortHandler.time_Desc);
                    this.els.eltabtime.addClass('hover');
                    //                    this.els.eltabtime.find('em').html('↓');
                    this.els.eltabtime.find('em').removeClass('flight-icon-pxu');
                    this.els.eltabtime.find('em').addClass('flight-icon-pxd');
                    break;
                case (sorttype === 'price' && orderby === 'asc'):
                    data.sort(this.sortHandler.price_Asc);
                    this.els.eltabprice.addClass('hover');
                    //                    this.els.eltabprice.find('em').html('↑');
                    this.els.eltabprice.find('em').removeClass('flight-icon-pxd');
                    this.els.eltabprice.find('em').addClass('flight-icon-pxu');
                    break;
                case (sorttype === 'price' && orderby === 'desc'):
                    data.sort(this.sortHandler.price_Desc);
                    this.els.eltabprice.addClass('hover');
                    //                    this.els.eltabprice.find('em').html('↓');
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
                mdBackStore.setAttr('DCity', dcity); //埋点DCity
                mdBackStore.setAttr('ACity', acity); //埋点ACity
                mdBackStore.setAttr('FlightType', tabType === 1 ? 'OW' : 'RT'); //埋点FlightType
                mdBackStore.setAttr('DTime', datestr); //埋点DTime
                mdBackStore.setAttr('ATime', adatestr ? adatestr : ''); //埋点ATime
            } catch (e) {
                console.log('埋点', 'renderList()');
            }
            //埋点--end--
            this.datalist = this.disposeData(this.sdatalist.slice(0));

            var filterClass = this.flightSearchSubjoin.getAttr('arrivefilter-type-cabin');
            //小米黄页合作，隐藏返现
            var _sales = salesStore.get();
            //----------------过滤舱位--------------//

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
                            if (cldp == 6) {//经济舱 比较特殊 当 classForDisp = 6 或者 class !=2 or class !=3
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
            //----------------过滤舱位---------------//
            var viewdata = {
                list: this.datalist,
                cDate: c.base.Date,
                bd: this.basedata,
                _sales: _sales,
                filterClass: filterClass,
                _viewBuildSeatTitlt: this._viewBuildSeatTitlt,
                _viewfilterfirst: this._viewfilterfirst
            };
            var html = this.flightListTplFun(viewdata);
            this.els.elf_list.html(html);

            // this.afterReFilter();

            var datalen = 0;
            for (var i = 0; i < this.datalist.length; i++) {
                if (this.datalist[i]["flightNo"] != null) {
                    datalen++;
                }
            }
            this.els.elflightTotal.html(datalen);

            //this.bindMoveEvent();
        },
        afterReFilter: function () {
            /*
            var fcabin = this.flightSearchSubjoin.getAttr('arrivefilter-type-cabin');
            if (fcabin) {
                var l = this.els.elf_list.find('.f_detail');
                l.each(function (k, v) {
                    var ul = $(v);
                    if (!ul.find('li[data-class=c' + fcabin + ']').length) {
                        ul.prev('ul.f_list_tab').hide();
                        ul.hide();
                    } else {
                        ul.find('li[data-class]').hide();
                        ul.find('li[data-class=c' + fcabin + ']').show();
                    }
                });
            }
            */
        },
        updatePageDate: function () {
            var ddatestr = this.flightSearchStore.getSearchDetails(0, 'date'),
                adatestr = this.flightSearchStore.getSearchDetails(1, 'date'),
                dcity = this.flightSearchStore.getSearchDetails(1, 'dcityName'),
                acity = this.flightSearchStore.getSearchDetails(1, 'acityName'),
                tabType = this.flightSearchStore.getAttr('tabtype') || 1,
                sorttype = this.flightSearchSubjoin.getAttr('depart-sorttype'),
                orderby = this.flightSearchSubjoin.getAttr('depart-orderby'),
                ddate = cBase.Date.parse(ddatestr, true),
                adate = cBase.Date.parse(adatestr, true);
            if (ddate >= adate) {
                adate = new cBase.Date(ddate);
                this.flightSearchStore.setSearchDetails(1, 'date', adate.format('Y-m-d'));
                adate = adate.valueOf();
            }
            this.els.eltitle.html('返程: ' + dcity + '-' + acity + '');
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
            //            this.updateTopDatePanel(adate);
        },
        updateTopDatePanel: function (curDate) {
            curDate.setHours(0, 0, 0, 0);
            var t1 = new cBase.Date(curDate).addDay(-1),
                t2 = new cBase.Date(curDate),
                t3 = new cBase.Date(curDate).addDay(1),
                cur = (new cBase.Date(this.getServerDate())).setHours(0, 0, 0, 0).valueOf();
            var enddate = this.flightSearchStore.getAttr('calendarendtime');
            enddate = cBase.Date.parse(enddate, true);
            var ddatestr = this.flightSearchStore.getSearchDetails(0, 'date');
            var ddate = cBase.Date.parse(ddatestr, true);
            if (t1.valueOf() >= cur && t1.valueOf() >= ddate) {
                this.$el.find('.yesterday').removeClass('flight-listdate-disable');

                this.els.elt1.attr('data-date', t1.format('Y/m/d'));

                lowestPriceDay[t1.format('Y/m/d')] ? this.$el.find('.t1 .price').html('<dfn>&yen;</dfn>' + lowestPriceDay[t1.format('Y/m/d')]) : this.$el.find('.t1 .price').html('');


            } else {
                this.$el.find('.yesterday').addClass('flight-listdate-disable');
                this.$el.find('.t1 .price').html('');
                this.els.elt1.attr('data-date', '');
            }

            if (t2.valueOf() >= cur) {

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
            this.els.elf_list.empty();
            this.flightSearchStore.setCurSearchDetails([0, 1]);

            this.els.elflightTotal.html(0);
            this.flightList.excute(function (data) {
                if (!data.count) {
                    this.els.elf_list.html(this.els.elemptylisttpl.html());
                    this.isEmpty = true;
                } else {
                    this.sdatalist = data.items;
                    this.datalist = this.sdatalist.sort(this.sortHandler.price_Asc);

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
                if (e && e.msg) {
                    this.showToast(e.msg);
                }
                callback.call(this);
            }, this.flightSearchStore.getAttr('fullCabin'), this);
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
            //小米黄页合作，隐藏要求的功能
            var _sales = salesStore.get();
            if ((sourceid && (+sourceid == 1575 || +sourceid.sid == 1867)) || (_sales && _sales.sid && (+_sales.sid == 1575 || +_sales.sid == 1867))) {
                this.$el.find('#js_home').hide();
                this.$el.find('#footer').hide();
                if (this.footer)
                    this.footer.hide();
                this.hasAd = false;
            }
            this.updatePageDate();
            this.reloadData(callback);
        },
        lowestPriceList: function () {
            //模拟90天低价返回的数据
            var that = this;
            lowestPriceJson.head = { "auth": null, "errcode": 0 };
            var tempPrice = new Array();
            this.$el.find('.t2 .price').html('');
            var data = {};
            this.lowestPrice.excute(function (pricedata) {
                data = pricedata;
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
            var adatestr = that.flightSearchStore.getSearchDetails(1, 'date'), adate = cBase.Date.parse(adatestr, true);
            date = cBase.Date.format(adatestr, 'Y/m/d H:i:s');
            date = new Date(date);
            that.updateTopDatePanel(date);
        },
        //首次记载view，创建view
        onCreate: function () {
            console.log("backlist onCreate");
            var filterClass = this.flightSearchSubjoin.getAttr('departfilter-type-cabin');
            //页面需要的静态资源
            this.baseDataModel = new cMultipleDate({
                models: {
                    'FlightAirline': FlightModel.FlightAirlineModel.getInstance(),
                    'FlightCityList': FlightModel.FlightCityListModel.getInstance(),
                    'FlightAircraft': FlightModel.FlightAircraftModel.getInstance()
                }
            });

            //-------------新背景色---------------//
            this.$el.css({ "background": "#fff" });
            //-------------新背景色---------------//

            this.render();
            this.buildEvent();
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
            console.log("backlist onload");
            var self = this;

            self.turning();


            //查询90天低价日历
            var airItems = this.flightSearchStore.getAttr('items')[0];

            this.lowestPriceStore.setAttr('aCty', airItems['dCtyCode']);
            this.lowestPriceStore.setAttr('dCty', airItems['aCtyCode']);
            this.lowestPriceList();

            this.refer = refer || "";

            //如果是填写页，则不刷新页面，跳转原来的位置
            if ((this.refer === 'bookinginfo') && this.isRedirect && this.flightListStore.get() && !this.flightSearchStore.getAttr('fullCabin')) {
                this.turning();

            } else {
                this.isRedirect = false;
                this.flightSearchStore.setAttr('__tripType', 2);
                // this.showLoading();
                myload.show();
                //加载基础数据
                this.baseDataModel.excute(function (data) {
                    this.basedata = data;
                    //更新页面
                    this.updatePage(function () {
                        // this.turning();
                        // this.hideLoading();
                        myload.hide();
                    });
                }, function (e) {
                    this.showToast('数据请求失败', 2, $.proxy(function () {
                        this.back('index');
                    }, this));
                    //this.hideLoading();
                    myload.hide();
                }, false, this);
            }

            //更新电话号码
            this.getSalesObj();


        },
        //调用turning方法时触发
        onShow: function () {
            console.log("backlist onShow");
            //埋点--start--
            var datestr = this.flightSearchStore.getSearchDetails(0, 'date'),
                adatestr = this.flightSearchStore.getSearchDetails(1, 'date'),
                dcity = this.flightSearchStore.getSearchDetails(0, 'dcityName'),
                acity = this.flightSearchStore.getSearchDetails(0, 'acityName'),
                tabType = this.flightSearchStore.getAttr('tabtype') || 1;
            try {
                mdBackStore.setAttr('DCity', dcity); //埋点DCity
                mdBackStore.setAttr('ACity', acity); //埋点ACity
                mdBackStore.setAttr('FlightType', tabType === 1 ? 'OW' : 'RT'); //埋点FlightType
                mdBackStore.setAttr('DTime', datestr); //埋点DTime
                mdBackStore.setAttr('ATime', adatestr ? adatestr : ''); //埋点ATime
            } catch (e) {
                console.log('埋点', 'onShow()');
            }
            //埋点--end--
            this.setTitle('机票列表页');
            if (this.refer === 'bookinginfo' && this.isRedirect) {
                this.restoreScrollPos();
            }
        },

        onHide: function (toViewName) {
            console.log("backlist onHide " + toViewName);
            if (toViewName === 'list' || toViewName === '') {
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
                title = '<i class="clr-ff9a14">高端' + s + '</i>';
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
                            c["ckey"] = 0;
                        }
                    }
                }
                return c;  
            }
        },
        __assert: function () {
            var dcity = this.flightSearchStore.getSearchDetails(1, 'dcityName'),
                acity = this.flightSearchStore.getSearchDetails(1, 'acityName');
            if (!dcity || !acity) {
                this.back('list');
                return false;
            }
            return true;
        },
        /**
         * 发送埋点信息，删除mdBackStore
         */
        mdSubmit: function () {
            var fns = mdBackStore.getAttr('FlightNoSequence'),
                scs = mdBackStore.getAttr('SubClassSequence'),
                at = mdBackStore.getAttr('ActiveType');
            mdTransStore.setAttr('aObj', {
                fns: fns,
                scs: scs,
                at: at
            });
            Futility.sendUbt(UBTKey, mdBackStore.get());
            mdBackStore.remove();
        }
    });
    return View;
});
