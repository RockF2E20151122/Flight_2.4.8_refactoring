define(['libs', 'c', 'FlightModel', 'FlightStore', 'CommonStore', buildViewTemplatesPath('zqincity.html'), 'cWidgetFactory', 'cWidgetCalendar'], function (libs, c, FlightModel, FlightStore, CommonStore, html, WidgetFactory) {
    var cBase = c.base;
    var TYPE = 8;
    var Calendar = WidgetFactory.create('Calendar');

    var View = c.view.extend({
        flightSearchStore: FlightStore.FlightSearchStore.getInstance(),
        curModel: FlightModel.zqInCityModel.getInstance(),
        flightStore: FlightStore.zqInCityStore.getInstance(),
        flightSelectedStore: FlightStore.FlightSelectedInfo.getInstance(),
        selectCityStore: FlightStore.zqInCitySelectStore.getInstance(),
        dateStorage: FlightStore.zqInCityDateStore.getInstance(),
        LastInCitySelectDateTime: FlightStore.LastInCitySelectDateTime.getInstance(),
        zqInCityDateAndAddressStore: FlightStore.zqInCityDateAndAddressStore.getInstance(),
        flightPickTicketSelectStore: FlightStore.FlightPickTicketSelectStore.getInstance(),
        userStore: CommonStore.UserStore.getInstance(),
        flightDetailModel: FlightModel.FlightDetailModel.getInstance(), //航班详情数据Model
        tpl: html,
        pageid: '214038',
        minutes: 0,
        minutes1: 0,
        flightid: null,
        realStartDate: null,
        render: function () {
            this.$el.html(this.tpl);
            this.els = {
            };
        },
        events: {
            'click .deduct-time': 'deductTime',
            'click .plus-time': 'plusTime',
            'click #finished': 'finished',
            'click #self-pickup-addr': 'selfPickupAddr',
            'click #picker-date': 'pickerDate',
            'click #js_return': 'goBack'
        },
        goBack: function () {
            this.selectCityStore.remove();
            this.dateStorage.remove();
            this.$el.find('#address,#inCityDate,.hours').text('');
            this.back('zqinpickticketselect');
        },
        selfPickupAddr: function () {
            this.forward('zqincityselect');
        },
        finished: function () {
            if (this.selectCityStore.get() && this.selectCityStore.get().address && this.LastInCitySelectDateTime.get() && this.LastInCitySelectDateTime.get().times) {
                var self = this;
                this.zqInCityDateAndAddressStore.set({ time: self.LastInCitySelectDateTime.get().times, zqInfo: self.selectCityStore.get() }, this.flightCode);
            } else {
                this.showMessage('请填写自取地址');
                return;
            }
            this.flightPickTicketSelectStore.setAttr('type', TYPE);
            this.forward('bookinginfo');
        },
        getfinishedTime: function () {
            if (this.zqInCityDateAndAddressStore.get() && this.zqInCityDateAndAddressStore.get().time) {
                var f = new Date(this.zqInCityDateAndAddressStore.get().time);
                var nDate = cBase.Date.format(f, 'Y-m-d');
                this.$el.find('#inCityDate').text(nDate);
                this.$el.find('.hours').text(this.formatTimes(f.getHours()) + ':' + this.formatTimes(f.getMinutes()));
            }
        },
        createCalendar: function () {
            var startD = this.getServerDate();
            var endD = (new cBase.Date(this.getServerDate())).addDay(5).valueOf();
            var self = this;
            this.calendar = new Calendar({
                date: {
                    start: {
                        title: function (date, sformat) {
                            return sformat(date);
                        },
                        value: this.getServerDate()
                    }
                },
                title: '取票日期',
                Months: 2,
                callback: function (date) {
                    var nowDate = new Date(date);
                    self.dateStorage.set({ date: nowDate.valueOf() });
                    this.hide();
                    self.initSelectDate(self.getServerDate(), self.airTakeOff);
                },
                classNames: 'calen-cls',
                'validStartDate': startD,
                'validEndDate': endD
            });
        },
        initSelectDate: function (CurrentTime, airTakoff) {
            if (this.dateStorage && this.dateStorage.get() && this.dutyEtime && this.selectCityStore.get()) {
                var dutyBarginTime = new Date(this.dateStorage.get().date);
                var dutyEndTime = new Date(this.dateStorage.get().date);
                var currentDate1 = new Date(this.dateStorage.get().date);
                var orderTime = new Date(CurrentTime);
                var currentDate2 = new Date(CurrentTime);
                var currentdutyBarginTime = new Date(CurrentTime);
                var currentdutyEndTime = new Date(CurrentTime);
                var operaOrderTime = new Date(CurrentTime);
                var air = new Date(airTakoff);
                this.$el.find('.room_num i').removeClass('num_invalid');
                var h1 = this.dutyEtime.substr(0, 2);
                var m1 = this.dutyEtime.substr(2, 4);
                var h0 = this.dutyBtime.substr(0, 2);
                var m0 = this.dutyBtime.substr(2, 4);
                currentDate1.setHours(0, 0, 0, 0);
                currentDate2.setHours(0, 0, 0, 0);
                dutyBarginTime.setHours(h0, m0, 0, 0);
                dutyEndTime.setHours(h1, m1, 0, 0);
                currentdutyBarginTime.setHours(h0, m0, 0, 0);
                currentdutyEndTime.setHours(h1, m1, 0, 0);
                air.setHours(air.getHours() - 2);
                operaOrderTime.setHours(operaOrderTime.getHours() + 1);
                if ((currentDate1.valueOf() == currentDate2.valueOf() && dutyBarginTime <= operaOrderTime && operaOrderTime <= dutyEndTime && operaOrderTime < air)) {
                    var f = new Date(operaOrderTime);
                    var nDate = cBase.Date.format(f, 'Y-m-d');
                    this.$el.find('#inCityDate').text(nDate);
                    var h = ((operaOrderTime.getHours()).toString().length == 1) ? "0" + operaOrderTime.getHours() : operaOrderTime.getHours();
                    var m = ((operaOrderTime.getMinutes()).toString().length == 1) ? "0" + operaOrderTime.getMinutes() : operaOrderTime.getMinutes();
                    this.$el.find('.hours').text(h + ":" + m);
                    //this.$el.find('.hours').text(operaOrderTime.getHours() + ':' + operaOrderTime.getMinutes());
                    this.LastInCitySelectDateTime.set({ times: orderTime.valueOf() }, this.flightCode);
                } else if (operaOrderTime <= dutyBarginTime && dutyBarginTime <= air) {
                    var f = new Date(dutyBarginTime);
                    var nDate = cBase.Date.format(f, 'Y-m-d');
                    this.$el.find('#inCityDate').text(nDate);
                    var h = ((dutyBarginTime.getHours()).toString().length == 1) ? "0" + dutyBarginTime.getHours() : dutyBarginTime.getHours();
                    var m = ((dutyBarginTime.getMinutes()).toString().length == 1) ? "0" + dutyBarginTime.getMinutes() : dutyBarginTime.getMinutes();
                    this.$el.find('.hours').text(h + ":" + m);
                    //this.$el.find('.hours').text(dutyBarginTime.getHours() + ':' + dutyBarginTime.getMinutes());
                    this.LastInCitySelectDateTime.set({ times: dutyBarginTime.valueOf() }, this.flightCode);
                } else {
                    this.$el.find('#inCityDate').text('无效日期');
                    this.$el.find('.hours').text('无效');
                    this.LastInCitySelectDateTime.set({ times: false }, this.flightCode);
                    return;
                }
            } else {
                var self = this;
                window.setTimeout(function () {
                    self.showMessage('请先选择取票地址!');
                }, 100);
            }
        },
        formatTimes: function (time) {
            return time >= 10 ? time : "0" + time;
        },
        initTimes: function (CurrentTime, airTakoff) {
            this.$el.find('.room_num i').removeClass('num_invalid');
            if (this.dateStorage && this.dateStorage.get() && this.dutyEtime && this.selectCityStore.get()) {
                var dutyBarginTime = new Date(this.dateStorage.get().date);
                var dutyEndTime = new Date(this.dateStorage.get().date);
                var currentDate1 = new Date(this.dateStorage.get().date);
                var orderTime = new Date(CurrentTime);
                var currentDate2 = new Date(CurrentTime);
                var currentdutyBarginTime = new Date(CurrentTime);
                var currentdutyEndTime = new Date(CurrentTime);
                var operaOrderTime = new Date(CurrentTime);
                var air = new Date(airTakoff);
                var h1 = this.dutyEtime.substr(0, 2);
                var m1 = this.dutyEtime.substr(2, 4);
                var h0 = this.dutyBtime.substr(0, 2);
                var m0 = this.dutyBtime.substr(2, 4);
                currentDate1.setHours(0, 0, 0, 0);
                currentDate2.setHours(0, 0, 0, 0);
                dutyBarginTime.setHours(h0, m0, 0, 0);
                dutyEndTime.setHours(h1, m1, 0, 0);
                currentdutyBarginTime.setHours(h0, m0, 0, 0);
                currentdutyEndTime.setHours(h1, m1, 0, 0);
                air.setHours(air.getHours() - 2);
                operaOrderTime.setHours(operaOrderTime.getHours() + 1);
                var times = this.LastInCitySelectDateTime.get(this.flightCode);
                var rdate = this.rdate = this.buildValidDate(CurrentTime, air, { start: this.dutyBtime, end: this.dutyEtime });
                var endrange = this.buildValidTime(new Date(rdate.end.valueOf()), { start: this.dutyBtime, end: this.dutyEtime });

                if (air.valueOf() < endrange.start) {
                    this.rdate.end = new Date(this.rdate.end.valueOf() - 864e5);
                }
                if (times && times.times) {
                    var rend = new Date(rdate.end.valueOf());
                    rend.setHours(23, 59, 59, 59);
                    if (times.times >= rdate.start && times.times <= rend) {
                        var rtime = this.rtime = this.buildValidTime(new Date(times.times), { start: this.dutyBtime, end: this.dutyEtime });
                    }
                }
                if (rtime && this.LastInCitySelectDateTime.get(this.flightCode) &&
                    this.LastInCitySelectDateTime.get().times &&
                    this.LastInCitySelectDateTime.get().times >= rtime.start && this.LastInCitySelectDateTime.get().times <= rtime.end) {

                    var f = new Date(this.LastInCitySelectDateTime.get().times);
                    var nDate = cBase.Date.format(f, 'Y-m-d');
                    this.$el.find('#inCityDate').text(nDate);
                    this.$el.find('.hours').text(this.formatTimes(f.getHours()) + ':' + this.formatTimes(f.getMinutes()));
                } else if (this.zqInCityDateAndAddressStore.get(this.flightCode) &&
                    this.zqInCityDateAndAddressStore.get(this.flightCode).time) {
                    var f = new Date(this.zqInCityDateAndAddressStore.get().time);
                    var nDate = cBase.Date.format(f, 'Y-m-d');
                    this.$el.find('#inCityDate').text(nDate);
                    this.$el.find('.hours').text(this.formatTimes(f.getHours()) + ':' + this.formatTimes(f.getMinutes()));

                    this.LastInCitySelectDateTime.set({ times: this.zqInCityDateAndAddressStore.get().time }, this.flightCode);
                } else if ((currentDate1.valueOf() == currentDate2.valueOf() && dutyBarginTime <= operaOrderTime && operaOrderTime <= dutyEndTime && operaOrderTime < air) || (currentDate1.valueOf() != currentDate2.valueOf() && currentdutyEndTime <= air && currentdutyBarginTime <= operaOrderTime && operaOrderTime <= currentdutyEndTime)) {
                    var f = new Date(operaOrderTime);
                    var nDate = cBase.Date.format(f, 'Y-m-d');
                    this.$el.find('#inCityDate').text(nDate);
                    this.$el.find('.hours').text(this.formatTimes(operaOrderTime.getHours()) + ':' + this.formatTimes(operaOrderTime.getMinutes()));

                    this.LastInCitySelectDateTime.set({ times: operaOrderTime.valueOf() }, this.flightCode);
                } else {
                    if (this.compareOrderAirLeaveTime > 0) {
                        for (var i = 1; i <= this.compareOrderAirLeaveTime; i++) {
                            dutyBarginTime.setDate(dutyBarginTime.getDate() + i)
                            dutyEndTime.setDate(dutyEndTime.getDate() + i);
                            dutyBarginTime.setHours(h0, m0, 0, 0);
                            dutyEndTime.setHours(h1, m1, 0, 0);
                            if ((operaOrderTime <= dutyBarginTime && operaOrderTime < dutyEndTime && air < dutyEndTime && operaOrderTime <= air) || (operaOrderTime <= dutyBarginTime && operaOrderTime <= air && dutyEndTime <= air)) {
                                var f = new Date(dutyBarginTime);
                                var nDate = cBase.Date.format(f, 'Y-m-d');
                                this.$el.find('#inCityDate').text(nDate);
                                this.$el.find('.hours').text(this.formatTimes(dutyBarginTime.getHours()) + ':' + this.formatTimes(dutyBarginTime.getMinutes()));
                                this.LastInCitySelectDateTime.set({ times: dutyBarginTime.valueOf() }, this.flightCode);
                                return;
                            } else if (operaOrderTime < dutyBarginTime && operaOrderTime <= air && operaOrderTime <= dutyEndTime && dutyEndTime <= air) {
                                var f = new Date(dutyEndTime);
                                var nDate = cBase.Date.format(f, 'Y-m-d');
                                this.$el.find('#inCityDate').text(nDate);
                                this.$el.find('.hours').text(this.formatTimes(dutyEndTime.getHours()) + ':' + this.formatTimes(dutyEndTime.getMinutes()));
                                this.LastInCitySelectDateTime.set({ times: dutyEndTime.valueOf() }, this.flightCode);
                                return;
                            } else {
                                this.$el.find('#inCityDate').text('无效日期');
                                this.$el.find('.hours').text('无效');
                                this.LastInCitySelectDateTime.set({ times: false }, this.flightCode);
                                return;
                            }
                        }
                    } else {
                        this.$el.find('#inCityDate').text('无效日期');
                        this.$el.find('.hours').text('无效');
                        this.LastInCitySelectDateTime.set({ times: false }, this.flightCode);
                        return;
                    }
                }
            }
        },
        storgeDeal: function (callback) {
            this.flightDetailModel.excute(function (data) {
                var cinfo = this.selectCityStore.get(this.flightCode);
                var selinfo = this.flightSelectedStore.get().depart;
                this.flightCode = selinfo.flight.flightNo + selinfo.cabin.price;
                if (cinfo) {
                    var isInsurance = data && data.insurances[0] && data.insurances[0].sites && data.insurances[0].sites.indexOf(cinfo.site) >= 0;
                    // && this.LastInCitySelectDateTime && this.LastInCitySelectDateTime.get()) {
                    var self = this;
                    this.dutyBtime = $.trim(this.selectCityStore.get().btime);
                    this.dutyEtime = $.trim(this.selectCityStore.get().etime);
                    this.$el.find("#address").text(self.selectCityStore.get().address + (isInsurance ? '' : ' (不支持保险)'));
                } else {
                    var inStorageData = this.zqInCityDateAndAddressStore.get(this.flightCode);
                    if (inStorageData && inStorageData.zqInfo) {
                        this.selectCityStore.set(inStorageData.zqInfo, this.flightCode);
                        this.LastInCitySelectDateTime.set({ times: inStorageData.time }, this.flightCode);
                        this.dutyBtime = $.trim(this.selectCityStore.get().btime);
                        this.dutyEtime = $.trim(this.selectCityStore.get().etime);
                        this.$el.find("#address").text(this.selectCityStore.get().address + (isInsurance ? '' : ' (不支持保险)'));
                    }
                }
                callback.call(this);
            }, function (e) {
                this.forward('list');
            }, false, this);
        },
        pickerDate: function (e) {
            var times = this.LastInCitySelectDateTime.get(this.flightCode);
            if (times) {
                this.calendar.setDate({
                    'start': new Date(times.times)
                });
            }
            this.calendar.show();
        },
        updateSelectDate: function (days) {
            var cur = this.getServerDate();
            var d = this.realStartDate || cur;
            var endD = (new cBase.Date(cur)).addDay(days).valueOf();
            var dates = this.calendar.getDate();
            var start = dates.start;
            this.calendar.update({
                'validStartDate': this.rdate.start,
                'validEndDate': this.rdate.end
            });
        },
        plusTime: function (e) {
            if (this.LastInCitySelectDateTime.get(this.flightCode) && this.LastInCitySelectDateTime.get().times && this.dutyEtime) {
                var dutyBarginTime = new Date(this.LastInCitySelectDateTime.get().times);
                var dutyEndTime = new Date(this.LastInCitySelectDateTime.get().times);
                var orderTimeStore = new Date(this.LastInCitySelectDateTime.get().times);
                var orderTime = new Date(this.LastInCitySelectDateTime.get().times);
                var operaOrderTime = new Date(this.getServerDate());
                var air = new Date(this.airTakeOff);
                var h1 = this.dutyEtime.substr(0, 2);
                var m1 = this.dutyEtime.substr(2, 4);
                var h0 = this.dutyBtime.substr(0, 2);
                var m0 = this.dutyBtime.substr(2, 4);
                dutyBarginTime.setHours(h0, m0, 0, 0);
                dutyEndTime.setHours(h1, m1, 0, 0);
                air.setHours(air.getHours() - 2);
                orderTimeStore.setMinutes(orderTimeStore.getMinutes() + 30);
                if (orderTimeStore <= dutyEndTime && orderTimeStore < air) {
                    var f = new Date(orderTimeStore);
                    var nDate = cBase.Date.format(f, 'Y-m-d');
                    this.$el.find('#inCityDate').text(nDate);
                    var h = ((orderTimeStore.getHours()).toString().length == 1) ? "0" + orderTimeStore.getHours() : orderTimeStore.getHours();
                    var m = ((orderTimeStore.getMinutes()).toString().length == 1) ? "0" + orderTimeStore.getMinutes() : orderTimeStore.getMinutes()
                    this.$el.find('.hours').text(h + ":" + m);
                    this.$el.find('.deduct-time').removeClass('num_invalid');
                    this.LastInCitySelectDateTime.set({ times: orderTimeStore.valueOf() }, this.flightCode);
                } else {
                    $(e.currentTarget).addClass('num_invalid');
                }
            }
        },
        deductTime: function (e) {
            if (this.LastInCitySelectDateTime.get(this.flightCode) && this.LastInCitySelectDateTime.get().times && this.dutyEtime) {
                var dutyBarginTime = new Date(this.LastInCitySelectDateTime.get().times);
                var dutyEndTime = new Date(this.LastInCitySelectDateTime.get().times);
                var orderTimeStore = new Date(this.LastInCitySelectDateTime.get().times);
                var orderTime = new Date(this.LastInCitySelectDateTime.get().times);
                var operaOrderTime = new Date(this.getServerDate());
                var air = new Date(this.airTakeOff);
                var h1 = this.dutyEtime.substr(0, 2);
                var m1 = this.dutyEtime.substr(2, 4);
                var h0 = this.dutyBtime.substr(0, 2);
                var m0 = this.dutyBtime.substr(2, 4);
                dutyBarginTime.setHours(h0, m0, 0, 0);
                dutyEndTime.setHours(h1, m1, 0, 0);
                operaOrderTime.getHours();
                air.setHours(air.getHours() - 2);
                orderTimeStore.setMinutes(orderTimeStore.getMinutes() - 30);
                // if (operaOrderTime <= orderTimeStore && dutyBarginTime <= orderTimeStore && orderTimeStore < air) {
                if (operaOrderTime <= orderTimeStore && dutyBarginTime <= orderTimeStore && orderTimeStore < air) {
                    var f = new Date(orderTimeStore);
                    var nDate = cBase.Date.format(f, 'Y-m-d');
                    this.$el.find('#inCityDate').text(nDate);
                    this.$el.find('.plus-time').removeClass('num_invalid');
                    var h = ((orderTimeStore.getHours()).toString().length == 1) ? "0" + orderTimeStore.getHours() : orderTimeStore.getHours();
                    var m = ((orderTimeStore.getMinutes()).toString().length == 1) ? "0" + orderTimeStore.getMinutes() : orderTimeStore.getMinutes()

                    this.$el.find('.hours').text(h + ":" + m);
                    //this.$el.find('.hours').text(orderTimeStore.getHours() + ':' + orderTimeStore.getMinutes());
                    this.LastInCitySelectDateTime.set({ times: orderTimeStore.valueOf() }, this.flightCode);
                } else {
                    $(e.currentTarget).addClass('num_invalid');
                }
            }
        },
        initAvailableDate: function () {
            if (this.dateStorage && this.dateStorage.get()) {
                var orderDate = this.dateStorage.get().date;
                var compareOrderDate = new Date(orderDate);
                var compareAirTakeOffTime = new Date(this.airTakeOff);
                var h1 = this.dutyEtime.substr(0, 2);
                var m1 = this.dutyEtime.substr(2, 4);
                compareAirTakeOffTime.setHours(0, 0, 0, 0);
                compareOrderDate.setHours(0, 0, 0, 0);
                this.compareOrderAirLeaveTime = (compareAirTakeOffTime - compareOrderDate) / 86400000;
                if (this.compareOrderAirLeaveTime >= 0) {
                    this.updateSelectDate(this.compareOrderAirLeaveTime);
                }
            }
        },
        initAvailableDate2: function () {
            if (this.dateStorage && this.dateStorage.get()) {
                var orderDate = this.dateStorage.get().date;
                var compareOrderDate = new Date(orderDate);
                var compareAirTakeOffTime = new Date(this.airTakeOff);
                compareAirTakeOffTime.setHours(0, 0, 0, 0);
                compareOrderDate.setHours(0, 0, 0, 0);
                this.compareOrderAirLeaveTime = (compareAirTakeOffTime - compareOrderDate) / 86400000;
            }
        },
        onCreate: function () {
            this.render();
            this.createCalendar();
        },
        onLoad: function () {
            if (this.flightSelectedStore.get() && this.flightSelectedStore.get().depart) {
                var self = this;
                this.airTakeOff = new Date(cBase.Date.parse(self.flightSelectedStore.get().depart.flight.dTime, true));
            } else {
                this.showMessage('已超时,请重新选择航班');
                var self = this;
                window.setTimeout(function () {
                    self.back('list');
                }, 2000);
                return;
            }
            var d = new Date(this.getServerDate());
            var v = d.valueOf();
            this.dateStorage.set({ date: v });
            this.initAvailableDate2();
            this.turning();
            this.storgeDeal($.proxy(function () {
                this.initTimes(this.getServerDate(), this.airTakeOff);
                if (this.dutyBtime) this.initAvailableDate();
            }, this));
        },
        onShow: function () {},
        onHide: function (toview) {},
        //设置某一天的开始时间和结束时间
        buildValidTime: function (time, range) {
            var sh = $.trim(range.start).substr(0, 2),
            sm = $.trim(range.start).substr(3, 2),
            eh = $.trim(range.end).substr(0, 2),
            em = $.trim(range.end).substr(3, 2);
            var start = new Date(time.valueOf());
            var end = new Date(time.valueOf());
            var h = 60 * 60 * 1000;
            start.setHours(sh, sm, 0, 0);
            end.setHours(eh, em, 0, 0);
            return {
                start: start,
                end: end,
                now: new Date((time > start ? time : start).valueOf()),
                def: new Date((time > start ? time : start).valueOf() + h)
            };
        },
        //获得一个可用的取票日期范围
        buildValidDate: function (startDate, endDate, range) {
            startDate = new Date(startDate.valueOf());
            endDate = new Date(endDate.valueOf());
            var rdate = this.buildValidTime(startDate, range);
            var h = 60 * 60 * 1000;
            if (startDate.valueOf() + h < rdate.start) {
                startDate = new Date(rdate.start.valueOf());
                startDate.setHours(8, 0, 0, 0);
            } else if (startDate.valueOf() + h > rdate.end) {
                startDate = new Date(rdate.end.valueOf() + h * 24);
            }
            if (startDate.valueOf() > endDate.valueOf() - 2 * h) {
                startDate = new Date(endDate.valueOf() - 2 * h);
            }
            var sdate = this.buildValidTime(startDate, range);
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(0, 0, 0, 0);
            return {
                //日期开始
                start: startDate,
                //日期结束
                end: endDate
            };
        }
    });
    return View;
});