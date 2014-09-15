define(['cHolidayPriceCalendar', 'FlightModel', 'FlightStore', 'CommonStore', 'c'], function (HolidayPriceCalendar, FlightModel, FlightStore, CommonStore, c) {
    var flightSearchStore = FlightStore.FlightSearchStore.getInstance(),
        lowestPriceSearchStore = FlightStore.LowestPriceSearchStore.getInstance(),
        salesStore = CommonStore.SalesObjectStore.getInstance(),
        cBase = c.base,
        lowestPrice = FlightModel.LowestPriceSearchModel.getInstance(),
        lowestPriceJson = {},
        lowestPriceDay = {};

    var calendar = {
        CreateCalendar: function (that, calback, datetype) {

            //获取低价日历数据
            lowestPriceJson.head = { "auth": null, "errcode": 0 };
            var tempPrice = new Array();
            //如果是返程
            if (datetype == 'back') {
                lowestPrice.setParam({
                    aCty: flightSearchStore.getSearchDetails(0, 'dCtyCode'),
                    dCty: flightSearchStore.getSearchDetails(0, 'aCtyCode')
                })
            }
            else {
                lowestPrice.setParam({
                    aCty: flightSearchStore.getSearchDetails(0, 'aCtyCode'),
                    dCty: flightSearchStore.getSearchDetails(0, 'dCtyCode')
                })
            }
            // that.showLoading();
            lowestPrice.excute(function (data, originData, isAjax) {
                data.prices = data.prices || [];
                for (var i = 0, len = data['prices'].length; i < len; i++) {
                    data['prices'][i]['dDate'] = new Date(data['prices'][i]['dDate'].replace(/-/g, '/'));
                    lowestDayKey = cBase.Date.format(data['prices'][i]['dDate'], 'Y/m/d');
                    lowestPriceDay[lowestDayKey] = data['prices'][i]['price'];
                }

                tempPrice = data['prices'];
                lowestPriceJson.prices = tempPrice;

                //计算跨3个月还是4个月
                var testDate = HolidayPriceCalendar.serverDate,
                    year = testDate.getFullYear(),
                    mon = testDate.getMonth(),
                    day = testDate.getDate(),
                    numNum;

                for (var validDates = [], i = 0, s = 365; s > i; i++) {
                    validDates[i] = {
                        date: lowestPriceJson.prices[i] ? lowestPriceJson.prices[i]['dDate'] : cBase.Date.parse(cBase.Date.format(testDate, 'Ymd')).addDay(i).date,
                        price: lowestPriceJson.prices[i] ? lowestPriceJson.prices[i]['price'] : ''
                    };
                }
                var dcity, acity;
                //如果是返程
                if (datetype == 'back') {
                    dcity = flightSearchStore.getSearchDetails(0, 'acityName'),
                    acity = flightSearchStore.getSearchDetails(0, 'dcityName');
                } else {
                    dcity = flightSearchStore.getSearchDetails(0, 'dcityName'),
                    acity = flightSearchStore.getSearchDetails(0, 'acityName');
                }


                var onwardTime = flightSearchStore.getAttr('_items')[0]['date'];
                var departTime = cBase.Date.format(onwardTime, 'Y-m-d');
                var endTime = flightSearchStore.getAttr('_items').length > 1 ? cBase.Date.format(flightSearchStore.getAttr('_items')[1]['date'], 'Y-m-d') : null;
                var lastTime = cBase.Date.format(new cBase.Date(testDate).addDay(364), 'Y-m-d');
                var calendar = new HolidayPriceCalendar({
                    header: {
                        title: '<span class="jPriceTitle">低价日历</span><span class="jPriceCity">' + dcity + '-' + acity + '</span>',
                        tel: '4000086666',
                        home: true,
                        homeHandler: function () {
                            //返回H5首页
                            var salesInfo = salesStore.get();

                            if (salesInfo && salesInfo.sid && +salesInfo.sid == 1896) {
                                window.location = "map://leftClick()";
                            } else {
                                that.jump('/html5/', true);
                            }

                        }
                    },
                    monthsNum: 13,
                    //voidInvalid: true,//默认空的为无效
                    format: 'Y-m-d',
                    priceDate: validDates,
                    onShow: function (e) {
                        this.findMinPrice();
                        that.hideLoading();
                        that.isShowData = false;
                        $(".cui_cldweek").css("top","43px");
                        setTimeout(function () {
                            that.__hide();
                        }, 500);

                        this.$el.find('.cui_cld_daycrt').removeClass('cui_cld_daycrt');
                        try {

                            var starttime = datetype == "start" ? cBase.Date.format(testDate, 'Y/m/d') : cBase.Date.format(onwardTime, 'Y/m/d')
                            this.$el.find(".cui_cld_daybox li").each(function (i, li) {
                                if (new Date($(li).data("date")) < new Date(starttime)) {
                                    $(this).removeClass();
                                    $(this).addClass('cui_cld_daypass invalid');
                                }

                            });
                            if (datetype == "back") {
                                this.$el.find('[data-date="' + endTime + '"]').addClass('cui_cld_daycrt');
                                this.$el.find('[data-date="' + endTime + '"] em').text('返回');
                            } else {
                                this.$el.find('[data-date="' + departTime + '"]').addClass('cui_cld_daycrt');
                                this.$el.find('[data-date="' + departTime + '"] em').text('出发');
                            }
                            flagHightLight = 0;
                        } catch (err) {

                        }

                       this.$el[0].offsetHeight;  //读取header的高度，强制回流
                    },
                    onHide: function () {
                        that.hideLoading();
                        that.__show();
                        $('body').data('cui-date', '');
                        this.remove();
                        that.isShowData = true;
                    },
                    callback: function (date, dateStyle, target) {
                        this.hide();
                        //要查询90天的数据
                        //var dateinfo = this.getDateInfo(date);
                        var d = c.utility.Date.format(date, 'Y/m/d');
                        this.$el.find('.cui_cld_daycrt').removeClass('cui_cld_daycrt');
                        target.addClass('cui_cld_daycrt');
                        //var title = [{ week: dateStyle.daysShort, holiday: this.getDateDesc(date).desc }];
                        //起飞日期大于返程日期
                        var dates = datetype == "start" ? { 'start': date } : { 'back': date };
                        if (d == cBase.Date.format(lastTime, 'Y/m/d')) {
                            dates.back = cBase.Date.parse(lastTime).date;
                        }
                        else if (endTime && d > cBase.Date.format(endTime, 'Y/m/d') && datetype == "start") {
                            dates.back = cBase.Date.parse(d).addDay(1).date;
                            console.log(this.getDateDesc(dates.back))
                        }
                        calback.call(that, date, datetype, dates);   //更新list页面
                    }
                });
                calendar.show();
                //that.calendar = calendar;
            }, function (e) {
                if (e && e.msg) {
                    setTimeout(function () {
                        that.showToast(e.msg, 0, function () {
                            that.back('index');
                        });
                    }, 1000);
                } else {
                    setTimeout(function () {
                        that.showToast('数据加载失败', 0, function () {
                            that.back('index');
                        });
                    }, 1000);
                }
            }, false, this);

        }
    }

    return calendar;
})