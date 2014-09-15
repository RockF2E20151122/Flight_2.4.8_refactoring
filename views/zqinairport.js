define(['libs', 'c', 'FlightModel', 'FlightStore', 'CommonStore', buildViewTemplatesPath('zqinairport.html'), 'cWidgetFactory', 'cWidgetCalendar'], function (libs, c, FlightModel, FlightStore, CommonStore, html, WidgetFactory) {
    var cBase = c.base;
    //od add 用户需点击完成以后才会更新配送方式
    var TYPE = 16;
    var Calendar = WidgetFactory.create('Calendar');

    var View = c.view.extend({
        flightModel: FlightModel.zqInAirportSelectModel.getInstance(),
        flightSearchStore: FlightStore.FlightSearchStore.getInstance(),
        flightStore: FlightStore.zqInAirportSelectStore.getInstance(),
        flightSelectedStore: FlightStore.FlightSelectedInfo.getInstance(),
        dateStorge: FlightStore.zqInAirportDateStore.getInstance(),
        LastzqInAirportSelectDateTime: FlightStore.LastzqInAirportSelectDateTime.getInstance(),
        zqInAirportDateAndAddressStore: FlightStore.zqInAirportDateAndAddressStore.getInstance(),
        userStore: CommonStore.UserStore.getInstance(),
        flightPickTicketSelectStore: FlightStore.FlightPickTicketSelectStore.getInstance(),
        flightDetailModel: FlightModel.FlightDetailModel.getInstance(), //航班详情数据Model
        tpl: html,
        pageid: '214036',
        render: function () {
            this.viewdata.req = this.request;
            this.$el.html(this.tpl);
            this.els = {};
        },
        getAddress: function (callback) {
            this.flightModel.setParam(this.buildParam());
            var self = this;
            this.showLoading();
            this.flightModel.excute(function (data) {
                this.hideLoading();
                this.defautsAddr(data);
            }, function () {
                this.showMessage('可能网络有点问题,重新加载吧!');
                this.hideLoading();
            }, false, this);
        },
        returnAddrs: function (arr, tp) {
            for (var i = 0; i < arr.length; i++) {
                if (arr[i].type === tp) {
                    return arr[i].addrs;
                }
            }
        },
        defautsAddr: function (data) {
            if (data.deliveries.length > 0) {
                var data = this.returnAddrs(data.deliveries, 16);
                var data = data[0];
                //var data = data.deliveries[2].addrs[0];
                var dcity = this.flightSearchStore.getSearchDetails(0, 'dCtyCode');
                var acity = this.flightSearchStore.getSearchDetails(0, 'aCtyCode');
                var citykey = dcity + acity;
                if (data) {
                    this.flightStore.set({
                        address: data.name,
                        btime: data.btime,
                        etime: data.etime,
                        dstr: data.dstr,
                        ext: data.ext,
                        fee: data.fee,
                        flag: data.flag,
                        id: data.id,
                        port: data.port,
                        rule: data.rule,
                        site: data.site
                    }, citykey);
                }
                this.showStorageAddress();
            }
        },
        buildParam: function () {
            var selected = this.flightSelectedStore.get(),
                searchInfo = this.flightSearchStore.get();
            if (!selected) {
                this.showMessage('操作已超时,请重新选择航班');
                var self = this;
                window.setTimeout(function () {
                    self.back();
                }, 2000);
                return;
            }
            var param = {};
            param.ticketIssueCty = searchInfo.items[0].dCtyCode;
            param.tripType = searchInfo.tripType;
            param.ver = 0;
            var items = [{
                aCty: searchInfo.items[0].aCtyCode,
                dCty: searchInfo.items[0].dCtyCode,
                class: 0,
                dDate: searchInfo.items[0].date,
                flightNo: selected.depart.flight.flightNo,
                price: selected.depart.cabin.price,
                productType: selected.depart.cabin.productType,
                subClass: selected.depart.cabin.subClass
            }];
            if (param.tripType == 2 && searchInfo.items[1]) {
                items.push({
                    aCty: searchInfo.items[1].aCtyCode,
                    dCty: searchInfo.items[1].dCtyCode,
                    class: 0,
                    dDate: searchInfo.items[1].date,
                    flightNo: selected.arrive.flight.flightNo,
                    price: selected.arrive.cabin.price,
                    productType: selected.arrive.cabin.productType,
                    subClass: selected.arrive.cabin.subClass
                });
            }
            param.items = items;
            return param;
        },
        createCalendar: function () {
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
                Months: 4,
                callback: function (date) {
                    if (!self.dutyBtime) {
                        self.showMessage('请选择地址');
                        return;
                    }
                    self.dateStorge.set({ date: date.valueOf() });
                    this.hide();
                    self.selectCalendarDate(self.getServerDate(), self.airTakeOff);
                },
                classNames: 'calen-cls'
            });
        },
        showStorageDate: function () {
            if (this.dateStorge && this.dateStorge.get()) {
                var d = this.dateStorge.get().date;
                var v = cBase.Date.parse(d).format('Y-m-d');
                this.$el.find('#zq-inairport-data').text(v);
            }
        },
        showStorageAddress: function () {
            var dcity = this.flightSearchStore.getSearchDetails(0, 'dCtyCode');
            var acity = this.flightSearchStore.getSearchDetails(0, 'aCtyCode');
            var citykey = dcity + acity;
            this.flightDetailModel.excute(function (data) {
                var cinfo = this.flightStore.get()
                if (cinfo) {
                    var isInsurance = data && data.insurances && data.insurances.length>0 && data.insurances[0] && data.insurances[0].sites && data.insurances[0].sites.indexOf(cinfo.site) >= 0;
                    this.dutyBtime = $.trim(this.flightStore.get().btime);
                    this.dutyEtime = $.trim(this.flightStore.get().etime);
                    this._calculateValidDate(this.getServerDate().valueOf(), this.airTakeOff);
                    this.initAvailableDate();
                    var v = this.flightStore.get().address;
                    this.$el.find('#done-address').text(v + (isInsurance ? '' : ' (不支持保险)'));
                }
                this.initTimes(this.getServerDate(), this.airTakeOff);
            }, function () {
                this.forward('list');
            }, false, this);
        },
        events: {
            'click #date-picker': 'datePicker',
            'click #zqairport-pickker': 'zqairportPickker',
            'click #js_return': 'goBack',
            'click .deduct-time': 'deductTime',
            'click .plus-time': 'plusTime',
            'click #finished': 'finished'
        },
        finished: function () {
            if (this.flightStore.get() && this.flightStore.get().address && this.LastzqInAirportSelectDateTime.get() && this.LastzqInAirportSelectDateTime.get().times) {
                var self = this;
                this.zqInAirportDateAndAddressStore.set({ time: self.LastzqInAirportSelectDateTime.get().times, zqInfo: self.flightStore.get() });
            }
            // } else {
            //     this.showMessage('请完善自取信息');
            //     return;
            // }
            this.flightPickTicketSelectStore.setAttr('type', TYPE);
            this.LastzqInAirportSelectDateTime.remove();
            this.flightStore.remove();
            this.dateStorge.remove();
            this.forward('bookinginfo');
        },
        updateSelectDate: function (days) {},
        initAvailableDate: function () {
            var odate = this.dateStorge.get();
            if (this.dateStorge && odate) {
                var orderDate = odate.date;
                var compareOrderDate = new Date(odate.date);
                var compareAirTakeOffTime = new Date(this.airTakeOff);
                compareAirTakeOffTime.setHours(0, 0, 0, 0);
                compareOrderDate.setHours(0, 0, 0, 0);
                this.compareOrderAirLeaveTime = (compareAirTakeOffTime - compareOrderDate) / 86400000;
                if (this.compareOrderAirLeaveTime >= 0) {
                    this.updateSelectDate(this.compareOrderAirLeaveTime);
                }
            }
        },
        // --------------------Edited by Michael.Lee----------------
        deductTime: function (e) {
            if (this.LastzqInAirportSelectDateTime && this.LastzqInAirportSelectDateTime.get().times) {
                var dutyBarginTime = new Date(this.LastzqInAirportSelectDateTime.get().times);
                var dutyEndTime = new Date(this.LastzqInAirportSelectDateTime.get().times);
                var pluseTime30 = new Date(this.LastzqInAirportSelectDateTime.get().times);
                var orderTime = new Date(this.getServerDate());
                var air = new Date(this.airTakeOff);
                if (!this.dutyBtime) {
                    this.showMessage('请选择地址');
                    return;
                }
                var h0 = this.dutyBtime.substr(0, 2);
                var m0 = this.dutyBtime.substr(2, 4);
                var h1 = this.dutyEtime.substr(0, 2);
                var m1 = this.dutyEtime.substr(2, 4);
                dutyBarginTime.setHours(h0, m0, 0, 0);
                dutyEndTime.setHours(h1, m1, 0, 0);
                air.setHours(air.getHours() - 2);
                pluseTime30.setMinutes(pluseTime30.getMinutes() - 30);
                if (this._isCorrect(pluseTime30.getTime())) {
                    this.$el.find('.deduct-time').removeClass('num_invalid');
                    var dateStr = (new cBase.Date(pluseTime30)).format('Y-m-d');
                    var timeStr = this._parseTime(pluseTime30);
                    this._setDateAndTimeToUi(dateStr, timeStr);
                    this.LastzqInAirportSelectDateTime.set({ times: pluseTime30.valueOf() });
                } else {
                    $(e.currentTarget).addClass('num_invalid');
                }
                return;
            }
        },
        plusTime: function (e) {
            if (this.LastzqInAirportSelectDateTime && this.LastzqInAirportSelectDateTime.get().times) {
                var dutyBarginTime = new Date(this.LastzqInAirportSelectDateTime.get().times);
                var dutyEndTime = new Date(this.LastzqInAirportSelectDateTime.get().times);
                var pluseTime30 = new Date(this.LastzqInAirportSelectDateTime.get().times);
                var orderTime = new Date(this.getServerDate());
                var air = new Date(this.airTakeOff);
                if (!this.dutyBtime) {
                    this.showMessage('请选择地址');
                    return;
                }
                var h0 = this.dutyBtime.substr(0, 2);
                var m0 = this.dutyBtime.substr(2, 4);
                var h1 = this.dutyEtime.substr(0, 2);
                var m1 = this.dutyEtime.substr(2, 4);
                dutyBarginTime.setHours(h0, m0, 0, 0);
                dutyEndTime.setHours(h1, m1, 0, 0);
                air.setHours(air.getHours() - 2);
                pluseTime30.setMinutes(pluseTime30.getMinutes() + 30);
                if (this._isCorrect(pluseTime30.getTime())) {
                    this.$el.find('.deduct-time').removeClass('num_invalid');
                    var dateStr = (new cBase.Date(pluseTime30)).format('Y-m-d');
                    var timeStr = this._parseTime(pluseTime30);
                    this._setDateAndTimeToUi(dateStr, timeStr);
                    this.LastzqInAirportSelectDateTime.set({ times: pluseTime30.valueOf() });
                } else {
                    $(e.currentTarget).addClass('num_invalid');
                }
                return;
            }
        },
        _isCorrect: function (time) {
            var dailyAvailableTime = this._getDailyAvailableTime(time);
            var resultTime = this._getAvailableTime(dailyAvailableTime, time);
            return time == resultTime;
        },
        _updateSelectDate: function () {
            this.calendar.update({
                'validStartDate': new Date(this.validDate.startValidTime),
                'validEndDate': new Date(this.validDate.endValidTime)
            });
            if (this.LastzqInAirportSelectDateTime.get() && this.LastzqInAirportSelectDateTime.get().times) {
                this.calendar.setDate({ start: new Date(this.LastzqInAirportSelectDateTime.get().times) });
            } else {
                this.calendar.setDate({ start: new Date(this.validDate.endValidTime) });
            }
        },
        _calculateValidDate: function (serverTime, airTakeOffTime) {
            var startValidTime = serverTime + 2 * 60 * 60 * 1000;
            var endValidTime = airTakeOffTime - 2 * 60 * 60 * 1000;
            this.validDate = {
                startValidTime: startValidTime,
                endValidTime: endValidTime
            }
            var observedTime = this._getDailyAvailableTime(startValidTime);
            if (this.validDate.startValidTime > observedTime.endValidTime) {
                this.validDate.startValidTime = observedTime.startValidTime + 24 * 60 * 60 * 1000;
            };
            observedTime = this._getDailyAvailableTime(endValidTime);
            if (this.validDate.endValidTime < observedTime.startValidTime) {
                this.validDate.endValidTime = observedTime.endValidTime - 24 * 60 * 60 * 1000;
            };
        },
        _setDateAndTimeToUi: function (date, time, callback) {
            this.$el.find('#zq-inairport-data').text(date);
            this.$el.find('.hours').text(time);
            this.$el.find('.room_num i').removeClass('num_invalid');
            if (typeof callback == 'function') callback();
        },
        _setHoursAndMinutesByServer: function (serverLimit, targetTime) {
            var targetDate = new Date(targetTime);
            var startHour = window.parseInt(serverLimit / 100);
            var startMinute = window.parseInt(serverLimit) % 100;
            targetDate.setHours(startHour, startMinute, 0, 0);
            return targetDate.getTime();
        },
        _getDailyAvailableTime: function (targetTime) {
            if (typeof targetTime == 'string') {
                targetTime = window.parseInt(targetTime);
            };
            var startTime = this._setHoursAndMinutesByServer(this.dutyBtime, targetTime);
            var endTime = this._setHoursAndMinutesByServer(this.dutyEtime, targetTime);
            var result = {
                startValidTime: startTime,
                endValidTime: endTime
            }
            return result;
        },
        _setHoursAndMinutes: function (origin, target) {
            var originDate = new Date(origin);
            var targetDate = new Date(target);
            targetDate.setHours(originDate.getHours(), originDate.getMinutes());
            return targetDate.getTime();
        },
        _getAvailableTime: function (avail, target) {
            var result = target;
            if (target < avail.startValidTime) {
                result = avail.startValidTime;
            } else if (target > avail.endValidTime) {
                result = avail.endValidTime;
            }
            if (result < this.validDate.startValidTime) {
                result = this.validDate.startValidTime;
            } else if (result > this.validDate.endValidTime) {
                result = this.validDate.endValidTime;
            }
            return result;
        },
        _parseTime: function (time) {
            var date = new Date(time);
            var hour = ((date.getHours()).toString().length == 1) ? "0" + date.getHours() : date.getHours();
            var minute = ((date.getMinutes()).toString().length == 1) ? "0" + date.getMinutes() : date.getMinutes();
            return hour + ':' + minute;
        },
        _checkDateAvailable: function (selectedTime) {
            var beginDate = new Date(this.validDate.startValidTime);
            var beginTime = beginDate.setHours(0, 0, 0, 0);
            if (selectedTime && (selectedTime >= beginTime) && (selectedTime <= this.validDate.endValidTime)) {
                var dailyAvailableTime = this._getDailyAvailableTime(selectedTime);
                if (this.LastzqInAirportSelectDateTime.get() && this.LastzqInAirportSelectDateTime.get().times) {
                    var parseTime = this._setHoursAndMinutes(this.LastzqInAirportSelectDateTime.get().times, selectedTime);
                    var resultTime = this._getAvailableTime(dailyAvailableTime, parseTime);
                    var timeStr, dateStr;
                    if (parseTime == resultTime) {
                        timeStr = this._parseTime(resultTime);
                        dateStr = (new cBase.Date(resultTime)).format('Y-m-d');
                    } else {
                        resultTime = this._getAvailableTime(dailyAvailableTime, selectedTime);
                        timeStr = this._parseTime(resultTime);
                        dateStr = (new cBase.Date(resultTime)).format('Y-m-d');
                    }
                    this._setDateAndTimeToUi(dateStr, timeStr);
                    this.LastzqInAirportSelectDateTime.set({ times: resultTime });
                } else {
                    var resultTime = this._getAvailableTime(dailyAvailableTime, selectedTime);
                    var timeStr = this._parseTime(resultTime);
                    var dateStr = (new cBase.Date(resultTime)).format('Y-m-d');
                    this._setDateAndTimeToUi(dateStr, timeStr);
                    this.LastzqInAirportSelectDateTime.set({ times: resultTime });
                }

            } else {
                var that = this;
                var callback = function () {
                    that.$el.find('.room_num i').addClass('num_invalid');
                    that.showMessage('无有效时间,请选择其它时间');
                    that.LastzqInAirportSelectDateTime.set({ times: false });
                }
                this._setDateAndTimeToUi('无效日期', '无效', callback);
            }
        },
        selectCalendarDate: function (CurrentTime, airTakeOff) {
            if (!this.flightStore.get() || !this.flightStore.get().address) {
                return this.showMessage('请选择地址');
            };
            var selectedTime = this.dateStorge.get().date;
            this._checkDateAvailable(selectedTime);
            return;
        },
        initTimes: function (CurrentTime, airTakeOff) {
            if (!this.dutyBtime) return;
            this.$el.find('.room_num i').removeClass('num_invalid');
            if (this.LastzqInAirportSelectDateTime.get() && this.LastzqInAirportSelectDateTime.get().times) {
                var selectedTime = window.parseInt(this.LastzqInAirportSelectDateTime.get().times);
                var beginDate = new Date(this.validDate.startValidTime);
                var beginTime = beginDate.setHours(0, 0, 0, 0);
                if (selectedTime && (selectedTime >= beginTime) && (selectedTime <= this.validDate.endValidTime)) {

                } else {
                    var dailyAvailableTime = this._getDailyAvailableTime(selectedTime);
                    // var parseTime =this._setHoursAndMinutes(this.LastzqInAirportSelectDateTime.get().times, selectedTime);
                    var selectedTime = this._getAvailableTime(dailyAvailableTime, selectedTime);
                }
                this._checkDateAvailable(selectedTime);
            } else if (this.validDate.endValidTime) {
                this._checkDateAvailable(this.validDate.endValidTime);
            }
            return;
        },
        datePicker: function () {
            if (this.calendar || this.createCalendar()) {
                this._updateSelectDate();
                this.calendar.show();
            }
        },
        // --------------------------------------------------------
        goBack: function () {
            this.LastzqInAirportSelectDateTime.remove();
            this.flightStore.remove();
            this.forward('zqinpickticketselect');
        },
        zqairportPickker: function () {
            this.forward('zqInAirportSelect');
        },
        onCreate: function () {
            this.render();
        },
        onLoad: function () {
            if (this.flightSelectedStore.get() && this.flightSelectedStore.get().depart) {
                var self = this;
                this.airTakeOff = cBase.Date.parse(self.flightSelectedStore.get().depart.flight.dTime, true);
            } else {
                this.showMessage('操作已超时,请重新选择航班');
                var self = this;
                window.setTimeout(function () {
                    self.back('list');
                }, 2000)
                return;
            }
            var d = new Date((this.getServerDate()).valueOf());
            var v = d.valueOf();
            this.dateStorge.set({ date: v });
            if (this.flightStore.get() && this.flightStore.get().address) {

            } else {
                var inStorageData = this.zqInAirportDateAndAddressStore.get();
                if (inStorageData && inStorageData.zqInfo) {
                    this.LastzqInAirportSelectDateTime.set({ times: inStorageData.time });
                    this.flightStore.set(inStorageData.zqInfo);
                };
            }
            if (this.flightStore.get() && this.flightStore.get().address) {
                this.showStorageAddress();
            } else {
                this.getAddress();
            }

            this.turning();
        },
        onShow: function () {
            this.setTitle('机场自取');
            this.createCalendar();
        },
        onHide: function () { }
    });
    return View;
});