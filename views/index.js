define(['libs', 'c', 'CommonStore', 'FlightStore', 'flight/utility/utility', 'FlightModel', 'cMultipleDate', buildViewTemplatesPath('index.html'), 'cWidgetFactory', 'cWidgetCalendar', 'lowpricecalendar'], function (libs, c, CommonStore, FlightStore, Futility, FlightModels, cMultipleDate, html, WidgetFactory, cWidgetCalendar, lowpricecalendar) {
    /* 统计埋点开始 */
    try {
        window['h5.flt.homepage.speed'] = window['h5.flt.homepage.speed'] || {};
        window['h5.flt.homepage.speed'].begin = Date.now();
    } catch (e) {

    }
    /* 统计埋点结束 */
    var UBTKey = "h5.flt.homepage";
    var cui = c.ui,
        cBase = c.base,
        salesStore = CommonStore.SalesObjectStore.getInstance(),
        mdStore = FlightStore.MdIndexStore.getInstance();

    var Calendar = WidgetFactory.create('Calendar');

    var Mask = new c.base.Class(c.ui.Layer, {
        __propertys__: function () {
            var self = this;
            this.contentDom;
            this.mask = new c.ui.Mask();
            this.mask.addEvent('onShow', function () {
                $(window).bind('resize', this.onResize);
                this.onResize();
                var scope = this;
                this.root.bind('click', function () {
                    scope.hide();
                    scope.root.unbind('click');
                    self.hide();
                });

            });
        },
        initialize: function ($super, opts) {

            $super({
                onCreate: function () { },
                onShow: function () {
                    for (var k in opts) this[k] = opts[k];
                    this.mask.show();
                    this.setzIndexTop();
                    if (typeof this.html == 'string') this.html = $(this.html);
                    this.contentDom.html(this.html);
                    if (this.closeDom) {
                        this.contentDom.find(this.closeDom).on('click', function () {
                            mask && mask.hide();
                        });
                    }
                    //阻止调用定时器反复渲染
                    window.clearInterval(this.setIntervalResource)

                    var ROOT = $("body"),
                      maxWidth = ROOT.width() / 2,
                      maxHeight = ROOT.height() / 2.5;

                    //重新计算位置
                    this.root.css({ "margin-left": -maxWidth, "margin-top": -maxHeight });
                },
                onHide: function () {
                    this.mask && this.mask.hide();
                }
            });

        }
    });
    var mask = null;
    var flightCCBStore = FlightStore.FlightCCBStore.getInstance();

    var View = c.view.extend({
        pageid: '212003',
        tpl: html,
        hasAd: true,
        adContainer: 'in_footer',
        flightStore: FlightStore.FlightSearchStore.getInstance(),
        flightAdStore: FlightStore.FlightAdTimeOutStore.getInstance(),
        flightCityListStore: FlightStore.FlightCityListStore.getInstance(), //国内机场城市
        flightInterCityListStore: FlightStore.FlightInterCityListStore.getInstance(), //国际机场城市
        flightDeliveryStore: FlightStore.FlightPickTicketSelectStore.getInstance(), //航班订单配送信息Storage
        flightSearchSubjoin: FlightStore.FlightSearchSubjoinStore.getInstance(),
        flightFilterStore: FlightStore.FlightFilterStore.getInstance(),
        lowestPriceSearchStore: FlightStore.LowestPriceSearchStore.getInstance(),
        calendar: null,
        getAppUrl: function () {
            console.log("index  getAppUrl start!!");


            var sourceid = "";
            if (window.localStorage && window.localStorage.getItem('SALES') != null && window.localStorage.getItem('SALES') != "") {
                var SALES = JSON.parse(window.localStorage.getItem('SALES'));
                if (SALES["data"] != null) {
                    sourceid = SALES["data"]["sourceid"];
                }

            }
            var datestr = (this.flightStore.getSearchDetails(0, 'date')).replace(/\//g, "");
            var dcity = this.flightStore.getSearchDetails(0, 'dkey');
            var acity = this.flightStore.getSearchDetails(0, 'akey');
            var tabType = this.flightStore.getAttr('tabtype') || 1;

            var appUrl = "";
            if (tabType == 1) {
                appUrl =
             "/flight_inquire?" +
             "c1=" + tabType + //单程还是往返（必需）
             "&c2=" + dcity + //出发城市id（必需）
             "&c3=" + acity + //到达城市id（必需）
             "&c4=" + datestr + //出发时间（yyyymmdd）（必需）
            "&extendSourceID=" + sourceid;
            } else {
                var adatestr = (this.flightStore.getSearchDetails(1, 'date')).replace(/\//g, "")
                appUrl =
             "/flight_inquire?" +
             "c1=" + tabType + //单程还是往返（必需）
             "&c2=" + dcity + //出发城市id（必需）
             "&c3=" + acity + //到达城市id（必需）
             "&c4=" + datestr + //出发时间（yyyymmdd）（必需）
             "&c5=" + adatestr + //返程出发时间（yyyymmdd）（单程不传，返程必需）
            "&extendSourceID=" + sourceid;
                "&c5=" + adatestr + //返程出发时间（yyyymmdd）（单程不传，返程必需） 
            "&extendSourceID=" + sourceid;
            }
            console.log("index  getAppUrl end!!" + appUrl);
            return appUrl;
        },
        getQueryStringByName: function (name) {//获取
            var result = location.search.match(new RegExp("[\?\&]" + name + "=([^\&]+)", "i"));
            if (result == null || result.length < 1) {
                return "";
            }
            return result[1];
        },
        curTab: 1,
        showTopPanel: true,
        lockKey: true,  		//出发到达互换的程序锁
        render: function () {
            this.viewdata.req = this.request;
            this.$el.html(this.tpl);
            this.els = {
                elcitytabItems: this.$el.find('.city_tab li'),
                elpanelbox: this.$el.find('#panel-box'),
                elcitysel: this.$el.find('#citysel'),
                eldepartDatetop: this.$el.find('#js_departDate em'),
                eldepartDatebottom: this.$el.find('#js_departDate b'),
                elbackDatetop: this.$el.find('#js_backDate em'),
                elbackDatebottom: this.$el.find('#js_backDate b'),
                eldepartcity_w: this.$el.find('#js_departcity_w'),
                elbackcity_w: this.$el.find('#js_backcity_w'),
                elheader: this.$el.find('header'),
                elflightroot: this.$el.find('.flightroot')
            };
        },
        events: {
            'click #js_return': 'backAction',
            'click .city_tab li': 'switchtabAction',
            'click #js_departDate': 'departDateAction',
            'click #js_backDate': 'backDateAction',
            'click #js_departcity_w span': 'selectDepartCityAction',
            'click #js_backcity_w span': 'selectBackCityAction',
            'click #searchlistsubmit': 'searchflightAction',
            'click #js_exchange_btn': 'exchangeAction',
            'click .passenger': 'selectPassenger',
            'click .flight-img-svc': 'promiseAction',
            'click #checkin': 'checkin',
            'click #flightSchedule': 'flightSchedule'
        },
        //重新查询清除筛选store
        clearCurFilter: function () {

            this.flightFilterStore.remove();
            this.flightSearchSubjoin.remove();

        },

        /*清除国际的排序和查询条件 add by kwzheng 2014-4-40 v2.4.1*/
        clearIntlFilter: function () {
            this.flightSearchSubjoin.removeAttr('departfilter-type');
            this.flightSearchSubjoin.removeAttr('departfilter-value');
            this.flightSearchSubjoin.removeAttr('departfilter-type-cabin');
            this.flightFilterStore.removeAttr('departfilter-type');
            this.flightFilterStore.removeAttr('departfilter-value');
            this.flightSearchSubjoin.removeAttr('departfilter-type');
            this.flightSearchSubjoin.removeAttr('departfilter-value');
            this.flightSearchSubjoin.removeAttr('departfilter-type-cabin');
            this.flightFilterStore.removeAttr('departfilter-type');
            this.flightFilterStore.removeAttr('departfilter-value');
        },
        closeAdPanelAction: function () {
            this.flightAdStore.setAttr('top', false);
            this.closeTopPanel();
            this.els.eltoppanel.css('display', 'none');
        },
        backAction: function () {
            mdStore.setAttr('IsReturn', true);//埋点IsReturn
            // this.flightDeliveryStore.remove(); //清除配送方式 add caof 20130917
            var salesInfo = salesStore.get();
            //发送埋点信息，删除mdStore
            try {
                this.mdSubmit();
            } catch (e) {
                console.log('埋点提交', 'backAction()');
            }


            if (salesInfo && salesInfo.sid && +salesInfo.sid == 1896) {
                window.location = "map://leftClick()";
            } else if (flightCCBStore.getAttr("isCCB")) {
                this.jump('/webapp/mkt/ccb/');
            } else {
                this.jump('/html5/', true);
            }
        },
        exchangeAction: function () {
            mdStore.increaseCntByKey('ChangeCityClick');//埋点ChangeCityClick
            var dc = mdStore.getAttr('DCity'),
                ac = mdStore.getAttr('ACity');
            mdStore.setAttr('DCity', ac);    //埋点DCity
            mdStore.setAttr('ACity', dc);    //埋点ACity

            var $departcity_w = this.$el.find("#js_departcity_w"),
                $departcity = this.$el.find("#js_departcity_w span"),
                $backcity_w = this.$el.find("#js_backcity_w"),
                $backcity = this.$el.find("#js_backcity_w span"),
                temp_dCtyCode,
                temp_dCtyId,
                temp_dcityName,
                temp_dkey,
                temp_aCtyCode,
                temp_aCtyId,
                temp_acityName,
                temp_akey,
                temp_amode,
                temp_dmode,
                $new_departcity = $departcity.clone().removeClass(),
                $departcity_t = '<em>' + $departcity.text() + '</em>',  //文字过长省略号
                $new_backcity = $backcity.clone().removeClass(),
                $backcity_t = '<em>' + $backcity.text() + '</em>',      //文字过长省略号
                _this = this;

            if (this.lockKey) {
                this.lockKey = false;
                /*  var $departcity_em = this.$el.find("#js_departcity_w em"),
                      $backcity_em = this.$el.find("#js_backcity_w em");*/
                $departcity.addClass("switch_right")
                $backcity.addClass("switch_left")


                setTimeout(function () {
                    if ($departcity.hasClass("switch_right")) {
                        $departcity_w.html($new_departcity.html($backcity_t))
                        $backcity_w.html($new_backcity.html($departcity_t))
                    }
                    _this.lockKey = true;
                }, 500)
            }
            temp_dCtyCode = this.flightStore.getSearchDetails(0, "dCtyCode");
            temp_dCtyId = this.flightStore.getSearchDetails(0, "dCtyId")
            temp_dcityName = this.flightStore.getSearchDetails(0, "dcityName");
            temp_dkey = this.flightStore.getSearchDetails(0, "dkey");
            temp_aCtyCode = this.flightStore.getSearchDetails(0, "aCtyCode");
            temp_aCtyId = this.flightStore.getSearchDetails(0, "aCtyId");
            temp_acityName = this.flightStore.getSearchDetails(0, "acityName");
            temp_akey = this.flightStore.getSearchDetails(0, "akey");
            //fix点击查询页切换城市按钮的时候amode和dmode也需要互换
            temp_amode = this.flightStore.getAttr("amode");
            temp_dmode = this.flightStore.getAttr("dmode");

            this.flightStore.setSearchDetails(0, 'dCtyCode', temp_aCtyCode);
            this.flightStore.setSearchDetails(0, 'dCtyId', temp_aCtyId);
            this.flightStore.setSearchDetails(0, 'dcityName', temp_acityName);
            this.flightStore.setSearchDetails(0, 'dkey', temp_akey);
            this.flightStore.setSearchDetails(0, 'aCtyCode', temp_dCtyCode);
            this.flightStore.setSearchDetails(0, 'aCtyId', temp_dCtyId);
            this.flightStore.setSearchDetails(0, 'acityName', temp_dcityName);
            this.flightStore.setSearchDetails(0, 'akey', temp_dkey);

            this.flightStore.setSearchDetails(1, 'dCtyCode', temp_dCtyCode);
            this.flightStore.setSearchDetails(1, 'dCtyId', temp_dCtyId);
            this.flightStore.setSearchDetails(1, 'dcityName', temp_dcityName);
            this.flightStore.setSearchDetails(1, 'dkey', temp_dkey);
            this.flightStore.setSearchDetails(1, 'aCtyCode', temp_aCtyCode);
            this.flightStore.setSearchDetails(1, 'aCtyId', temp_aCtyId);
            this.flightStore.setSearchDetails(1, 'acityName', temp_acityName);
            this.flightStore.setSearchDetails(1, 'akey', temp_akey);
            this.flightStore.setAttr('amode', temp_dmode);
            this.flightStore.setAttr('dmode', temp_amode);


        },
        searchflightAction: function () {
            mdStore.setAttr('IsQuery', true); //埋点IsQuery
            // this.flightDeliveryStore.remove(); //清除配送方式 add caof 20130917
            var dcityName = this.flightStore.getSearchDetails(0, 'dCtyCode'),
                acityName = this.flightStore.getSearchDetails(0, 'aCtyCode'),
                tabtype = this.flightStore.getAttr('tabtype'),
                amode = this.flightStore.getAttr('amode'),
                dmode = this.flightStore.getAttr('dmode'),
                submittime = (cBase.getServerDate()).getTime();
            if (dcityName === acityName) {
                this.showToast('出发城市和到达城市相同，请重新选择');
                return;
            }
            if (this.curTab == 2) {
                var acode = this.flightStore.getSearchDetails(0, 'aCtyCode'),
                    aname = this.flightStore.getSearchDetails(0, 'acityName'),
                    akey = this.flightStore.getSearchDetails(0, 'akey'),
                    dcode = this.flightStore.getSearchDetails(0, 'dCtyCode'),
                    dname = this.flightStore.getSearchDetails(0, 'dcityName'),
                    dkey = this.flightStore.getSearchDetails(0, 'dkey'),
                    dCtyId = parseInt(this.flightStore.getSearchDetails(0, 'dCtyId') || 0),
                    aCtyId = parseInt(this.flightStore.getSearchDetails(0, 'aCtyId') || 0),
                    dDportCode = this.flightStore.getSearchDetails(0, 'dDportCode') || '',
                    aAportCode = this.flightStore.getSearchDetails(0, 'aAportCode') || '';

                this.flightStore.setSearchDetails(1, 'aCtyCode', dcode);
                this.flightStore.setSearchDetails(1, 'acityName', dname);
                this.flightStore.setSearchDetails(1, 'akey', dkey);
                this.flightStore.setSearchDetails(1, 'dCtyCode', acode);
                this.flightStore.setSearchDetails(1, 'dcityName', aname);
                this.flightStore.setSearchDetails(1, 'dkey', akey);
                this.flightStore.setSearchDetails(1, 'dCtyId', aCtyId);
                this.flightStore.setSearchDetails(1, 'aCtyId', dCtyId);
                this.flightStore.setSearchDetails(1, 'dDportCode', aAportCode);
                this.flightStore.setSearchDetails(1, 'aAportCode', dDportCode);
            } else {
                this.flightStore.removeSearchDetails(1);
            }
            this.flightStore.setAttr('submittime', submittime);
            this.flightStore.setCurSearchDetails([0]);
            this.flightStore.setAttr('ticketIssueCty', dcityName);
            //this.forward('list');
            //这个值为真时跳国际机票
            var tofltintl = !!this.flightStore.getAttr('tofltintl');
            this.clearCurFilter();
            this.clearIntlFilter();
            //发送埋点信息，删除mdStore
            try {
                this.mdSubmit();
            } catch (e) {
                console.log('埋点提交', 'searchflightAction()');
            }
            //
            if (amode == 2 || dmode == 2 || tofltintl) {
                this.flightStore.saveToFltintlSearch();
                this.jump('/webapp/fltintl/#flightlist?v=' + new Date().getTime());
            } else {
                this.flightStore.setAttr('passengerType', 1); // 国内在2.4.3版本中无儿童票，只有成人票种
                this.lowestPriceSearchStore.setAttr('aCty', acityName);
                this.lowestPriceSearchStore.setAttr('dCty', dcityName);
                this.forward('list?v=' + new Date().getTime());
            }
        },
        selectDepartCityAction: function () {
            this.checkUcStore();
            //this.showLoading();
            this.forward('citylist/!depart');
        },
        selectBackCityAction: function () {
            this.checkUcStore();
            // this.showLoading();
            this.forward('citylist/!back');
        },
        switchtabAction: function (e) {
            var curEl = $(e.currentTarget),
                key = curEl.data('type') == 1 ? 'OWClick' : 'RTClick',
                fltType = curEl.data('type') == 1 ? 'OW' : 'RT';
            mdStore.increaseCntByKey(key); //埋点OWClick  RTClick
            mdStore.setAttr('FlightType', fltType); //埋点FlightType
            if (curEl.data('type') == 1) {
                mdStore.setAttr('ATime', '');   //埋点ATime
            }

            this.switchTab(curEl.data('type'));
        },
        departDateAction: function () {
            //防止连续点击
            if (!this.isShowData) {
                return;
            }
            this.isShowData = false;//标示已点击过
            lowpricecalendar.CreateCalendar(this, this.setPanelDate, 'start');
            this.checkUcStore();
        },
        backDateAction: function () {
            //防止连续点击
            if (!this.isShowData) {
                return;
            }
            this.isShowData = false;//标示已点击过
            lowpricecalendar.CreateCalendar(this, this.setPanelDate, 'back');
            this.checkUcStore();
        },
        promiseAction: function () {
            mdStore.setAttr('IsService', true);  //埋点IsService
            var html = [
                    '<div class="flight-windows-svc">' +
                        '<img src="http://pic.c-ctrip.com/h5/flight/tc-fwcn.png" width="100%">' +
                     '</div>'
            ].join(''),
                html = $(html);

            if (!mask) {
                mask = new Mask({
                    html: html, // 弹窗html
                    closeDom: '.flight-windows-svc' // 弹窗关闭按钮
                });
            }
            mask.show();
        },

        switchTab: function (cur) {
            this.flightStore.setAttr('tabtype', cur);
            this.els.elcitytabItems.removeClass('cityTabCrt');
            this.els.elcitytabItems.filter("[data-type='" + cur + "']").addClass('cityTabCrt');
            var self = this;
            switch (cur) {
                case 1:

                    this.els.elpanelbox.removeClass('backtrack');
                    //this.calendar.removeDate(['back']);
                    var dTime = this.flightStore.getSearchDetails(0, 'date');
                    if (!dTime) {
                        dTime = new cBase.Date(this.getServerDate()).addDay(1).valueOf();
                    } else {
                        dTime = cBase.Date.parse(dTime).valueOf();
                    }

                    //this.calendar.setDate({
                    //    start: dTime
                    //});
                    this.setPanelDate(null, null, { start: dTime });
                    this.flightStore.setAttr('tripType', 1);
                    break;
                case 2:

                    var dTime = this.flightStore.getSearchDetails(0, 'date'), eTime = this.flightStore.getSearchDetails(1, 'date');
                    var endtime = new cBase.Date(cBase.Date.format(this.getServerDate(), 'Y-m-d')).addDay(364).valueOf()

                    if (!dTime) {
                        dTime = new cBase.Date(this.getServerDate()).addDay(1).valueOf();
                    } else {
                        dTime = cBase.Date.parse(dTime).valueOf();
                    }
                    if (!eTime) {
                        eTime = new cBase.Date(dTime.valueOf()).addDay(1).valueOf();
                    } else {
                        eTime = cBase.Date.parse(eTime).valueOf();
                        if (dTime > eTime) {
                            if (dTime >= endtime) {
                                eTime = new Date(dTime.valueOf());
                            } else {
                                eTime = (new cBase.Date(dTime)).addDay(1).valueOf();
                            }
                        }
                        this.flightStore.setSearchDetails(1, 'date', cBase.Date.format(eTime, 'Y/m/d H:i:s'))
                    }
                    this.flightStore.setAttr('tripType', 2);
                    dTime.setHours(0, 0, 0, 0);
                    eTime.setHours(0, 0, 0, 0);
                    if (dTime > eTime) {
                        eTime = (new cBase.Date(dTime)).addDay(1).valueOf();
                    }
                    //日期有效的最后一天
                    //当最终时间超过最后一天时，设置为最后一天

                    if (dTime > endtime) {
                        dTime = new Date(endtime.valueOf());
                    }
                    if (eTime >= endtime) {
                        eTime = new Date(endtime.valueOf());
                    }
                    this.flightStore.setSearchDetails(0, 'date', cBase.Date.format(dTime, 'Y/m/d H:i:s')),
                        this.flightStore.setSearchDetails(1, 'date', cBase.Date.format(eTime, 'Y/m/d H:i:s'));
                    this.els.elpanelbox.addClass('backtrack');
                    this.setPanelDate(null, null, { start: dTime, back: eTime });
                    break;
            }
            this.curTab = cur;
        },
        renderPage: function (cur, dcity, acity, ctys1, ctys2) {
            var self = this;
            var isIntFlag = false;
            mdStore.setAttr('DCity', dcity); //埋点DCity
            mdStore.setAttr('ACity', acity); //埋点ACity
            //更新页面
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
                            }
                        }
                        if (dcity && dcity != "") {
                            if (ctys1[i].code.toLowerCase() == dcity.toLowerCase() || ctys1[i].name == decodeURI(dcity) || ctys1[i].id == dcity) {
                                dCityName = ctys1[i].name;
                                dCtyCode = ctys1[i].code;
                                dCityId = ctys1[i].id;
                                self.flightStore.setAttr("dmode", "1");
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
                            }
                        }
                        if (dcity && dcity != "") {
                            if (ctys2[i].code.toLowerCase() == dcity.toLowerCase() || ctys2[i].name == decodeURI(dcity) || ctys2[i].id == dcity) {
                                dCityName = ctys2[i].name;
                                dCtyCode = ctys2[i].code;
                                dCityId = ctys2[i].id;
                                isIntFlag = true;
                                self.flightStore.setAttr("dmode", "2");
                            }
                        }
                    }
                    //                    if (isIntFlag == true) {//是国际机票
                    //                        self.flightStore.setAttr("tofltintl", "0");
                    //                    }
                }
                //--------------------------------------------------------------------------//
                if (aCityId == '' || aCityName == '') {//默认上海到北京
                    aCtyCode = self.flightStore.getSearchDetails(0, 'aCtyCode') || 'SHA';
                    aCityId = self.flightStore.getSearchDetails(0, 'akey') || 2;
                    aCityName = self.flightStore.getSearchDetails(0, 'acityName') || '上海';
                }
                if (dCityId == '' || dCityName == '') {
                    dCtyCode = self.flightStore.getSearchDetails(0, 'dCtyCode') || 'BJS';
                    dCityId = self.flightStore.getSearchDetails(0, 'dkey') || 2;
                    dCityName = self.flightStore.getSearchDetails(0, 'dcityName') || '北京';
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
                self.flightStore.setAttr('ticketIssueCty', dCityName); //出票城市
                self.flightStore.setCurSearchDetails([0]);
                //-------------------------------------------------------------------------//
                self.els.eldepartcity_w.find("em").html(dCityName);
                self.els.elbackcity_w.find("em").html(aCityName);
                //-------------------------------------------------------------------------//
                var amode = self.flightStore.getAttr('amode'),
                   dmode = self.flightStore.getAttr('dmode')
                console.log(amode + "" + dmode);
                //  tofltintl = self.flightStore.getAttr('tofltintl');

                if (amode == 2 || dmode == 2) {
                    self.$el.find('.passenger').show();
                    var passengerType = self.flightStore.getAttr('passengerType');
                    if (passengerType == 1) {
                        self.$el.find('.passengerType').html('成人');
                        self.$el.find('.tips').hide();
                    } else {
                        self.$el.find('.passengerType').html('儿童');
                        self.$el.find('.tips').show();
                    }
                } else {
                    self.$el.find('.passenger').hide();
                }
                //-------------------------------------------------------------------------//
            }
        },
        updatePage: function (callback) {
            var self = this;
            var trip = (self.getQueryStringByName('SearchType') != "" && self.getQueryStringByName('SearchType') != null) ?
            self.getQueryStringByName('SearchType') :
            (self.getQueryStringByName('flighttype') != "" && self.getQueryStringByName('flighttype') != null) ?
            self.getQueryStringByName('flighttype') :
            (self.getQueryStringByName('trip') != "" && self.getQueryStringByName('trip') != null) ?
            self.getQueryStringByName('trip') : "";
            trip = trip.toLowerCase();
            if (trip == "d") {
                trip = 2;
            } else if (trip == "s") {
                trip = 1;
            }

            var cur = self.flightStore.getAttr('tabtype') || 1;
            if (trip != "") {
                self.flightStore.setAttr('tabtype', trip);
                self.flightStore.setAttr('__tripType', trip);
                self.flightStore.setAttr('tripType', trip);
                cur = trip;
            }

            var dday = (self.getQueryStringByName('dday') != "" && self.getQueryStringByName('dday') != null) ?
                parseInt(self.getQueryStringByName('dday')) :
                (self.getQueryStringByName('dayoffset') != "" && self.getQueryStringByName('dayoffset') != null) ?
                parseInt(self.getQueryStringByName('dayoffset')) : "";
            if (isNaN(dday) == false && dday > 0) {
                var dateStr = new cBase.Date(cBase.getServerDate()).addDay(dday).format('Y/m/d');
                var dateStr2 = new cBase.Date(cBase.getServerDate()).addDay(dday + 1).format('Y/m/d');
                if (cur - 2 == 0) {
                    self.flightStore.setSearchDetails(0, 'date', dateStr); //start
                    self.flightStore.setSearchDetails(1, 'date', dateStr2); //back
                } else {
                    self.flightStore.setSearchDetails(0, 'date', dateStr);
                }
            }


            var dcity = (self.getQueryStringByName('dcity') != "" && self.getQueryStringByName('dcity') != null) ?
            self.getQueryStringByName('dcity') :
            (self.getQueryStringByName('_dcity') != "" && self.getQueryStringByName('_dcity') != null) ?
            self.getQueryStringByName('_dcity') :
            (self.getQueryStringByName('departure') != "" && self.getQueryStringByName('departure') != null) ?
            self.getQueryStringByName('departure') : "";

            var acity = (self.getQueryStringByName('acity') != "" && self.getQueryStringByName('acity') != null) ?
            self.getQueryStringByName('acity') :
            (self.getQueryStringByName('_acity') != "" && self.getQueryStringByName('_acity') != null) ?
            self.getQueryStringByName('_acity') :
            (self.getQueryStringByName('arrival') != "" && self.getQueryStringByName('arrival') != null) ?
            self.getQueryStringByName('arrival') : "";


            if (dcity != "" || acity != "") {

                var cityFlight = null;
                var cityIntlFlt = null;
                if (self.flightCityListStore.get() != null && self.flightInterCityListStore.get() != null) {
                    cityFlight = self.flightCityListStore.get();
                    cityIntlFlt = self.flightInterCityListStore.get();
                    self.renderPage(cur, dcity, acity, cityFlight.cities, cityIntlFlt.cities);
                } else {
                    self.showLoading();
                    //加载基础数据
                    self.baseDataModel.excute(function (data) {
                        self.hideLoading();
                        self.renderPage(cur, dcity, acity, data.flightCityList.cities, data.flightInterCityList.cities);
                    }, function (e) {
                        self.hideLoading();
                    }, self, self);
                }
            } else {
                var dcityName = self.flightStore.getSearchDetails(0, 'dcityName'),
                    acityName = self.flightStore.getSearchDetails(0, 'acityName');
                self.els.eldepartcity_w.find("em").html(dcityName);
                self.els.elbackcity_w.find("em").html(acityName);
                mdStore.setAttr('DCity', dcityName); //埋点DCity
                mdStore.setAttr('ACity', acityName); //埋点ACity
                //-------------------------------------------------------------------------//
                var amode = self.flightStore.getAttr('amode'),
                    dmode = self.flightStore.getAttr('dmode')

                if (amode == 2 || dmode == 2) {
                    self.$el.find('.passenger').show();
                    var passengerType = self.flightStore.getAttr('passengerType');
                    if (passengerType == 1) {
                        self.$el.find('.passengerType').html('成人');
                        self.$el.find('.tips').hide();
                    } else {
                        self.$el.find('.passengerType').html('儿童');
                        self.$el.find('.tips').show();
                    }
                } else {
                    self.$el.find('.passenger').hide();
                }
                //-------------------------------------------------------------------------//


            }
            self.els.eldepartcity_w.find("span").removeClass();
            self.els.elbackcity_w.find("span").removeClass();
            self.switchTab(parseInt(cur));
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
            if ((sourceid && (+sourceid == 1575 || +sourceid == 1867)) || (_sales && _sales.sid && (+_sales.sid == 1575 || +_sales.sid == 1867))) {
                this.$el.find('#in_footer').hide();
                this.$el.find("#js_return").hide();
                if (this.footer)
                    this.footer.hide();
                this.hasAd = false;
            }

            var ft = this.flightStore.getAttr('tabtype') === 1 ? 'OW' : 'RT';
            mdStore.setAttr('FlightType', ft);   //埋点FlightType

            callback.call(this);
        },
        createCalendar: function () {
            var now = this.getServerDate();
            var self = this;
            var dTime = this.flightStore.getSearchDetails(0, 'date'), eTime = this.flightStore.getSearchDetails(1, 'date');
            if (dTime) {
                dTime = cBase.Date.parse(dTime).valueOf();
            } else {
                dTime = this.getServerDate();
            }
            if (dTime < now) {
                dTime = now;
                this.flightStore.setSearchDetails(0, 'date', cBase.Date.format(dTime, 'Y/m/d'));
            }
            if (eTime) {
                eTime = cBase.Date.parse(eTime).valueOf();
            } else {
                eTime = (new cBase.Date(dTime)).addDay(1).valueOf();
            }
            var self = this;
            this.calendar = new Calendar({
                Months: 13,
                date: {
                    start: {
                        headtitle: '出发日期选择',
                        title: function (date, sformat) {
                            var str = '<em>' + sformat(date) + '</em><i>出发</i>';
                            return str;
                        },
                        value: dTime
                    },
                    back: {
                        headtitle: '返程日期选择',
                        title: function (date, sformat) {
                            var str = '<em>' + sformat(date) + '</em><i>返回</i>';
                            return str;
                        },
                        value: eTime,
                        bound: {
                            rules: { '>': 'start' },
                            error: function () {
                                self.showToast('请选择比出发日期更晚的时间', 1);
                            }
                        }
                    }
                },
                title: '出发日期选择',
                callback: function (date, datename, dates, d, end) {
                    var start = dates['start'], back = dates['back'];
                    if (datename === 'start' && start >= back) {
                        if (start < end) {
                            this.setDate({
                                back: (new cBase.Date(start)).addDay(1).valueOf(),
                                start: start
                            });
                        } else {
                            this.setDate({
                                back: new Date(start),
                                start: start
                            });
                        }
                    }

                    self.setPanelDate.apply(self, arguments);
                    this.hide();
                },
                onShow: function () {
                    self.$el.hide();
                    self.setCalendarUbt();
                },
                onHide: function () {
                    window.scrollTo(0, 0);  //修正日历下拉后选择样式不对
                    self.$el.show();
                    self.recoverIndexUbt();
                }
            });
            this.calendar.create();
            this.flightStore.setAttr('calendarendtime', cBase.Date.format(this.calendar.getEndDate(), 'Y/m/d H:i:s'));
        },
        setPanelDate: function (date, datename, dates, dateinfo) {
            var title, date, dateinfo;
            for (var i in dates) {
                title = [];
                date = dates[i];
                dateinfo = this.calendar.getDateInfo(date);
                if (dateinfo.chineseday) title.push(dateinfo.chineseday);
                if (dateinfo.holiday) title.push(dateinfo.holiday);
                if (dateinfo.daytitle) title = [dateinfo.daytitle];
                title.push(dateinfo.week);
                switch (i) {
                    case 'start':
                        this.els.eldepartDatetop.html(cBase.Date.format(date, 'm月d日'));
                        this.els.eldepartDatebottom.html(title[0]);
                        this.flightStore.setSearchDetails(0, 'date', cBase.Date.format(date, 'Y/m/d'));

                        //日期埋点--start--
                        try {
                            mdStore.setAttr('DTime', cBase.Date.format(date, 'Y/m/d')); //埋点DTime
                        } catch (e) {
                            console.log('埋点error', "updatePage():DTime");
                        }
                        //日期埋点--end--

                        break;
                    case 'back':
                        this.els.elbackDatetop.html(cBase.Date.format(date, 'm月d日'));
                        this.els.elbackDatebottom.html(title[0]);
                        this.flightStore.setSearchDetails(1, 'date', cBase.Date.format(date, 'Y/m/d'));
                        //日期埋点--start--
                        try {
                            mdStore.setAttr('ATime', cBase.Date.format(date, 'Y/m/d'));    //埋点ATime
                        } catch (e) {
                            console.log('埋点error', "updatePage():ATime");
                        }
                        //日期埋点--end--
                        break;
                }
            }
        },
        //首次记载view，创建view
        onCreate: function () {
            this.render();
            this.createCalendar();
            this.baseDataModel = new cMultipleDate({
                models: {
                    'flightCityList': FlightModels.FlightCityListModel.getInstance(),
                    'flightInterCityList': FlightModels.FlightInterCityListModel.getInstance()
                }
            });
        },
        //加载数据时
        onLoad: function (lastViewName) {
            $("meta[name='viewport']").attr('content', 'width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no');
            var meta = document.getElementsByTagName('meta');
            for (var i = 0; i < meta.length; i++) {

                if (meta[i].getAttribute('name') == "viewport") {
                    //下面可进行设置
                    meta[i].setAttribute('content', "width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no");
                }
            }

            this.isShowData = true;
            //判断渠道
            var sourceid = "";
            if (window.localStorage && window.localStorage.getItem('SALES') != null && window.localStorage.getItem('SALES') != "") {
                var SALES = JSON.parse(window.localStorage.getItem('SALES'));
                if (SALES["data"] != null) {
                    sourceid = parseInt(SALES["data"]["sourceid"]);
                }
            }
            var _sales = salesStore.get();

            if (this.getQuery("sid") == 449843 || this.getQueryStringByName("sid") == 449843 || (this.getQueryStringByName("sid") + "") == "449843") {

                var os = this.getQueryStringByName("os") || this.getQuery("os") || 1;
                var osver = this.getQueryStringByName("osver") || this.getQuery("osver") || "2.18";

                flightCCBStore.setAttr("osType", os);
                flightCCBStore.setAttr("osVer", osver);
                flightCCBStore.setAttr("isCCB", true);


            } else {

            }


            /* 统计埋点开始 */
            try {
                window['h5.flt.homepage.speed'].updatePageBegin = Date.now();
            } catch (e) {

            }
            /* 统计埋点结束 */
            this.updatePage(function () {
                /* 统计埋点开始 */
                try {
                    window['h5.flt.homepage.speed'].updatePageEnd = Date.now();
                } catch (e) {

                }
                /* 统计埋点结束 */
                this.turning();
                /* 统计埋点开始 */
                try {
                    window['h5.flt.homepage.speed'].end = Date.now();
                    //上报tracelog
                    if (typeof window['__bfi'] == 'undefined') window['__bfi'] = [];
                    var report = {
                        onloadTime: window['h5.flt.homepage.speed'].end - window['h5.flt.homepage.speed'].begin,
                        updatePageTime: window['h5.flt.homepage.speed'].updatePageEnd - window['h5.flt.homepage.speed'].updatePageBegin
                    };
                    window.__bfi.push(['_tracklog', 'h5.flt.homepage.speed', JSON.stringify(report)]);
                } catch (e) {

                }
                /* 统计埋点结束 */
            });

        },
        //调用turning方法时触发
        onShow: function () {
            this.setTitle('机票搜索页');
        },
        onHide: function () {
            this.resizehandler && $(window).unbind('resize', this.resizehandler);
            $("meta[name='viewport']").attr('content', 'width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no');
            this.hideLoading();
        },

        //解决UC浏览器不能写localstorage的问题
        checkUcStore: function () {
            if (navigator.userAgent.indexOf(' UCBrowser') > -1) {
                this.flightStore.setAttr('rcsay', 'imbad');
                var r2 = this.flightStore.getAttr('rcsay');
                if ('imbad' != r2) {
                    window.location.reload();
                }
            }
        },

        //设置日历页的UBT
        setCalendarUbt: function () {
            this.pageid = '214278';

        },
        //恢复至首页UBT
        recoverIndexUbt: function () {
            this.pageid = '212003';
        },

        //选择乘客类型
        selectPassenger: function () {
            var _this = this;
            var port_place = this.$el.find('.passenger');
            var data = [{ key: '成人' }, { key: '儿童(2～12岁)' }];
            var index = _this.flightStore.getAttr('passengerType') == 1 ? 0 : 1;

            s = new c.ui.ScrollRadioList({
                title: '乘客类型',
                index: port_place.attr('index'),         //默认定位到第几个item上
                index: index,
                data: data,                                //要展示到item的数组
                content: 1,
                disItemNum: 3,                            //显示的item数量
                itemClick: function (item) {              //选中item触发的事件
                    var passengerType = item.index == 1 ? 2 : 1;
                    _this.flightStore.setAttr('passengerType', passengerType);
                    if (passengerType == 2) {
                        _this.$el.find('.tips').show();
                        _this.$el.find('.passengerType').html('儿童');
                    } else {
                        _this.$el.find('.tips').hide();
                        _this.$el.find('.passengerType').html('成人');
                    }

                }
            });
            s.show();
        },
        /*值机*/
        checkin: function () {
            mdStore.setAttr('IsChooseSeat', true);  //埋点IsChooseSeat
            //发送埋点信息，删除mdStore
            try {
                this.mdSubmit();
            } catch (e) {
                console.log('埋点提交', 'checkin()');
            }
            //
            this.jump("/webapp/flight/#checkin");
        },
        /*航班动态*/
        flightSchedule: function () {
            mdStore.setAttr('IsFlightSituation', true);  //埋点IsFlightSituation
            //发送埋点信息，删除mdStore
            try {
                this.mdSubmit();
            } catch (e) {
                console.log('埋点提交', 'flightSchedule()');
            }
            //
            this.jump("/html5/Flight/Schedule/");
        },
        /**
         * 发送埋点信息，删除mdStore
         */
        mdSubmit: function () {
            Futility.sendUbt(UBTKey, mdStore.get());
            mdStore.remove();
        }

    });
    return View;
});
