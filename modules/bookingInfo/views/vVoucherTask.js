/**
 * Created by huangjianhua on 14-8-5.
 */
define('vVoucherTask',['c'], function (c) {
    //获取父类store

    var cbase = c.base;

    var vVoucherTask = {
        /*1、如果是非登录状态，则默认显示上一次的发票，如果无，则显示第一个登机人姓名
         *2、如果登录状体，则默认显示上一次的发票，如果无，则显示第一个登机人姓名
         *3、取iinfo的时候利用userid的tag
         * 增加了报销凭证类型 modify by zhengkw 2014-08-08
         * */
        QueryInvoiceInfoData: function ( invoiceInfoData ) {
            var me = this;
            var userStore = me.stores.userStore;
            var invoiceTitleStore = me.stores.invoiceTitleStore;
            var flightOrderInfoInviceStore = me.stores.flightOrderInfoInviceStore;
            var flightOrderStore = me.stores.flightOrderStore;
            var passengerQueryStore = me.stores.passengerQueryStore;
            
            var userid = userStore.isLogin() ? userStore.getUser().UserID : null;
            if (invoiceTitleStore.getAttr('InvoiceTitle') != null) {    //从发票抬头选取页返回的结果取
                invoiceInfoData.title = invoiceTitleStore.getAttr('InvoiceTitle');
                invoiceTitleStore.remove();
            } else if (flightOrderInfoInviceStore.getAttr(userid) != null) {
                var iinfo = flightOrderInfoInviceStore.getAttr(userid);
                invoiceInfoData["title"] = iinfo["title"];

            } else if (flightOrderStore.getAttr('iinfo') != null && flightOrderStore.getAttr('iinfo')['title']) {
                invoiceInfoData["title"] = flightOrderStore.getAttr('iinfo')['title'];
            } else {
                var passengers = passengerQueryStore.get() && passengerQueryStore.get().passengers ? passengerQueryStore.get().passengers : [];
                var selectPassengers = [];
                for (var i = 0; i < passengers.length; i++) {
                    var p = passengers[i];
                    if (+p.selected == 1) {
                        selectPassengers.push(p);
                        break;
                    }
                }
                if (selectPassengers.length > 0) {
                    invoiceInfoData.title = selectPassengers[0].language ? (selectPassengers[0].language == 'EN' ? selectPassengers[0].ename : selectPassengers[0].cname) : (selectPassengers[0].defaIdCard.type == 1 ? selectPassengers[0].cname : selectPassengers[0].ename);

                } else {
                    invoiceInfoData.title = '';
                }
            }
            //报销凭证类型 1、套餐发票 2、行程单+差额发票
            var invoiceinfo = flightOrderInfoInviceStore.getAttr("invoiceinfo", userid);
            if (invoiceinfo) {
                invoiceInfoData.inname = invoiceinfo.inname;
                invoiceInfoData.intype = invoiceinfo.intype;
                invoiceInfoData.len = invoiceinfo.len;
            }
            else {
                invoiceinfo = me.stores.flightDetailStore.getAttr("invoiceinfo");
                invoiceInfoData.inname = invoiceinfo[0].inname;
                invoiceInfoData.intype = invoiceinfo[0].intype;
                invoiceInfoData.len = invoiceinfo.len;
                this.stores.flightOrderInfoInviceStore.setAttr('invoiceinfo', { intype: invoiceinfo[0].intype, inname: invoiceinfo[0].inname, len: invoiceinfo.length }, userid);
            }

            return invoiceInfoData;
        },

        /*
            报销凭证按钮切换回调事件 modify by zhengkw 2014.8.12
        */
        reimbursementAction: function (scope) {
            
            var me = this;
            var flightDeliveryStore = this.stores.flightDeliveryStore,
                userStore = this.stores.userStore,
                flightDetailsStore = this.stores.flightDetailsStore,
                flightOrderStore = this.stores.flightOrderStore,
                postAddressStorage = this.stores.postAddressStorage,
                mdStore = this.stores.mdStore,
                flightSearchStore = this.stores.flightSearchStore,
                addrListStore = this.stores.addrListStore,
                selAddrStore = this.stores.selAddrStore,
                zqInAirportSelectStore = this.stores.zqInAirportSelectStore,
                selFlightInfoStore = this.stores.selFlightInfoStore,
                airportDeliveryStore = this.stores.airportDeliveryStore,
                invoiceTitleStore = this.stores.invoiceTitleStore,
                passengerQueryStore = this.stores.passengerQueryStore,
                flightOrderInfoInviceStore = this.stores.flightOrderInfoInviceStore,
                addrListModel = this.parentView.models.addrListModel;
                
            var parent = this.parentView;
            var target = parent.$el.find('#invoice_switch'),
                address_box = parent.$el.find("#js_address_box"),
                flightDeliveryStore = me.stores.flightDeliveryStore,
                flightDeliveryData = flightDeliveryStore.get(this.UserID) || {
                    type: 1
                },
                paytype = flightDeliveryStore.getAttr('paytype');

            var tempDeltabfun = me.deltabfun;
            var tempDelzqfun = me.delzqfun;
            var tempDelmailfun_1 = me.delmailfun_1;

            // invoice_box = _this.$el.find("#js_invoice_box");
            if (!parent.DelItemsData) {
                //报销方式没加载完直接return
                return;
            }
            if (parent.DelItemsData.length <= 0) {
                parent.showToast("该航班不支持报销凭证配送");
                target.find('.cui-switch').removeClass('current');
                target.find('.cui-switch-bg').removeClass('current');
                address_box.addClass("clahead");
                // invoice_box.addClass("clahead");
                return;
            }

            var deliveryInfo = flightDeliveryStore.getAttr('deliveryInfo');
            /*关闭报销凭证*/
            if (!scope.getStatus()) {
                address_box.addClass("clahead");
                // invoice_box.addClass("clahead");
                $('#gift-card-tips').hide();
                flightDeliveryStore.setAttr('type', 1, parent.UserID);
                postAddressStorage.setAttr("edit", 0, parent.UserID);
                this.parentView.trigger(this.parentView.EVENTS.UPDATEORDERPRICE);
                parent.$el.find('.error-tips[data-role="delivery"]').hide(); // 隐藏报销凭证的错误提示信息
            }
                /*机场自取*/
            else if (target.data("type") == "16" || flightDeliveryData.type == '16') {
                address_box.removeClass("clahead");
                // invoice_box.removeClass("clahead");
                flightDeliveryStore.setAttr('type', 16, parent.UserID);

                parent.$el.find(".js_del_tab").html(tempDeltabfun({
                    type: 16,
                    len: parent.DelItemsData.length
                })); //加载预模板
                parent.$el.find(".js_del_box").html(tempDelzqfun());

                mdStore.setAttr('IsNeedSegment', true);  //埋点IsNeedSegment
                mdStore.setAttr('IsDeliveryType', true);  //埋点IsDeliveryType

                me.i_updateZqAir( );

                me.updateInvoiceBox();
            }
                /*邮寄*/
            else if (target.data("type") == "2" || flightDeliveryData.type == '2') { //邮寄
                var selData = postAddressStorage.get(parent.UserID);
                address_box.removeClass("clahead");
                // invoice_box.removeClass("clahead");
                flightDeliveryStore.setAttr('type', 2, parent.UserID);
                postAddressStorage.setAttr("edit", 1, parent.UserID);
                parent.$el.find(".js_del_tab").html(tempDeltabfun({
                    type: 2,
                    len: parent.DelItemsData.length
                }));
                parent.$el.find(".js_del_box").html(tempDelmailfun_1(selData));

                this.updateAddrList(postAddressStorage, userStore, addrListStore, flightDeliveryStore, selAddrStore, addrListModel);
                me.updateInvoiceBox();
            }
                /*快递*/
            else {
                var selData = postAddressStorage.get(parent.UserID);
                var selItem = parent.DelItemsData[0]; // 如果有快递，则第一个就是快递信息

                address_box.removeClass("clahead");
                flightDeliveryStore.setAttr('type', selItem.type, parent.UserID);
                postAddressStorage.setAttr("edit", 1, parent.UserID);
                parent.$el.find(".js_del_tab").html(this.deltabfun({
                    type: selItem.type,
                    len: parent.DelItemsData.length
                }));
                parent.$el.find(".js_del_box").html(tempDelmailfun_1(selData));

                if (selItem.type == 32) { // 快递
                    $(".js_del_cost .flight-listsim3").show();
                    $('#gift-card-tips').show();

                    if (selItem.exinfo) {
                        flightDeliveryStore.setAttr('type', selItem.type, parent.UserID);
                        flightDeliveryStore.setAttr('deliveryInfo', { type: selItem.type, sendFee: selItem.exinfo.fee, fee: selItem.exinfo.fee }, parent.UserID);
                        var supportPaytype = _.filter(selItem.exinfo.pays, function (pay) {
                            return pay.paytype == paytype;
                        }).length;

                        if (!supportPaytype) { // 上次记忆的paytype方式不可用，需更新
                            paytype = parent.i_getPayType(selItem.exinfo.pays);
                            flightDeliveryStore.setAttr('paytype', paytype, parent.UserID);
                        }

                        this.parentView.trigger(this.parentView.EVENTS.UPDATEORDERPRICE);

                        flightDeliveryStore.setAttr('pays', selItem.exinfo.pays, parent.UserID);
                        flightDeliveryData = flightDeliveryStore.get(parent.UserID);
                        flightDeliveryData.islogin = userStore.isLogin();
                        flightDeliveryData.fee = selItem.exinfo.fee;
                        flightDeliveryData.isLogin = userStore.isLogin();
                        parent.$el.find(".js_del_cost").html(this.delcostfun(flightDeliveryData)); // 配送费用选项
                    }
                } else {
                    $(".js_del_cost .flight-listsim3").hide();
                    $('#gift-card-tips').hide();
                }
                this.updateAddrList(postAddressStorage, userStore, addrListStore, flightDeliveryStore, selAddrStore, addrListModel);
                me.updateInvoiceBox();
            }

            c.ui.InputClear(parent.$el.find('.flight-listsim3-table input[type="text"],.flight-listsim3-table input[type="tel"]'), null, null, {    //XXX
                top: 20, right: -25
            }, true);
            $('#js_invoice_title').next('.cui-focus-close').detach();  //清除重复生成

            mdStore.setAttr('IsNeedSegment', true);  //埋点IsNeedSegment
            mdStore.setAttr('IsDeliveryType', true);  //埋点IsDeliveryType
        },
        /*
         机场自取模板渲染        
        */
        i_updateZqAir: function () {
            var me = this;
            var _this = me.parentView;
            var stores = this.stores;
            var flightSearchStore = stores.flightSearchStore, 
                flightDetailsStore = stores.flightDetailsStore, 
                zqInAirportSelectStore = stores.zqInAirportSelectStore, 
                selFlightInfoStore = stores.selFlightInfoStore, 
                airportDeliveryStore = stores.airportDeliveryStore;
            _this.zqTimeObj = _this.zqTimeObj || {};
            if (_this.DelItemsData && _this.DelItemsData.length > 0) {
                var addrs = null;
                for (var i = 0; i < _this.DelItemsData.length; i++) {
                    if (_this.DelItemsData[i].type === 16) {
                        addrs = _this.DelItemsData[i].addrs;
                    }
                }
                var dcity = flightSearchStore.getSearchDetails(0, 'dCtyCode'),
                    acity = flightSearchStore.getSearchDetails(0, 'aCtyCode'),
                    flightDetailsData = flightDetailsStore.get(),
                    zqSelectId = zqInAirportSelectStore.get() ? zqInAirportSelectStore.get().index : 1,
                    zqIndex = 0,
                    selFlightInfoData = selFlightInfoStore.get();
                _this.citykey = dcity + acity;
                if (!addrs) return;
                _.each(addrs, function (n, m) {
                    if (n.index == zqSelectId) {
                        zqIndex = m;
                    }
                });
                if (addrs && addrs[zqIndex]) {
                    var dutyBtime = $.trim(addrs[zqIndex].btime),
                        dutyEtime = $.trim(addrs[zqIndex].etime);
                    //工作开始时间 Date
                    _this.zqTimeObj.dutyBtime = c.base.Date.parse(_this.getServerDate().setHours(dutyBtime.slice(0, 2), dutyBtime.slice(2), 0, 0));
                    //工作结束时间 Date
                    _this.zqTimeObj.dutyEtime = c.base.Date.parse(_this.getServerDate().setHours(dutyEtime.slice(0, 2), dutyEtime.slice(2), 0, 0));
                    //当前时间后2小时 Date
                    _this.zqTimeObj.serverDate = c.base.Date.parse(_this.getServerDate().toString()).addHours(2).valueOf();
                    //起飞时间前2小时 Date
                    _this.zqTimeObj.airDate = c.base.Date.parse(flightDetailsData.items[0].basicInfo.dTime).addHours(-2).valueOf();
                    //有效选择时间 begin&end
                    _this.zqTimeObj.validDate = this.zqParseDate(cbase, _this.zqTimeObj.serverDate, _this.zqTimeObj.airDate, _this.zqTimeObj.dutyBtime, _this.zqTimeObj.dutyEtime);
                    //默认显示时间 Date
                    _this.zqTimeObj.defaDate = _this.zqTimeObj.validDate.length > 0 && _this.zqTimeObj.validDate[_this.zqTimeObj.validDate.length - 1][1];
                    var minutes = '00';
                    var hours = '00'
                    //已选时间 Date
                    if (airportDeliveryStore.getAttr("time")) {

                        _this.zqTimeObj.selectDate =  new c.base.Date(airportDeliveryStore.getAttr("time")).valueOf();
                        minutes = _this.zqTimeObj.selectDate.getMinutes().toString();
                        hours = _this.zqTimeObj.selectDate.getHours().toString();
                    } else {
                        _this.zqTimeObj.selectDate = _this.zqTimeObj.defaDate;
                    }
                    //当天有效选择时分 arr
                    _this.zqTimeObj.defaHourList = me.zqPrintDetail(_this.zqTimeObj.validDate, _this.zqTimeObj.selectDate);

                    if (_this.zqTimeObj.defaHourList && _this.zqTimeObj.defaHourList.length > 0) {
                        var hourstring = (hours.length < 2 ? ('0' + hours) : hours) + ':' + (minutes.length < 2 ? ('0' + minutes) : minutes);
                        if (!airportDeliveryStore.getAttr("time") || _this.zqTimeObj.defaHourList.indexOf(hourstring) < 0) {
                            _this.zqTimeObj.defaHour = _this.zqTimeObj.defaHourList[_this.zqTimeObj.defaHourList.length - 1];
                            _this.zqTimeObj.selectDate.setHours(_this.zqTimeObj.defaHour.slice(0, 2), _this.zqTimeObj.defaHour.slice(3));
                        }

                    }
                    //保险
                    var isInsurance = flightDetailsData && flightDetailsData.insurances &&
                        flightDetailsData.insurances.length > 0 && flightDetailsData.insurances[0] &&
                        flightDetailsData.insurances[0].sites && flightDetailsData.insurances[0].sites.indexOf(addrs[zqIndex].site) >= 0;

                    //                    if (!isInsurance && addrs[zqIndex].name.search("不支持保险") < 0) {
                    //                        addrs[zqIndex].name = addrs[zqIndex].name + ' (不支持保险)'
                    //                    }
                    //addrs[zqIndex].name = isInsurance ? addrs[zqIndex].name : addrs[zqIndex].name + ' (不支持保险)';

                    var postAddressData = airportDeliveryStore.get(_this.citykey) || {};
                    for (var attr in addrs[zqIndex]) {
                        postAddressData[attr] = addrs[zqIndex][attr];
                    }
                    var current = new c.base.Date(_this.zqTimeObj.selectDate.toString());
                    postAddressData.time = _this.zqTimeObj.selectDate.toString();
                    postAddressData.day = current.format("Y-m-d");
                    postAddressData.tim = current.format("H:i");
                    airportDeliveryStore.set(postAddressData, _this.citykey);
                    postAddressData.cDate = c.base.Date;
                    _this.$el.find(".js_del_box").html(this.delzqfun(postAddressData));         //TODO: bug, when format the data. belongs to the Lizard.
                }
                me.i_showCalendarUI();
            }
        },
        onInputLogAddr: function (userStore, postAddressStorage, _this) { //输入状态保存
            var userID = userStore.isLogin() ? _this.UserID : '';
            this.$el.find('.js_recipient').on('input', function () {
                var val = $.trim($(this).val());
                postAddressStorage.setAttr("recipient", val, userID)
            });
            this.$el.find('.js_addr').on('input', function () {
                var val = $.trim($(this).val());
                postAddressStorage.setAttr("addr", val, userID)
            });
            this.$el.find('.js_zip').on('input', function () {
                var val = $.trim($(this).val());
                postAddressStorage.setAttr("zip", val, userID)
            });
        },
        zqParseDate: function (cbase, startD, endD, workSD, workED) { ///@第一步判断，sD eD的时间区间，是否在一日之后，或?
            var sGet = startD.getTime(),
                eGet = endD.getTime(),
                wsHours = workSD.getHours(),
                weHours = workED.getHours(),
                wsMin = workSD.getMinutes(),
                weMin = workSD.getMinutes(),
                sMonth = startD.getMonth() + 1,
                eMonth = endD.getMonth() + 1,
                sDay = startD.getDate(),
                eDay = endD.getDate(),
                sYear = startD.getFullYear(),
                eYear = endD.getFullYear(),
                date = [];
            var wkStart = new cbase.Date.parse(sYear + '-' + sMonth + '-' + sDay + ' ' + wsHours + ':' + wsMin),
                wkEnd = new cbase.Date.parse(sYear + '-' + sMonth + '-' + sDay + ' ' + weHours + ':' + weMin),
                wsGet = wkStart.getTime(),
                weGet = wkEnd.getTime();
            if (sMonth == eMonth && sDay == eDay && sYear == eYear) { // console.log(wkStart); ///@ method date 1
                if (sGet < wsGet && eGet > weGet) {
                    date.push([new Date(wkStart), new Date(wkEnd)]);
                    return date;
                } ///@ method date 2
                if ((sGet > wsGet && sGet < weGet) && eGet > weGet) {
                    date.push([startD, wkEnd]);
                    return date;
                }
                ///@ method date 3
                if ((sGet > wsGet && sGet < weGet) && eGet < weGet) {
                    date.push([startD, endD]);
                    return date;
                }
                ///@ method date 5
                if (sGet < wsGet && (eGet < weGet && eGet > wsGet)) {
                    date.push([workSD, endD]);
                    return date;
                } ///@ method date 4
                if ((sGet >
                    weGet && eGet > weGet) || (sGet < wsGet && sGet < wsGet) || (sGet < wsGet && eGet < wsGet)) {
                    return date;
                }
            } else {
                var differ = new cbase.Date.
                    parse(eYear + '-' + eMonth + '-' + eDay + ' 0:00').date.getTime() - new cbase.Date.parse(sYear + '-' + sMonth + '-' + sDay + ' 0:00').date.getTime();
                // console.log(differ);
                var days = Math.floor(differ / (24 * 3600 * 1000)) + 1;
                var i = 0, pull = [];
                for (; i < days; i++) {
                    var _wks = wkStart.getTime() + (1000 * 60 * 60 * 24 * i);
                    var _wke = wkEnd.getTime() + (1000 * 60 * 60 * 24 * i);
                    pull.push([new Date(_wks), new Date(_wke)]);
                }
                // console.log(date);
                var F_SGet = pull[0][0].getTime();
                var F_EGet = pull[0][1].getTime();
                var E_SGet = pull[pull.length - 1][0].getTime();
                var E_EGet = pull[pull.length - 1][1].getTime();
                date = pull.slice();
                if (days == 2) {
                    if (sGet > F_EGet &&
                        eGet < E_SGet) {
                        return [];
                    }
                    if (sGet > F_SGet && eGet < E_SGet) {
                        date.splice(date.length - 1, 1);
                        date[0][0] = startD;
                        return date;
                    }
                    if (sGet > F_EGet) {
                        date.splice(0, 1);
                        date[0][1] = endD;
                        return date;
                    }
                }
                if (sGet > F_EGet && eGet > E_SGet &&
                    eGet < E_EGet) {
                    date.splice(0, 1);
                    date[date.length - 1][1] = endD;
                    return date;
                }
                if (sGet > F_SGet && sGet < F_EGet && eGet < E_SGet) {
                    date.splice(date.length - 1, 1);
                    date[0][0] = startD;
                    return date;
                }
                if (sGet > F_EGet) {
                    date.splice(0, 1);
                    return date;
                }
                if (eGet < E_SGet) {
                    date.splice(date.length - 1, 1);
                    return date;
                }
                ///@ method 5 childDate 1
                if (sGet < F_SGet && eGet < E_EGet) {
                    date[date.length - 1][1] = endD;
                    return date;
                }
                ///@method 5 childDate 2
                if (sGet > F_SGet && eGet > E_EGet) {
                    date[0][0] = startD;
                    return date;
                } ///@method 5 childDate 3
                if (sGet > F_SGet && eGet < E_EGet) {
                    date[0][0] = startD;
                    date[date.length - 1][1] = endD;
                    return date;
                }
                if (sGet < F_SGet && eGet > E_EGet) {
                    return date;
                }
            }
        },
        i_showCalendarUI: function(){ //日历控件UI
            var me = this;
            var parent = me.parentView;
            var airportDeliveryStore = me.stores.airportDeliveryStore;
            var selectedDate = airportDeliveryStore.getAttr("time");
            parent.calendar = new me.Calendar({
                date: {
                    start: {
                        title: function (date, sformat) {
                            return sformat(date);
                        },
                        value: selectedDate
                    }
                },
                title: '取票日期',
                Months: 6,
                callback: function (date) {
                    parent.zqTimeObj.defaHourList = me.zqPrintDetail(parent.zqTimeObj.validDate, date);            //XXX:zqTimeObj
                    if (parent.zqTimeObj.defaHourList.length > 0) {
                        var defaHour = parent.zqTimeObj.defaHourList[parent.zqTimeObj.defaHourList.length - 1];
                        date.setHours(defaHour.slice(0, 2), defaHour.slice(3));
                    }
                    airportDeliveryStore.setAttr("time", date.toString());
                    parent.zqTimeObj.selectDate = date;

                    me.i_updateZqAir( );
                    parent.$el.show();
                    this.hide();
                    window.scrollTo(0, parent.scrollPosY);
                },
                onHide: function () {
                    parent.$el.show();
                },
                classNames: 'calen-cls'
            });
        },
        zqPrintDetail: function (interval, ticketsDate) {
            if (typeof ticketsDate === "string") {
                ticketsDate = new Date(ticketsDate);
            }
            var len = interval.length,
                date = [], us, i = 0, bool = true,
                month = ticketsDate.getMonth();
            var day = ticketsDate.getDate();
            if (!len) return date;
            for (; i < len; i++) {
                var set = interval[i];
                for (var k = 0, le = set.length; k < le; k++) {
                    if (set[k].getMonth() === month && set[k].getDate() === day) {
                        us = set;
                        break;
            }}}
            if (!us) return date;
            var star = us[0],
                end = us[1],
                starTime = star.getTime(),
                endTime = end.getTime(),
                endminu = end.getMinutes(),
                endhour = end.getHours();
            while (starTime <= endTime) {
                var newDate = new Date(starTime),
                    hours = newDate.getHours(),
                    minutes = newDate.getMinutes();
                if (bool) {
                    bool = false;
                    if (minutes) {
                        minutes > 30 ? newDate = new Date(starTime = starTime + (60 - minutes) * 60 * 1000) : newDate = new Date(starTime = starTime + (30 - minutes) * 60 * 1000);
                        hours = newDate.getHours(), minutes = newDate.getMinutes();
                    }
                }
                starTime = starTime + (1000 * 60 * 30);
                date.push((hours < 10 ? "0" + hours : hours) + ':' + (!minutes ? '00' : minutes));
            }
            return date;
        }

    };

    return vVoucherTask;
});